using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class PlaylistTrackConfiguration : IEntityTypeConfiguration<PlaylistTrack>
{
    public void Configure(EntityTypeBuilder<PlaylistTrack> builder)
    {
        builder.ToTable("playlist_tracks");

        builder.HasKey(x => new { x.PlaylistId, x.TrackId });

        builder.Property(x => x.PlaylistId).HasColumnName("playlist_id");
        builder.Property(x => x.TrackId).HasColumnName("track_id");
        builder.Property(x => x.Position).HasColumnName("position");
        builder.Property(x => x.AddedAt).HasColumnName("added_at");
    }
}

