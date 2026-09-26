using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class TrackStatConfiguration : IEntityTypeConfiguration<TrackStat>
{
    public void Configure(EntityTypeBuilder<TrackStat> builder)
    {
        builder.ToTable("track_stats");

        builder.HasKey(x => x.TrackId);

        builder.Property(x => x.TrackId).HasColumnName("track_id");
        builder.Property(x => x.PlayCount).HasColumnName("play_count");
        builder.Property(x => x.LastPlayedAt).HasColumnName("last_played_at");
    }
}

