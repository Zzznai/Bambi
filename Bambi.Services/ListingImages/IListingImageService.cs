using Bambi.Services.Dtos.ListingImages;
using Microsoft.AspNetCore.Http;

namespace Bambi.Services.ListingImages;

public interface IListingImageService
{
    Task<ListingImageDto> UploadAsync(int callerId, int listingId, IFormFile file);
    Task<ListingImageDto> SetPrimaryAsync(int callerId, int imageId);
    Task DeleteAsync(int callerId, int imageId);
}
