using System.ComponentModel.DataAnnotations;

namespace Bambi.Services.Dtos.Users;

public class UpdateRoleDto
{
    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = string.Empty;
}
