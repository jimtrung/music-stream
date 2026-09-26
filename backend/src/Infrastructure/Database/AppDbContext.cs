using Microsoft.EntityFrameworkCore;
using Backend.src.Domain.Entities;

namespace Backend.src.Infrastructure.Database
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Album> Albums { get; set; }
        public DbSet<Artist> Artists { get; set; }
        public DbSet<ListeningEvent> ListeningEvents { get; set; }
        public DbSet<PlaybackProgress> PlaybackProgresses { get; set; }
        public DbSet<Playlist> Playlists { get; set; }
        public DbSet<PlaylistTrack> PlaylistTracks { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<TrackStat> TrackStats { get; set; }
        public DbSet<UserFollowArtist> UserFollowArtists { get; set; }
        public DbSet<UserLikeTrack> UserLikeTracks { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Message> Messages { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                entity.SetTableName(entity.GetTableName()!.ToLower());
            }

            modelBuilder.HasPostgresEnum<Provider>("provider_type");
            modelBuilder.HasPostgresEnum<UserRole>("role_type");
            modelBuilder.HasPostgresEnum<SubscriptionStatus>("subscription_status");

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
