using Bambi.Data.Entities;
using Bambi.Data.Enums;
using Microsoft.EntityFrameworkCore;

namespace Bambi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Listing> Listings => Set<Listing>();
    public DbSet<ListingImage> ListingImages => Set<ListingImage>();
    public DbSet<Purchase> Purchases => Set<Purchase>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(u => u.Username).IsUnique();
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.Role).HasDefaultValue(UserRole.User);
            b.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
        });

        modelBuilder.Entity<Category>(b =>
        {
            b.HasIndex(c => c.Name);
        });

        modelBuilder.Entity<Listing>(b =>
        {
            b.Property(l => l.IsAvailable).HasDefaultValue(true);
            b.Property(l => l.CreatedAt).HasDefaultValueSql("GETUTCDATE()");

            b.HasOne(l => l.Seller)
                .WithMany(u => u.Listings)
                .HasForeignKey(l => l.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(l => l.Category)
                .WithMany(c => c.Listings)
                .HasForeignKey(l => l.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ListingImage>(b =>
        {
            b.Property(i => i.UploadedAt).HasDefaultValueSql("GETUTCDATE()");

            b.HasOne(i => i.Listing)
                .WithMany(l => l.Images)
                .HasForeignKey(i => i.ListingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Purchase>(b =>
        {
            b.Property(p => p.PurchasedAt).HasDefaultValueSql("GETUTCDATE()");

            b.HasOne(p => p.Buyer)
                .WithMany(u => u.Purchases)
                .HasForeignKey(p => p.BuyerId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(p => p.Listing)
                .WithMany(l => l.Purchases)
                .HasForeignKey(p => p.ListingId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
