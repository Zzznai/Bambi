using Microsoft.AspNetCore.Http;

namespace Bambi.Services.ListingImages;

public interface IImageStorage
{
    Task<ImageUploadResult> UploadAsync(IFormFile file, CancellationToken ct = default);
    Task DeleteAsync(string publicId, CancellationToken ct = default);
}

public record ImageUploadResult(string Url, string PublicId);
