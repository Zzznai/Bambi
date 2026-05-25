using System.ComponentModel.DataAnnotations;

namespace Bambi.Services.Dtos.Categories;

public class UpdateCategoryDto
{
    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Description { get; set; }

    [MaxLength(20)]
    public string? Gender { get; set; }

    public int SortOrder { get; set; }
}
