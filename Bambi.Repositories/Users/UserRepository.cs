using Bambi.Data;
using Bambi.Data.Entities;
using Bambi.Repositories.Common;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Repositories.Users;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _db;

    public UserRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _db.Users.AsNoTracking().ToListAsync();
    }

    public async Task AddAsync(User entity)
    {
        await _db.Users.AddAsync(entity);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(User entity)
    {
        _db.Users.Update(entity);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.Users.FindAsync(id);
        if (entity == null)
        {
            return;
        }

        _db.Users.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<PagedResult<User>> GetAllAsync(
        string? username,
        string? city,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        IQueryable<User> query = _db.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(username))
        {
            query = query.Where(u => u.Username.Contains(username));
        }

        if (!string.IsNullOrWhiteSpace(city))
        {
            query = query.Where(u => u.City != null && u.City.Contains(city));
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
            case "username":
                if (descending)
                {
                    query = query.OrderByDescending(u => u.Username);
                }
                else
                {
                    query = query.OrderBy(u => u.Username);
                }
                break;

            case "email":
                if (descending)
                {
                    query = query.OrderByDescending(u => u.Email);
                }
                else
                {
                    query = query.OrderBy(u => u.Email);
                }
                break;

            case "city":
                if (descending)
                {
                    query = query.OrderByDescending(u => u.City);
                }
                else
                {
                    query = query.OrderBy(u => u.City);
                }
                break;

            case "createdat":
                if (descending)
                {
                    query = query.OrderByDescending(u => u.CreatedAt);
                }
                else
                {
                    query = query.OrderBy(u => u.CreatedAt);
                }
                break;

            default:
                if (descending)
                {
                    query = query.OrderByDescending(u => u.Id);
                }
                else
                {
                    query = query.OrderBy(u => u.Id);
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

        return new PagedResult<User>
        {
            Items = items,
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _db.Users.AnyAsync(u => u.Username == username);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _db.Users.AnyAsync(u => u.Email == email);
    }
}
