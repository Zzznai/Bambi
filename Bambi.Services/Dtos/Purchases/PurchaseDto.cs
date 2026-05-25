using Bambi.Data.Entities;

namespace Bambi.Services.Dtos.Purchases;

public class PurchaseDto
{
    public int Id { get; set; }
    public decimal PricePaid { get; set; }
    public string? DeliveryAddress { get; set; }
    public PurchaseStatus Status { get; set; }
    public string? Note { get; set; }
    public DateTime PurchasedAt { get; set; }

    public int BuyerId { get; set; }
    public string? BuyerUsername { get; set; }
    public string? BuyerCity { get; set; }
    public string? BuyerProfilePicUrl { get; set; }

    public int ListingId { get; set; }
    public string? ListingTitle { get; set; }
    public string? ListingImageUrl { get; set; }
    public int SellerId { get; set; }
    public string? SellerUsername { get; set; }
}
