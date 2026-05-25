using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Bambi.Data.Enums;

namespace Bambi.Data.Entities;

public class Listing
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [Required]
    [MaxLength(10)]
    public string Size { get; set; } = string.Empty;

    [Required]
    public ConditionLevel Condition { get; set; } = ConditionLevel.Good;

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public int SellerId { get; set; }
    public User Seller { get; set; } = null!;

    [Required]
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public ICollection<ListingImage> Images { get; set; } = new List<ListingImage>();
    public ICollection<Purchase> Purchases { get; set; } = new List<Purchase>();
}
