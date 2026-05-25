using AutoMapper;
using Bambi.Data.Entities;
using Bambi.Repositories.ListingImages;
using Bambi.Repositories.Listings;
using Bambi.Services.Common;
using Bambi.Services.Dtos.ListingImages;
using Microsoft.AspNetCore.Http;

namespace Bambi.Services.ListingImages;

public class ListingImageService : IListingImageService
{
    private readonly IListingImageRepository _images;
    private readonly IListingRepository _listings;
    private readonly IImageStorage _storage;
    private readonly IMapper _mapper;

    public ListingImageService(
        IListingImageRepository images,
        IListingRepository listings,
        IImageStorage storage,
        IMapper mapper)
    {
        _images = images;
        _listings = listings;
        _storage = storage;
        _mapper = mapper;
    }

    public async Task<ListingImageDto> UploadAsync(int callerId, int listingId, IFormFile file)
    {
        var listing = await _listings.GetByIdAsync(listingId);
        if (listing == null)
        {
            throw new NotFoundException("Listing not found.");
        }

        if (listing.SellerId != callerId)
        {
            throw new ForbiddenException("You can only upload images to your own listings.");
        }

        var uploaded = await _storage.UploadAsync(file);

        var existing = await _images.GetByListingIdAsync(listingId);
        var existingList = existing.ToList();

        // First image uploaded becomes the primary automatically — saves the
        // seller a click when they only have one photo.
        bool isFirst = existingList.Count == 0;

        var entity = new ListingImage
        {
            ImageUrl = uploaded.Url,
            PublicId = uploaded.PublicId,
            IsPrimary = isFirst,
            UploadedAt = DateTime.UtcNow,
            SortOrder = existingList.Count,
            ListingId = listingId,
        };

        await _images.AddAsync(entity);
        return _mapper.Map<ListingImageDto>(entity);
    }

    public async Task<ListingImageDto> SetPrimaryAsync(int callerId, int imageId)
    {
        var image = await _images.GetByIdAsync(imageId);
        if (image == null)
        {
            throw new NotFoundException("Image not found.");
        }

        if (image.Listing.SellerId != callerId)
        {
            throw new ForbiddenException("You can only modify images on your own listings.");
        }

        await _images.SetPrimaryAsync(imageId);

        var refreshed = await _images.GetByIdAsync(imageId);
        return _mapper.Map<ListingImageDto>(refreshed);
    }

    public async Task DeleteAsync(int callerId, int imageId)
    {
        var image = await _images.GetByIdAsync(imageId);
        if (image == null)
        {
            throw new NotFoundException("Image not found.");
        }

        if (image.Listing.SellerId != callerId)
        {
            throw new ForbiddenException("You can only delete images on your own listings.");
        }

        // Best-effort delete on Cloudinary first. If we wiped the DB row before
        // talking to Cloudinary and that call failed we'd leak the asset.
        if (!string.IsNullOrWhiteSpace(image.PublicId))
        {
            await _storage.DeleteAsync(image.PublicId);
        }

        await _images.DeleteAsync(image.Id);
    }
}
