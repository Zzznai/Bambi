using Bambi.Services.Dtos.Common;
using Bambi.Services.Dtos.Users;
using Bambi.Services.ListingImages;
using Microsoft.AspNetCore.Http;

namespace Bambi.Services.Users;

public interface IUserService
{
    Task<PagedResultDto<UserDto>> GetAllAsync(string? username, string? city, string? sortBy, string? sortOrder, int page, int pageSize);
    Task<UserDto> GetByIdAsync(int id);
    Task<UserDto> UpdateRoleAsync(int id, UpdateRoleDto dto);
    Task<UserDto> UpdateProfileAsync(int id, UpdateProfileDto dto);
    Task<UserDto> UploadProfileImageAsync(int userId, IFormFile file, IImageStorage storage);
    Task DeleteAsync(int id);
    Task DeleteMeAsync(int userId);
}
