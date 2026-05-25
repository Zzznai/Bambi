using System.ComponentModel.DataAnnotations;

namespace Bambi.Services.Dtos.Purchases;

public class CreatePurchaseDto
{
    [Required]
    public int ListingId { get; set; }

    [MaxLength(300)]
    public string? DeliveryAddress { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
