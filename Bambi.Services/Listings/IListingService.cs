using Bambi.Services.Dtos.Common;
using Bambi.Services.Dtos.Listings;

namespace Bambi.Services.Listings;

public interface IListingService
{
    Task<PagedResultDto<ListingDto>> GetAllAsync(
        int? categoryId, string? size, decimal? minPrice, decimal? maxPrice,
        int? condition, bool? isAvailable, string? sortBy, string? sortOrder, int page, int pageSize);

    Task<ListingDto> GetByIdAsync(int id);
    Task<PagedResultDto<ListingDto>> GetMyListingsAsync(int sellerId, int page, int pageSize);
    Task<ListingDto> CreateAsync(int sellerId, CreateListingDto dto);
    Task<ListingDto> UpdateAsync(int callerId, int listingId, UpdateListingDto dto);
    Task DeleteAsync(int callerId, int listingId);
}
