using System.ComponentModel.DataAnnotations;

namespace Bambi.Services.Dtos.Auth;

public class RegisterRequestDto
{
    [Required]
    [MaxLength(50)]
    [MinLength(3)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }
}
