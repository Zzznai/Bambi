using AutoMapper;
using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Bambi.Repositories.Common;
using Bambi.Services.Dtos.Categories;
using Bambi.Services.Dtos.Common;
using Bambi.Services.Dtos.ListingImages;
using Bambi.Services.Dtos.Listings;
using Bambi.Services.Dtos.Purchases;
using Bambi.Services.Dtos.Users;

namespace Bambi.Services.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Users — role gets lowercased on the way out so the frontend
        // ("admin"/"user") and [Authorize(Roles="admin")] both line up.
        CreateMap<User, UserDto>()
            .ForMember(d => d.Role, o => o.MapFrom(s => RoleToLower(s.Role)));

        // Categories — gender is an enum on the entity but a friendly string on
        // the DTO. "All" stands in for "no restriction".
        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.Gender, o => o.MapFrom(s => GenderToString(s.Gender)));

        CreateMap<CreateCategoryDto, Category>()
            .ForMember(d => d.Gender, o => o.MapFrom(s => ParseGender(s.Gender)));

        CreateMap<UpdateCategoryDto, Category>()
            .ForMember(d => d.Gender, o => o.MapFrom(s => ParseGender(s.Gender)));

        // Listings — flatten the seller/category nav properties onto the DTO
        // so the frontend doesn't have to chase relations.
        CreateMap<Listing, ListingDto>()
            .ForMember(d => d.SellerUsername, o => o.MapFrom(s => SellerUsername(s)))
            .ForMember(d => d.SellerCity, o => o.MapFrom(s => SellerCity(s)))
            .ForMember(d => d.SellerProfilePicUrl, o => o.MapFrom(s => SellerProfilePic(s)))
            .ForMember(d => d.CategoryName, o => o.MapFrom(s => CategoryName(s)))
            .ForMember(d => d.Condition, o => o.MapFrom(s => (int)s.Condition))
            .ForMember(d => d.Images, o => o.MapFrom(s => s.Images));

        CreateMap<CreateListingDto, Listing>()
            .ForMember(d => d.Condition, o => o.MapFrom(s => (ConditionLevel)s.Condition));

        CreateMap<UpdateListingDto, Listing>()
            .ForMember(d => d.Condition, o => o.MapFrom(s => (ConditionLevel)s.Condition));

        CreateMap<ListingImage, ListingImageDto>();

        // Purchases — pull denormalised buyer/seller/listing summary onto the DTO.
        CreateMap<Purchase, PurchaseDto>()
            .ForMember(d => d.BuyerUsername, o => o.MapFrom(s => BuyerUsername(s)))
            .ForMember(d => d.BuyerCity, o => o.MapFrom(s => BuyerCity(s)))
            .ForMember(d => d.BuyerProfilePicUrl, o => o.MapFrom(s => BuyerProfilePic(s)))
            .ForMember(d => d.ListingTitle, o => o.MapFrom(s => ListingTitle(s)))
            .ForMember(d => d.ListingImageUrl, o => o.MapFrom(s => PrimaryImageUrl(s)))
            .ForMember(d => d.SellerId, o => o.MapFrom(s => ListingSellerId(s)))
            .ForMember(d => d.SellerUsername, o => o.MapFrom(s => ListingSellerUsername(s)));

        CreateMap(typeof(PagedResult<>), typeof(PagedResultDto<>))
            .ForMember("TotalPages", o => o.MapFrom("TotalPages"));
    }

    // ----- Helpers -----

    private static string RoleToLower(UserRole role)
    {
        return role.ToString().ToLowerInvariant();
    }

    // Convert nullable enum to the friendly string the frontend uses.
    private static string GenderToString(ItemGender? gender)
    {
        if (gender.HasValue)
        {
            return gender.Value.ToString();
        }

        return "All";
    }

    // "All" or empty input means "no gender" — store null. Anything that doesn't
    // parse to a real enum value is also treated as null so we never throw
    // inside the mapping pipeline.
    private static ItemGender? ParseGender(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            return null;
        }

        if (string.Equals(raw, "All", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        ItemGender parsed;
        if (Enum.TryParse<ItemGender>(raw, ignoreCase: true, out parsed))
        {
            return parsed;
        }

        return null;
    }

    private static string? SellerUsername(Listing listing)
    {
        if (listing.Seller == null)
        {
            return null;
        }

        return listing.Seller.Username;
    }

    private static string? SellerCity(Listing listing)
    {
        if (listing.Seller == null)
        {
            return null;
        }

        return listing.Seller.City;
    }

    private static string? SellerProfilePic(Listing listing)
    {
        if (listing.Seller == null)
        {
            return null;
        }

        return listing.Seller.ProfilePicUrl;
    }

    private static string? CategoryName(Listing listing)
    {
        if (listing.Category == null)
        {
            return null;
        }

        return listing.Category.Name;
    }

    private static string? BuyerUsername(Purchase purchase)
    {
        if (purchase.Buyer == null)
        {
            return null;
        }

        return purchase.Buyer.Username;
    }

    private static string? BuyerCity(Purchase purchase)
    {
        if (purchase.Buyer == null)
        {
            return null;
        }

        return purchase.Buyer.City;
    }

    private static string? BuyerProfilePic(Purchase purchase)
    {
        if (purchase.Buyer == null)
        {
            return null;
        }

        return purchase.Buyer.ProfilePicUrl;
    }

    private static string? ListingTitle(Purchase purchase)
    {
        if (purchase.Listing == null)
        {
            return null;
        }

        return purchase.Listing.Title;
    }

    private static int ListingSellerId(Purchase purchase)
    {
        if (purchase.Listing == null)
        {
            return 0;
        }

        return purchase.Listing.SellerId;
    }

    private static string? ListingSellerUsername(Purchase purchase)
    {
        if (purchase.Listing == null)
        {
            return null;
        }

        if (purchase.Listing.Seller == null)
        {
            return null;
        }

        return purchase.Listing.Seller.Username;
    }

    // Return the primary image URL for a purchase's listing, falling back to
    // the first uploaded image if no primary was set.
    private static string? PrimaryImageUrl(Purchase purchase)
    {
        if (purchase.Listing == null)
        {
            return null;
        }

        if (purchase.Listing.Images == null)
        {
            return null;
        }

        ListingImage? primary = null;
        ListingImage? first = null;

        foreach (var image in purchase.Listing.Images)
        {
            if (first == null)
            {
                first = image;
            }

            if (image.IsPrimary)
            {
                primary = image;
                break;
            }
        }

        if (primary != null)
        {
            return primary.ImageUrl;
        }

        if (first != null)
        {
            return first.ImageUrl;
        }

        return null;
    }
}
