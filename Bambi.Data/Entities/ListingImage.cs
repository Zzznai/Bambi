using System.ComponentModel.DataAnnotations;

namespace Bambi.Data.Entities;

public class ListingImage
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? PublicId { get; set; }

    public bool IsPrimary { get; set; }

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public int SortOrder { get; set; }

    [Required]
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
}
