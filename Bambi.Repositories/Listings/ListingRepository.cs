using Bambi.Data;
using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Bambi.Repositories.Common;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Repositories.Listings;

public class ListingRepository : IListingRepository
{
    private readonly AppDbContext _db;

    public ListingRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Listing?> GetByIdAsync(int id)
    {
        return await _db.Listings
            .Include(l => l.Seller)
            .Include(l => l.Category)
            .Include(l => l.Images)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<IEnumerable<Listing>> GetAllAsync()
    {
        return await _db.Listings.AsNoTracking().ToListAsync();
    }

    public async Task AddAsync(Listing entity)
    {
        await _db.Listings.AddAsync(entity);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Listing entity)
    {
        _db.Listings.Update(entity);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Listings.FindAsync(id);
        if (entity == null)
        {
            return;
        }

        _db.Listings.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<Listing>> GetAllAsync(
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
        IQueryable<Listing> query = _db.Listings
            .Include(l => l.Seller)
            .Include(l => l.Category)
            .Include(l => l.Images)
            .AsNoTracking();

        if (categoryId.HasValue)
        {
            query = query.Where(l => l.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(size))
        {
            query = query.Where(l => l.Size == size);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(l => l.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(l => l.Price <= maxPrice.Value);
        }

        if (condition.HasValue)
        {
            var level = (ConditionLevel)condition.Value;
            query = query.Where(l => l.Condition == level);
        }

        if (isAvailable.HasValue)
        {
            query = query.Where(l => l.IsAvailable == isAvailable.Value);
        }

        // Sorting — pick the column, then apply the direction. Two plain steps
        // are easier to read than a nested ternary inside a switch expression.
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
                    query = query.OrderByDescending(l => l.Price);
                }
                else
                {
                    query = query.OrderBy(l => l.Price);
                }
                break;

            case "title":
                if (descending)
                {
                    query = query.OrderByDescending(l => l.Title);
                }
                else
                {
                    query = query.OrderBy(l => l.Title);
                }
                break;

            case "condition":
                if (descending)
                {
                    query = query.OrderByDescending(l => l.Condition);
                }
                else
                {
                    query = query.OrderBy(l => l.Condition);
                }
                break;

            case "createdat":
                if (descending)
                {
                    query = query.OrderByDescending(l => l.CreatedAt);
                }
                else
                {
                    query = query.OrderBy(l => l.CreatedAt);
                }
                break;

            default:
                if (descending)
                {
                    query = query.OrderByDescending(l => l.Id);
                }
                else
                {
                    query = query.OrderBy(l => l.Id);
                }
                break;
        }

        // Clamp paging to sensible bounds.
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

        return new PagedResult<Listing>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<Listing>> GetBySellerAsync(int sellerId, int page, int pageSize)
    {
        var query = _db.Listings
            .Include(l => l.Category)
            .Include(l => l.Images)
            .AsNoTracking()
            .Where(l => l.SellerId == sellerId)
            .OrderByDescending(l => l.CreatedAt);

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

        return new PagedResult<Listing>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
