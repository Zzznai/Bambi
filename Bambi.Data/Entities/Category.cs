using System.ComponentModel.DataAnnotations;
using Bambi.Data.Enums;

namespace Bambi.Data.Entities;

public class Category
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(300)]
    public string? Description { get; set; }

    public ItemGender? Gender { get; set; }

    public int SortOrder { get; set; }

    public ICollection<Listing> Listings { get; set; } = new List<Listing>();
}
