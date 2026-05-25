using AutoMapper;
using Bambi.Data;
using Bambi.Data.Entities;
using Bambi.Repositories.Common;
using Bambi.Repositories.Purchases;
using Bambi.Services.Common;
using Bambi.Services.Dtos.Common;
using Bambi.Services.Dtos.Purchases;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Services.Purchases;

public class PurchaseService : IPurchaseService
{
    private readonly AppDbContext _db;
    private readonly IPurchaseRepository _purchases;
    private readonly IMapper _mapper;

    public PurchaseService(AppDbContext db, IPurchaseRepository purchases, IMapper mapper)
    {
        _db = db;
        _purchases = purchases;
        _mapper = mapper;
    }

    public async Task<PurchaseDto> CreateAsync(int buyerId, CreatePurchaseDto dto)
    {
        // Wrap the listing flip + purchase insert in a transaction so we can't
        // end up with a purchase row pointing at a listing that's still marked
        // available (or vice-versa) if SaveChanges blows up mid-flight.
        await using var tx = await _db.Database.BeginTransactionAsync();

        var listing = await _db.Listings.FirstOrDefaultAsync(l => l.Id == dto.ListingId);
        if (listing == null)
        {
            throw new NotFoundException("Listing not found.");
        }

        if (!listing.IsAvailable)
        {
            throw new ConflictException("Listing is no longer available.");
        }

        if (listing.SellerId == buyerId)
        {
            throw new ForbiddenException("You cannot buy your own listing.");
        }

        var purchase = new Purchase
        {
            BuyerId = buyerId,
            ListingId = listing.Id,
            PricePaid = listing.Price,
            DeliveryAddress = dto.DeliveryAddress,
            Note = dto.Note,
            Status = PurchaseStatus.Pending,
            PurchasedAt = DateTime.UtcNow,
        };

        listing.IsAvailable = false;

        _db.Purchases.Add(purchase);
        _db.Listings.Update(listing);
        await _db.SaveChangesAsync();
        await tx.CommitAsync();

        var fresh = await _purchases.GetByIdAsync(purchase.Id);
        return _mapper.Map<PurchaseDto>(fresh);
    }

    public async Task<PagedResultDto<PurchaseDto>> GetMyPurchasesAsync(
        int buyerId,
        PurchaseStatus? status,
        DateTime? from,
        DateTime? to,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        PagedResult<Purchase> paged = await _purchases.GetByBuyerIdAsync(
            buyerId, status, from, to, sortBy, sortOrder, page, pageSize);
        return ToPagedDto(paged);
    }

    public async Task<PagedResultDto<PurchaseDto>> GetMySalesAsync(
        int sellerId,
        PurchaseStatus? status,
        DateTime? from,
        DateTime? to,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        PagedResult<Purchase> paged = await _purchases.GetBySellerIdAsync(
            sellerId, status, from, to, sortBy, sortOrder, page, pageSize);
        return ToPagedDto(paged);
    }

    public async Task<PurchaseDto> GetByIdAsync(int callerId, int purchaseId)
    {
        var purchase = await _purchases.GetByIdAsync(purchaseId);
        if (purchase == null)
        {
            throw new NotFoundException("Purchase not found.");
        }

        bool isBuyer = purchase.BuyerId == callerId;
        bool isSeller = purchase.Listing.SellerId == callerId;
        if (!isBuyer && !isSeller)
        {
            throw new ForbiddenException("You do not have access to this purchase.");
        }

        return _mapper.Map<PurchaseDto>(purchase);
    }

    public async Task<PurchaseDto> UpdateStatusAsync(int callerId, int purchaseId, UpdatePurchaseStatusDto dto)
    {
        var purchase = await _purchases.GetByIdAsync(purchaseId);
        if (purchase == null)
        {
            throw new NotFoundException("Purchase not found.");
        }

        if (purchase.Listing.SellerId != callerId)
        {
            throw new ForbiddenException("Only the seller can update purchase status.");
        }

        purchase.Status = dto.Status;
        await _purchases.UpdateAsync(purchase);

        var fresh = await _purchases.GetByIdAsync(purchase.Id);
        return _mapper.Map<PurchaseDto>(fresh);
    }

    private PagedResultDto<PurchaseDto> ToPagedDto(PagedResult<Purchase> paged)
    {
        var dtoItems = new List<PurchaseDto>();
        foreach (var purchase in paged.Items)
        {
            dtoItems.Add(_mapper.Map<PurchaseDto>(purchase));
        }

        return new PagedResultDto<PurchaseDto>
        {
            Items = dtoItems,
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalPages = paged.TotalPages,
        };
    }
}
