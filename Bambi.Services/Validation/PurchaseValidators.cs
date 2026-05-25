using Bambi.Data.Entities;
using Bambi.Services.Dtos.Purchases;
using FluentValidation;

namespace Bambi.Services.Validation;

public class CreatePurchaseDtoValidator : AbstractValidator<CreatePurchaseDto>
{
    public CreatePurchaseDtoValidator()
    {
        RuleFor(x => x.ListingId)
            .GreaterThan(0).WithMessage("Listing is required.");

        RuleFor(x => x.DeliveryAddress)
            .MaximumLength(300);

        RuleFor(x => x.Note)
            .MaximumLength(500);
    }
}

public class UpdatePurchaseStatusDtoValidator : AbstractValidator<UpdatePurchaseStatusDto>
{
    public UpdatePurchaseStatusDtoValidator()
    {
        RuleFor(x => x.Status)
            .IsInEnum().WithMessage("Status must be a valid PurchaseStatus value.");
    }
}
