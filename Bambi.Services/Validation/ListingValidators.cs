using Bambi.Data.Enums;
using Bambi.Services.Dtos.Listings;
using FluentValidation;

namespace Bambi.Services.Validation;

public class CreateListingDtoValidator : AbstractValidator<CreateListingDto>
{
    public CreateListingDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MinimumLength(5).WithMessage("Title must be at least 5 characters.")
            .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than 0.")
            .LessThanOrEqualTo(1_000_000).WithMessage("Price is unrealistically high.");

        RuleFor(x => x.Size)
            .NotEmpty().WithMessage("Size is required.")
            .MaximumLength(10).WithMessage("Size cannot exceed 10 characters.");

        RuleFor(x => x.Condition)
            .InclusiveBetween((int)ConditionLevel.Poor, (int)ConditionLevel.LikeNew)
            .WithMessage("Condition must be between 0 (poor) and 5 (like new)");

        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("A category is required.");
    }
}

public class UpdateListingDtoValidator : AbstractValidator<UpdateListingDto>
{
    public UpdateListingDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MinimumLength(4)
            .MaximumLength(100);

        RuleFor(x => x.Description)
            .MaximumLength(1000);

        RuleFor(x => x.Price)
            .GreaterThan(0)
            .LessThanOrEqualTo(1_000_000);

        RuleFor(x => x.Size)
            .NotEmpty()
            .MaximumLength(10);

        RuleFor(x => x.Condition)
            .InclusiveBetween((int)ConditionLevel.Poor, (int)ConditionLevel.LikeNew);

        RuleFor(x => x.CategoryId)
            .GreaterThan(0);
    }
}
