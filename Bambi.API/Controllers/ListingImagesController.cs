using Bambi.API.Common;
using Bambi.Services.ListingImages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bambi.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class ListingImagesController : ControllerBase
{
    private readonly IListingImageService _images;

    public ListingImagesController(IListingImageService images)
    {
        _images = images;
    }

    [HttpPost("listings/{id:int}/images")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> Upload(int id, IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("File is required.");

        var callerId = CurrentUser.GetId(User);
        var result = await _images.UploadAsync(callerId, id, file);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("listing-images/{id:int}/primary")]
    public async Task<IActionResult> SetPrimary(int id)
    {
        var callerId = CurrentUser.GetId(User);
        var result = await _images.SetPrimaryAsync(callerId, id);
        return Ok(result);
    }

    [HttpDelete("listing-images/{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var callerId = CurrentUser.GetId(User);
        await _images.DeleteAsync(callerId, id);
        return NoContent();
    }
}
