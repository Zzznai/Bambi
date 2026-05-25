using Bambi.Data;
using Bambi.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Repositories.ListingImages;

public class ListingImageRepository : IListingImageRepository
{
    private readonly AppDbContext _db;

    public ListingImageRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ListingImage?> GetByIdAsync(int id)
    {
        return await _db.ListingImages
            .Include(i => i.Listing)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<IEnumerable<ListingImage>> GetAllAsync()
    {
        return await _db.ListingImages.AsNoTracking().ToListAsync();
    }

    public async Task AddAsync(ListingImage entity)
    {
        await _db.ListingImages.AddAsync(entity);
        await _db.SaveChangesAsync();
    }

    public async Task UpdateAsync(ListingImage entity)
    {
        _db.ListingImages.Update(entity);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var entity = await _db.ListingImages.FindAsync(id);
        if (entity == null)
        {
            return;
        }

        _db.ListingImages.Remove(entity);
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<ListingImage>> GetByListingIdAsync(int listingId)
    {
        return await _db.ListingImages
            .AsNoTracking()
            .Where(i => i.ListingId == listingId)
            .OrderBy(i => i.SortOrder)
            .ToListAsync();
    }

    public async Task SetPrimaryAsync(int imageId)
    {
        var image = await _db.ListingImages.FirstOrDefaultAsync(i => i.Id == imageId);
        if (image == null)
        {
            return;
        }

        var siblings = await _db.ListingImages
            .Where(i => i.ListingId == image.ListingId)
            .ToListAsync();

        foreach (var sibling in siblings)
        {
            if (sibling.Id == imageId)
            {
                sibling.IsPrimary = true;
            }
            else
            {
                sibling.IsPrimary = false;
            }
        }

        await _db.SaveChangesAsync();
    }
}
