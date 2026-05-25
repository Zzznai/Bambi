using Bambi.Data.Enums;
using Bambi.Services.Dtos.Users;
using FluentValidation;

namespace Bambi.Services.Validation;

public class UpdateRoleDtoValidator : AbstractValidator<UpdateRoleDto>
{
    public UpdateRoleDtoValidator()
    {
        RuleFor(x => x.Role)
            .NotEmpty()
            .Must(r => string.Equals(r, "user", StringComparison.OrdinalIgnoreCase) || string.Equals(r, "admin", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Role must be User or Admin.");
    }
}
