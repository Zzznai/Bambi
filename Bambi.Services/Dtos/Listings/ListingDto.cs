using Bambi.Services.Dtos.ListingImages;

namespace Bambi.Services.Dtos.Listings;

public class ListingDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Size { get; set; } = string.Empty;
    public int Condition { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime CreatedAt { get; set; }

    public int SellerId { get; set; }
    public string? SellerUsername { get; set; }
    public string? SellerCity { get; set; }
    public string? SellerProfilePicUrl { get; set; }

    public int CategoryId { get; set; }
    public string? CategoryName { get; set; }

    public IReadOnlyList<ListingImageDto> Images { get; set; } = Array.Empty<ListingImageDto>();
}
