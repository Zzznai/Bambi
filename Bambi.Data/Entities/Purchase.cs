using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bambi.Data.Entities;

public enum PurchaseStatus
{
    Pending = 0,
    Confirmed = 1,
    Shipped = 2,
    Delivered = 3
}

public class Purchase
{
    [Key]
    public int Id { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePaid { get; set; }

    [MaxLength(300)]
    public string? DeliveryAddress { get; set; }

    [Required]
    public PurchaseStatus Status { get; set; } = PurchaseStatus.Pending;

    [MaxLength(500)]
    public string? Note { get; set; }

    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public int BuyerId { get; set; }
    public User Buyer { get; set; } = null!;

    [Required]
    public int ListingId { get; set; }
    public Listing Listing { get; set; } = null!;
}
