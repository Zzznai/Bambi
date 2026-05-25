using Bambi.Data.Entities;
using Bambi.Repositories.Common;

namespace Bambi.Repositories.Users;

public interface IUserRepository : IRepository<User>
{
    Task<PagedResult<User>> GetAllAsync(
        string? username,
        string? city,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize);

    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<bool> UsernameExistsAsync(string username);
    Task<bool> EmailExistsAsync(string email);
}
