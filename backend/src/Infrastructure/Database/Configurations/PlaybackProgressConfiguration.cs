using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class PlaybackProgressConfiguration : IEntityTypeConfiguration<PlaybackProgress>
{
    public void Configure(EntityTypeBuilder<PlaybackProgress> builder)
    {
        builder.ToTable("playback_progress");

        builder.HasKey(x => x.UserId);

        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.TrackId).HasColumnName("track_id");
        builder.Property(x => x.ProgressSeconds).HasColumnName("progress_seconds");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
    }
}

