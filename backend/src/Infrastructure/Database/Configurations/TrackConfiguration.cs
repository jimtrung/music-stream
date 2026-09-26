using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class TrackConfiguration : IEntityTypeConfiguration<Track>
{
    public void Configure(EntityTypeBuilder<Track> builder)
    {
        builder.ToTable("tracks");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("id");

        builder.Property(x => x.ArtistId)
            .HasColumnName("artist_id");

        builder.Property(x => x.AlbumId)
            .HasColumnName("album_id");

        builder.Property(x => x.Title)
            .HasColumnName("title");

        builder.Property(x => x.AudioUrl)
            .HasColumnName("audio_url");

        builder.Property(x => x.CoverUrl)
            .HasColumnName("cover_url");

        builder.Property(x => x.TrackNumber)
            .HasColumnName("track_number");

        builder.Property(x => x.Duration)
            .HasColumnName("duration");

        builder.Property(x => x.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(x => x.UpdatedAt)
            .HasColumnName("updated_at");

        builder.HasOne(t => t.Album)
            .WithMany()
            .HasForeignKey(x => x.AlbumId);

        builder.HasOne(a => a.Artist)
            .WithMany()
            .HasForeignKey(x => x.ArtistId);

        builder.HasIndex(x => x.AlbumId);
    }
}

