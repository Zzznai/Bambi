using AutoMapper;
using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Bambi.Repositories.Categories;
using Bambi.Services.Common;
using Bambi.Services.Dtos.Categories;
using Bambi.Services.Dtos.Common;

namespace Bambi.Services.Categories;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repo;
    private readonly IMapper _mapper;

    public CategoryService(ICategoryRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<PagedResultDto<CategoryDto>> GetAllAsync(
        string? name,
        string? gender,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize)
    {
        var paged = await _repo.GetAllAsync(name, gender, sortBy, sortOrder, page, pageSize);

        var dtoItems = new List<CategoryDto>();
        foreach (var category in paged.Items)
        {
            dtoItems.Add(_mapper.Map<CategoryDto>(category));
        }

        return new PagedResultDto<CategoryDto>
        {
            Items = dtoItems,
            TotalCount = paged.TotalCount,
            Page = paged.Page,
            PageSize = paged.PageSize,
            TotalPages = paged.TotalPages,
        };
    }

    public async Task<CategoryDto> GetByIdAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null)
        {
            throw new NotFoundException("Category not found.");
        }

        return _mapper.Map<CategoryDto>(entity);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var entity = _mapper.Map<Category>(dto);
        await _repo.AddAsync(entity);
        return _mapper.Map<CategoryDto>(entity);
    }

    public async Task<CategoryDto> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null)
        {
            throw new NotFoundException("Category not found.");
        }

        entity.Name = dto.Name;
        entity.Description = dto.Description;
        entity.Gender = ParseGenderFromInput(dto.Gender);
        entity.SortOrder = dto.SortOrder;

        await _repo.UpdateAsync(entity);
        return _mapper.Map<CategoryDto>(entity);
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null)
        {
            throw new NotFoundException("Category not found.");
        }

        await _repo.DeleteAsync(entity.Id);
    }

    // "All" or empty means "no gender restriction" → null on the entity.
    // Anything else has to parse cleanly to a known enum value; if it doesn't,
    // we just leave the column empty rather than guessing.
    private static ItemGender? ParseGenderFromInput(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        if (string.Equals(raw, "All", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        ItemGender parsed;
        if (Enum.TryParse<ItemGender>(raw, ignoreCase: true, out parsed))
        {
            return parsed;
        }

        return null;
    }
}
