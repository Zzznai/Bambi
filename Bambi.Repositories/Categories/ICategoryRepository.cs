using Bambi.Data.Entities;
using Bambi.Repositories.Common;

namespace Bambi.Repositories.Categories;

public interface ICategoryRepository : IRepository<Category>
{
    Task<PagedResult<Category>> GetAllAsync(
        string? name,
        string? gender,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize);
}
