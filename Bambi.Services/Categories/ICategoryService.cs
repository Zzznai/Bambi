using Bambi.Services.Dtos.Categories;
using Bambi.Services.Dtos.Common;

namespace Bambi.Services.Categories;

public interface ICategoryService
{
    Task<PagedResultDto<CategoryDto>> GetAllAsync(string? name, string? gender, string? sortBy, string? sortOrder, int page, int pageSize);
    Task<CategoryDto> GetByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
    Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto);
    Task DeleteAsync(int id);
}
