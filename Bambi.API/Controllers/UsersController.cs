using Bambi.API.Common;
using Bambi.Services.Common;
using Bambi.Services.Dtos.Users;
using Bambi.Services.ListingImages;
using Bambi.Services.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bambi.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _users;
    private readonly IImageStorage _storage;

    public UsersController(IUserService users, IImageStorage storage)
    {
        _users = users;
        _storage = storage;
    }

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? username,
        [FromQuery] string? city,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null)
    {
        var result = await _users.GetAllAsync(username, city, sortBy, sortOrder, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var callerId = CurrentUser.GetId(User);
        if (callerId != id && !CurrentUser.IsAdmin(User))
            return Forbid();

        var result = await _users.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpPut("{id:int}/role")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDto dto)
    {
        var result = await _users.UpdateRoleAsync(id, dto);
        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileDto dto)
    {
        var callerId = CurrentUser.GetId(User);
        if (callerId != id && !CurrentUser.IsAdmin(User))
            return Forbid();

        var result = await _users.UpdateProfileAsync(id, dto);
        return Ok(result);
    }

    [HttpPost("me/profile-pic")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("File is required.");

        var callerId = CurrentUser.GetId(User);
        var result = await _users.UploadProfileImageAsync(callerId, file, _storage);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _users.DeleteAsync(id);
        return NoContent();
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe()
    {
        var callerId = CurrentUser.GetId(User);
        await _users.DeleteMeAsync(callerId);
        return NoContent();
    }
}
