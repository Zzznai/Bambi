using AutoMapper;
using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Bambi.Repositories.Categories;
using Bambi.Repositories.Common;
using Bambi.Repositories.Listings;
using Bambi.Services.Common;
using Bambi.Services.Dtos.Common;
using Bambi.Services.Dtos.Listings;

namespace Bambi.Services.Listings;

public class ListingService : IListingService
{
    private readonly IListingRepository _listings;
    private readonly ICategoryRepository _categories;
    private readonly IMapper _mapper;

    public ListingService(IListingRepository listings, ICategoryRepository categories, IMapper mapper)
    {
        _listings = listings;
        _categories = categories;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<ListingDto>> GetAllAsync(
        int? categoryId,
        string? size,
        decimal? minPrice,
        decimal? maxPrice,
        int? condition,
        bool? isAvailable,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        PagedResult<Listing> paged = await _listings.GetAllAsync(
            categoryId, size, minPrice, maxPrice, condition, isAvailable,
            sortBy, sortOrder, page, pageSize);
        return ToPagedDto(paged);
    }

    public async Task<ListingDto> GetByIdAsync(int id)
    {
        var listing = await _listings.GetByIdAsync(id);
        if (listing == null)
        {
            throw new NotFoundException("Listing not found.");
        }

        return _mapper.Map<ListingDto>(listing);
    }

    public async Task<PagedResultDto<ListingDto>> GetMyListingsAsync(int sellerId, int page, int pageSize)
    {
        PagedResult<Listing> paged = await _listings.GetBySellerAsync(sellerId, page, pageSize);
        return ToPagedDto(paged);
    }

    public async Task<ListingDto> CreateAsync(int sellerId, CreateListingDto dto)
    {
        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category == null)
        {
            throw new NotFoundException("Selected category does not exist.");
        }

        var listing = new Listing
        {
            Title = dto.Title,
            Description = dto.Description,
            Price = dto.Price,
            Size = dto.Size,
            Condition = (ConditionLevel)dto.Condition,
            CategoryId = dto.CategoryId,
            SellerId = sellerId,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow,
        };

        await _listings.AddAsync(listing);

        var fresh = await _listings.GetByIdAsync(listing.Id);
        return _mapper.Map<ListingDto>(fresh);
    }

    public async Task<ListingDto> UpdateAsync(int callerId, int listingId, UpdateListingDto dto)
    {
        var listing = await _listings.GetByIdAsync(listingId);
        if (listing == null)
        {
            throw new NotFoundException("Listing not found.");
        }

        if (listing.SellerId != callerId)
        {
            throw new ForbiddenException("You can only update your own listings.");
        }

        var category = await _categories.GetByIdAsync(dto.CategoryId);
        if (category == null)
        {
            throw new NotFoundException("Selected category does not exist.");
        }

        listing.Title = dto.Title;
        listing.Description = dto.Description;
        listing.Price = dto.Price;
        listing.Size = dto.Size;
        listing.Condition = (ConditionLevel)dto.Condition;
        listing.CategoryId = dto.CategoryId;

        // Preserve the current availability if the caller didn't send a new value —
        // this stops a routine edit from un-selling a listing that has already sold.
        if (dto.IsAvailable.HasValue)
        {
            listing.IsAvailable = dto.IsAvailable.Value;
        }

        await _listings.UpdateAsync(listing);

        var fresh = await _listings.GetByIdAsync(listing.Id);
        return _mapper.Map<ListingDto>(fresh);
    }

    public async Task DeleteAsync(int callerId, int listingId)
    {
        var listing = await _listings.GetByIdAsync(listingId);
        if (listing == null)
        {
            throw new NotFoundException("Listing not found.");
        }

        if (listing.SellerId != callerId)
        {
            throw new ForbiddenException("You can only delete your own listings.");
        }

        await _listings.DeleteAsync(listing.Id);
    }

    private PagedResultDto<ListingDto> ToPagedDto(PagedResult<Listing> paged)
    {
        var dtoItems = new List<ListingDto>();
        foreach (var listing in paged.Items)
        {
            dtoItems.Add(_mapper.Map<ListingDto>(listing));
        }

        return new PagedResultDto<ListingDto>
        {
            Items = dtoItems,
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalPages = paged.TotalPages,
        };
    }
}
