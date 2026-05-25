using System.ComponentModel.DataAnnotations;
using Bambi.Data.Entities;

namespace Bambi.Services.Dtos.Purchases;

public class UpdatePurchaseStatusDto
{
    [Required]
    [EnumDataType(typeof(PurchaseStatus))]
    public PurchaseStatus Status { get; set; }
}
