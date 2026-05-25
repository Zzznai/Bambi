using System.ComponentModel.DataAnnotations;

namespace Bambi.Services.Dtos.Listings;

public class CreateListingDto
{
    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    [Range(0.01, 1_000_000)]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(10)]
    public string Size { get; set; } = string.Empty;

    [Required]
    [Range(0, 5)]
    public int Condition { get; set; }

    [Required]
    public int CategoryId { get; set; }
}
