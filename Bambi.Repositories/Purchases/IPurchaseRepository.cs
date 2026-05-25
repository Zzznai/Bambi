using Bambi.Data.Entities;
using Bambi.Repositories.Common;

namespace Bambi.Repositories.Purchases;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<PagedResult<Purchase>> GetByBuyerIdAsync(
        int buyerId,
        PurchaseStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize);

    Task<PagedResult<Purchase>> GetBySellerIdAsync(
        int sellerId,
        PurchaseStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        string? sortBy,
        string? sortOrder,
        int page,
        int pageSize);
}
