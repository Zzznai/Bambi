using Bambi.Data.Entities;
using Bambi.Repositories.Common;

namespace Bambi.Repositories.Listings;

public interface IListingRepository : IRepository<Listing>
{
    Task<PagedResult<Listing>> GetAllAsync(
        int? categoryId,
        string? size,
        decimal? minPrice,
        decimal? maxPrice,
        int? condition,
        bool? isAvailable,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize);

    Task<PagedResult<Listing>> GetBySellerAsync(int sellerId, int page, int pageSize);
}
