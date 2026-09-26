using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Backend.src.Domain.Entities;

public class UserFollowArtistConfiguration : IEntityTypeConfiguration<UserFollowArtist>
{
    public void Configure(EntityTypeBuilder<UserFollowArtist> builder)
    {
        builder.ToTable("user_follow_artists");

        builder.HasKey(x => new { x.UserId, x.ArtistId });

        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.ArtistId).HasColumnName("artist_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
    }
}

