using Bambi.Data.Entities;
using Bambi.Repositories.Common;

namespace Bambi.Repositories.ListingImages;

public interface IListingImageRepository : IRepository<ListingImage>
{
    Task<IEnumerable<ListingImage>> GetByListingIdAsync(int listingId);
    Task SetPrimaryAsync(int imageId);
}
