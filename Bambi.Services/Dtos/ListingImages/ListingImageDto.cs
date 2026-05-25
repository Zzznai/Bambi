namespace Bambi.Services.Dtos.ListingImages;

public class ListingImageDto
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? PublicId { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime UploadedAt { get; set; }
    public int SortOrder { get; set; }
    public int ListingId { get; set; }
}
