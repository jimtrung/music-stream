using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class UserLikeTrackConfiguration : IEntityTypeConfiguration<UserLikeTrack>
{
    public void Configure(EntityTypeBuilder<UserLikeTrack> builder)
    {
        builder.ToTable("user_likes_tracks");

        builder.HasKey(x => new { x.UserId, x.TrackId });

        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.TrackId).HasColumnName("track_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
    }
}

