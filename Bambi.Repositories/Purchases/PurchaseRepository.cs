using Bambi.Data;
using Bambi.Data.Entities;
using Bambi.Repositories.Common;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Repositories.Purchases;

public class PurchaseRepository : IPurchaseRepository
{
    private readonly AppDbContext _db;

    public PurchaseRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Purchase?> GetByIdAsync(int id)
    {
        return await _db.Purchases
            .Include(p => p.Buyer)
            .Include(p => p.Listing)
                .ThenInclude(l => l.Seller)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Purchase>> GetAllAsync()
    {
        return await _db.Purchases.AsNoTracking().ToListAsync();
    }

    public async Task AddAsync(Purchase entity)
    {
        await _db.Purchases.AddAsync(entity);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Purchase entity)
    {
        _db.Purchases.Update(entity);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Purchases.FindAsync(id);
        if (entity == null)
        {
            return;
        }

        _db.Purchases.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public Task<PagedResult<Purchase>> GetByBuyerIdAsync(
        int buyerId,
        PurchaseStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        IQueryable<Purchase> query = _db.Purchases
            .Include(p => p.Listing)
            .AsNoTracking()
            .Where(p => p.BuyerId == buyerId);

        return ApplyFiltersAndPaging(query, status, fromDate, toDate, sortBy, sortOrder, page, pageSize);
    }

    public Task<PagedResult<Purchase>> GetBySellerIdAsync(
        int sellerId,
        PurchaseStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        IQueryable<Purchase> query = _db.Purchases
            .Include(p => p.Listing)
            .Include(p => p.Buyer)
            .AsNoTracking()
            .Where(p => p.Listing.SellerId == sellerId);

        return ApplyFiltersAndPaging(query, status, fromDate, toDate, sortBy, sortOrder, page, pageSize);
    }

    private static async Task<PagedResult<Purchase>> ApplyFiltersAndPaging(
        IQueryable<Purchase> query,
        PurchaseStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        if (fromDate.HasValue)
        {
            query = query.Where(p => p.PurchasedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(p => p.PurchasedAt <= toDate.Value);
        }

        bool descending = false;
        if (!string.IsNullOrWhiteSpace(sortOrder) &&
            string.Equals(sortOrder, "desc", StringComparison.OrdinalIgnoreCase))
        {
            descending = true;
        }

        string normalizedSort = string.Empty;
        if (sortBy != null)
        {
            normalizedSort = sortBy.ToLowerInvariant();
        }

        switch (normalizedSort)
        {
            case "price":
                if (descending)
                {
                    query = query.OrderByDescending(p => p.PricePaid);
                }
                else
                {
                    query = query.OrderBy(p => p.PricePaid);
                }
                break;

            case "status":
                if (descending)
                {
                    query = query.OrderByDescending(p => p.Status);
                }
                else
                {
                    query = query.OrderBy(p => p.Status);
                }
                break;

            case "purchasedat":
                if (descending)
                {
                    query = query.OrderByDescending(p => p.PurchasedAt);
                }
                else
                {
                    query = query.OrderBy(p => p.PurchasedAt);
                }
                break;

            default:
                // Most recent first by default — that's what the UI expects on the
                // "My purchases" and "Orders" pages.
                if (descending)
                {
                    query = query.OrderByDescending(p => p.Id);
                }
                else
                {
                    query = query.OrderByDescending(p => p.PurchasedAt);
                }
                break;
        }

        if (page < 1)
        {
            page = 1;
        }
        if (pageSize < 1)
        {
            pageSize = 10;
        }
        if (pageSize > 100)
        {
            pageSize = 100;
        }

        int total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<Purchase>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
