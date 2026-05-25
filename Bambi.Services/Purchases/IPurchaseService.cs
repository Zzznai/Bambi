using Bambi.Data.Entities;
using Bambi.Services.Dtos.Common;
using Bambi.Services.Dtos.Purchases;

namespace Bambi.Services.Purchases;

public interface IPurchaseService
{
    Task<PurchaseDto> CreateAsync(int buyerId, CreatePurchaseDto dto);
    Task<PagedResultDto<PurchaseDto>> GetMyPurchasesAsync(int buyerId, PurchaseStatus? status, DateTime? from, DateTime? to, string? sortBy, string? sortOrder, int page, int pageSize);
    Task<PagedResultDto<PurchaseDto>> GetMySalesAsync(int sellerId, PurchaseStatus? status, DateTime? from, DateTime? to, string? sortBy, string? sortOrder, int page, int pageSize);
    Task<PurchaseDto> GetByIdAsync(int callerId, int purchaseId);
    Task<PurchaseDto> UpdateStatusAsync(int callerId, int purchaseId, UpdatePurchaseStatusDto dto);
}
