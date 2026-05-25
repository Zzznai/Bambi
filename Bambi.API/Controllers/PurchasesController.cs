using Bambi.API.Common;
using Bambi.Data.Entities;
using Bambi.Services.Dtos.Purchases;
using Bambi.Services.Purchases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Bambi.API.Controllers;

[ApiController]
[Route("api/purchases")]
[Authorize]
public class PurchasesController : ControllerBase
{
    private readonly IPurchaseService _purchases;

    public PurchasesController(IPurchaseService purchases)
    {
        _purchases = purchases;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseDto dto)
    {
        var callerId = CurrentUser.GetId(User);
        var result = await _purchases.CreateAsync(callerId, dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet("my")]
    public async Task<IActionResult> GetMine(
        [FromQuery] PurchaseStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null)
    {
        var callerId = CurrentUser.GetId(User);
        var result = await _purchases.GetMyPurchasesAsync(callerId, status, from, to, sortBy, sortOrder, page, pageSize);
        return Ok(result);
    }

    // Sales — purchases of the caller's own listings. Lets sellers see who ordered
    // their items and update the order status.
    [HttpGet("sales")]
    public async Task<IActionResult> GetMySales(
        [FromQuery] PurchaseStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? sortOrder = null)
    {
        var callerId = CurrentUser.GetId(User);
        var result = await _purchases.GetMySalesAsync(callerId, status, from, to, sortBy, sortOrder, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var callerId = CurrentUser.GetId(User);
        var result = await _purchases.GetByIdAsync(callerId, id);
        return Ok(result);
    }

    [HttpPut("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePurchaseStatusDto dto)
    {
        var callerId = CurrentUser.GetId(User);
        var result = await _purchases.UpdateStatusAsync(callerId, id, dto);
        return Ok(result);
    }
}
