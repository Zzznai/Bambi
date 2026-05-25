using Bambi.Data.Enums;
using Bambi.Services.Dtos.Categories;
using FluentValidation;

namespace Bambi.Services.Validation;

public class CreateCategoryDtoValidator : AbstractValidator<CreateCategoryDto>
{
    public CreateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MinimumLength(2).WithMessage("Name must be at least 2 characters.")
            .MaximumLength(80).WithMessage("Name cannot exceed 80 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(300);

        RuleFor(x => x.Gender)
            .Must(IsAllowedGender)
            .WithMessage("Gender must be All, Men, Women, Unisex, or Kids.");

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0);
    }

    private static bool IsAllowedGender(string? g)
    {
        if (string.IsNullOrWhiteSpace(g)) return true;
        if (string.Equals(g, "All", StringComparison.OrdinalIgnoreCase)) return true;
        return Enum.GetNames(typeof(ItemGender)).Contains(g, StringComparer.OrdinalIgnoreCase);
    }
}

public class UpdateCategoryDtoValidator : AbstractValidator<UpdateCategoryDto>
{
    public UpdateCategoryDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(2)
            .MaximumLength(80);

        RuleFor(x => x.Description)
            .MaximumLength(300);

        RuleFor(x => x.Gender)
            .Must(IsAllowedGender)
            .WithMessage("Gender must be All, Men, Women, Unisex, or Kids.");

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0);
    }

    private static bool IsAllowedGender(string? g)
    {
        if (string.IsNullOrWhiteSpace(g)) return true;
        if (string.Equals(g, "All", StringComparison.OrdinalIgnoreCase)) return true;
        return Enum.GetNames(typeof(ItemGender)).Contains(g, StringComparer.OrdinalIgnoreCase);
    }
}
