using AutoMapper;
using Bambi.Data;
using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Bambi.Repositories.Users;
using Bambi.Services.Common;
using Bambi.Services.Dtos.Common;
using Bambi.Services.Dtos.Users;
using Bambi.Services.ListingImages;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Services.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IMapper _mapper;
    private readonly AppDbContext _db;

    public UserService(IUserRepository repo, IMapper mapper, AppDbContext db)
    {
        _repo = repo;
        _mapper = mapper;
        _db = db;
    }

    public async Task<PagedResultDto<UserDto>> GetAllAsync(
        string? username,
        string? city,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        var paged = await _repo.GetAllAsync(username, city, sortBy, sortOrder, page, pageSize);

        var dtoItems = new List<UserDto>();
        foreach (var user in paged.Items)
        {
            dtoItems.Add(_mapper.Map<UserDto>(user));
        }

        return new PagedResultDto<UserDto>
        {
            Items = dtoItems,
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalPages = paged.TotalPages,
        };
    }

    public async Task<UserDto> GetByIdAsync(int id)
    {
        var user = await _repo.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateRoleAsync(int id, UpdateRoleDto dto)
    {
        UserRole role;
        if (!Enum.TryParse<UserRole>(dto.Role, ignoreCase: true, out role))
        {
            throw new BadRequestException("Invalid role. Allowed: User or Admin.");
        }

        var user = await _repo.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        user.Role = role;
        await _repo.UpdateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UpdateProfileAsync(int id, UpdateProfileDto dto)
    {
        var user = await _repo.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // Patch semantics — only the fields the client actually sent get updated.
        if (dto.Description != null)
        {
            user.Description = dto.Description;
        }

        if (dto.City != null)
        {
            user.City = dto.City;
        }

        if (dto.PhoneNumber != null)
        {
            user.PhoneNumber = dto.PhoneNumber;
        }

        if (dto.Email != null)
        {
            user.Email = dto.Email;
        }

        await _repo.UpdateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<UserDto> UploadProfileImageAsync(int userId, IFormFile file, IImageStorage storage)
    {
        var user = await _repo.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // Drop the old avatar from Cloudinary first so we don't leak storage.
        // A failure here isn't fatal — keep going so the user still gets a new pic.
        if (!string.IsNullOrWhiteSpace(user.ProfilePicPublicId))
        {
            try
            {
                await storage.DeleteAsync(user.ProfilePicPublicId);
            }
            catch
            {
                // Swallow — the old picture might already be gone.
            }
        }

        var uploaded = await storage.UploadAsync(file);
        user.ProfilePicUrl = uploaded.Url;
        user.ProfilePicPublicId = uploaded.PublicId;

        await _repo.UpdateAsync(user);
        return _mapper.Map<UserDto>(user);
    }

    public async Task DeleteAsync(int id)
    {
        var user = await _repo.GetByIdAsync(id);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        await _repo.DeleteAsync(user.Id);
    }

    public async Task DeleteMeAsync(int userId)
    {
        var user = await _repo.GetByIdAsync(userId);
        if (user == null)
        {
            throw new NotFoundException("User not found.");
        }

        // Refuse if the user still has live transactions — either as buyer or seller.
        // Forcing a delete here would orphan orders the other side still cares about.
        int activeBuyerPurchases = await _db.Purchases
            .Where(p => p.BuyerId == userId && p.Status != PurchaseStatus.Delivered)
            .CountAsync();
        if (activeBuyerPurchases > 0)
        {
            throw new ConflictException(
                "Cannot delete account with active purchases. " +
                "Please complete or cancel your pending orders first.");
        }

        int activeSales = await _db.Purchases
            .Include(p => p.Listing)
            .Where(p => p.Listing.SellerId == userId && p.Status != PurchaseStatus.Delivered)
            .CountAsync();
        if (activeSales > 0)
        {
            throw new ConflictException(
                "Cannot delete account with active sales. " +
                "Please complete all pending orders first.");
        }

        // Cascade-delete everything the user owns: listings (and their images) and
        // their purchase history. Run it all in one SaveChanges so we don't leave
        // the DB half-cleaned if something fails.
        var listings = await _db.Listings
            .Where(l => l.SellerId == userId)
            .ToListAsync();

        foreach (var listing in listings)
        {
            var images = await _db.ListingImages
                .Where(i => i.ListingId == listing.Id)
                .ToListAsync();
            _db.ListingImages.RemoveRange(images);
        }

        _db.Listings.RemoveRange(listings);

        var purchases = await _db.Purchases
            .Where(p => p.BuyerId == userId)
            .ToListAsync();
        _db.Purchases.RemoveRange(purchases);

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }
}
