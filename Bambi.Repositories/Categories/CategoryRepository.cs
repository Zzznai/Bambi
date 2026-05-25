using Bambi.Data;
using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Bambi.Repositories.Common;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Repositories.Categories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _db;

    public CategoryRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _db.Categories.AsNoTracking().ToListAsync();
    }

    public async Task AddAsync(Category entity)
    {
        await _db.Categories.AddAsync(entity);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(Category entity)
    {
        _db.Categories.Update(entity);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Categories.FindAsync(id);
        if (entity == null)
        {
            return;
        }

        _db.Categories.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<Category>> GetAllAsync(
        string? name,
        string? gender,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        IQueryable<Category> query = _db.Categories.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(c => c.Name.Contains(name));
        }

        if (!string.IsNullOrWhiteSpace(gender))
        {
            ItemGender genderEnum;
            if (Enum.TryParse<ItemGender>(gender, ignoreCase: true, out genderEnum))
            {
                query = query.Where(c => c.Gender == genderEnum);
            }
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
            case "name":
                if (descending)
                {
                    query = query.OrderByDescending(c => c.Name);
                }
                else
                {
                    query = query.OrderBy(c => c.Name);
                }
                break;

            case "sortorder":
                if (descending)
                {
                    query = query.OrderByDescending(c => c.SortOrder);
                }
                else
                {
                    query = query.OrderBy(c => c.SortOrder);
                }
                break;

            case "gender":
                if (descending)
                {
                    query = query.OrderByDescending(c => c.Gender);
                }
                else
                {
                    query = query.OrderBy(c => c.Gender);
                }
                break;

            default:
                // Default ordering is by SortOrder ascending so the admin can curate
                // the catalog. Descending falls back to Id so it's still stable.
                if (descending)
                {
                    query = query.OrderByDescending(c => c.Id);
                }
                else
                {
                    query = query.OrderBy(c => c.SortOrder);
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

        return new PagedResult<Category>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
