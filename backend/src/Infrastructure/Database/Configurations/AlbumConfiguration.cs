using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class AlbumConfiguration : IEntityTypeConfiguration<Album>
{
    public void Configure(EntityTypeBuilder<Album> builder)
    {
        builder.ToTable("albums");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ArtistId).HasColumnName("artist_id");
        builder.Property(x => x.Title).HasColumnName("title");
        builder.Property(x => x.CoverUrl).HasColumnName("cover_url");
        builder.Property(x => x.ReleaseDate).HasColumnName("release_date");

        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasOne(a => a.Artist)
            .WithMany()
            .HasForeignKey(x => x.ArtistId);
    }
}

