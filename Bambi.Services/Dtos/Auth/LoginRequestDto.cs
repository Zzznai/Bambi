using System.ComponentModel.DataAnnotations;

namespace Bambi.Services.Dtos.Auth;

public class LoginRequestDto
{
    [Required]
    [MaxLength(150)]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}
