using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Api.DTOs.Playlist;
using Backend.src.Api.DTOs.Track;

namespace Backend.src.Application.Services
{
    public class LibraryService
    {
        private readonly IPlaylistRepository _playlistRepo;
        private readonly IPlaylistTrackRepository _playlistTrackRepo;
        private readonly IUserLikeTrackRepository _likeTrackRepo;
        private readonly ITrackRepository _trackRepo;
        private readonly IUserRepository _userRepo;
        private const string FAVORITES_PLAYLIST_NAME = "Liked Songs";

        public LibraryService(
            IPlaylistRepository playlistRepo,
            IPlaylistTrackRepository playlistTrackRepo,
            IUserLikeTrackRepository likeTrackRepo,
            ITrackRepository trackRepo,
            IUserRepository userRepo
        )
        {
            _playlistRepo = playlistRepo;
            _playlistTrackRepo = playlistTrackRepo;
            _likeTrackRepo = likeTrackRepo;
            _trackRepo = trackRepo;
            _userRepo = userRepo;
        }

        /// <summary>
        /// Get or create a "Liked Songs" favorites playlist for a user
        /// </summary>
        public async Task<Playlist> GetOrCreateFavoritesPlaylist(Guid userId)
        {
            var existingPlaylist = await _playlistRepo.GetByOwnerIdAndNameAsync(userId, FAVORITES_PLAYLIST_NAME);
            
            if (existingPlaylist != null)
                return existingPlaylist;

            // Create new favorites playlist
            var newPlaylist = new Playlist
            {
                Id = Guid.NewGuid(),
                OwnerId = userId,
                Name = FAVORITES_PLAYLIST_NAME,
                IsPublic = false,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            return await _playlistRepo.AddAsync(newPlaylist);
        }

        /// <summary>
        /// Sync liked tracks to favorites playlist
        /// </summary>
        public async Task SyncLikedTracksToFavorites(Guid userId)
        {
            // Get or create favorites playlist
            var favoritesPlaylist = await GetOrCreateFavoritesPlaylist(userId);

            // Get all liked tracks for user
            var likedTracks = await _likeTrackRepo.GetAllByUserIdAsync(userId);

            // Get existing tracks in favorites playlist
            var existingTracks = await _playlistTrackRepo.GetByPlaylistIdAsync(favoritesPlaylist.Id);
            var existingTrackIds = existingTracks?.Select(t => t.TrackId).ToHashSet() ?? new HashSet<Guid>();

            // Add new liked tracks to favorites playlist
            int position = existingTracks?.Count ?? 0;
            foreach (var likedTrack in likedTracks)
            {
                if (!existingTrackIds.Contains(likedTrack.TrackId))
                {
                    var playlistTrack = new PlaylistTrack
                    {
                        PlaylistId = favoritesPlaylist.Id,
                        TrackId = likedTrack.TrackId,
                        Position = position++,
                        AddedAt = likedTrack.CreatedAt
                    };
                    await _playlistTrackRepo.AddAsync(playlistTrack);
                }
            }

            // Remove tracks that are no longer liked
            var likedTrackIds = likedTracks.Select(t => t.TrackId).ToHashSet();
            foreach (var track in existingTracks ?? new List<PlaylistTrack>())
            {
                if (!likedTrackIds.Contains(track.TrackId))
                {
                    await _playlistTrackRepo.DeleteByCompositeKeyAsync(track.PlaylistId, track.TrackId);
                }
            }
        }

        /// <summary>
        /// Get user's own playlists (not public ones, but all their personal playlists)
        /// </summary>
        public async Task<List<PlaylistDTO>> GetUserPlaylists(Guid userId)
        {
            var userPlaylists = await _playlistRepo.GetByOwnerIdAsync(userId);
            if (userPlaylists == null || userPlaylists.Count == 0)
                return new List<PlaylistDTO>();

            var result = new List<PlaylistDTO>();

            foreach (var playlist in userPlaylists)
            {
                var playlistTracks = await _playlistTrackRepo.GetByPlaylistIdWithTracksAsync(playlist.Id);

                var playlistTrackDTOs = new List<PlaylistTrackDTO>();
                if (playlistTracks != null)
                {
                    playlistTrackDTOs = playlistTracks.Select(pt => new PlaylistTrackDTO(
                        Id: pt.TrackId,
                        Position: pt.Position,
                        Track: new TrackDTO(
                            Id: pt.Track.Id,
                            Title: pt.Track.Title,
                            ArtistName: pt.Track.Artist.Name,
                            AudioUrl: pt.Track.AudioUrl ?? "",
                            CoverUrl: pt.Track.CoverUrl,
                            TrackNumber: pt.Track.TrackNumber,
                            Duration: pt.Track.Duration,
                            CreatedAt: pt.Track.CreatedAt
                        ),
                        AddedAt: pt.AddedAt
                    )).ToList();
                }

                var user = await _userRepo.GetByIdAsync(playlist.OwnerId);

                result.Add(new PlaylistDTO(
                    Id: playlist.Id,
                    OwnerId: playlist.OwnerId,
                    OwnerName: user?.Username ?? "Unknown",
                    Name: playlist.Name,
                    IsPublic: playlist.IsPublic,
                    Tracks: playlistTrackDTOs,
                    CreatedAt: playlist.CreatedAt,
                    UpdatedAt: playlist.UpdatedAt
                ));
            }

            return result;
        }

        /// <summary>
        /// Get liked songs as a playlist
        /// </summary>
        public async Task<PlaylistDTO?> GetLikedSongsPlaylist(Guid userId)
        {
            var favoritesPlaylist = await GetOrCreateFavoritesPlaylist(userId);
            var playlistTracks = await _playlistTrackRepo.GetByPlaylistIdWithTracksAsync(favoritesPlaylist.Id);

            var playlistTrackDTOs = new List<PlaylistTrackDTO>();
            if (playlistTracks != null)
            {
                playlistTrackDTOs = playlistTracks.Select(pt => new PlaylistTrackDTO(
                    Id: pt.TrackId,
                    Position: pt.Position,
                    Track: new TrackDTO(
                        Id: pt.Track.Id,
                        Title: pt.Track.Title,
                        ArtistName: pt.Track.Artist.Name,
                        AudioUrl: pt.Track.AudioUrl ?? "",
                        CoverUrl: pt.Track.CoverUrl,
                        TrackNumber: pt.Track.TrackNumber,
                        Duration: pt.Track.Duration,
                        CreatedAt: pt.Track.CreatedAt
                    ),
                    AddedAt: pt.AddedAt
                )).ToList();
            }

            var user = await _userRepo.GetByIdAsync(favoritesPlaylist.OwnerId);

            return new PlaylistDTO(
                Id: favoritesPlaylist.Id,
                OwnerId: favoritesPlaylist.OwnerId,
                OwnerName: user?.Username ?? "Unknown",
                Name: favoritesPlaylist.Name,
                IsPublic: favoritesPlaylist.IsPublic,
                Tracks: playlistTrackDTOs,
                CreatedAt: favoritesPlaylist.CreatedAt,
                UpdatedAt: favoritesPlaylist.UpdatedAt
            );
        }

        /// <summary>
        /// Update playlist
        /// </summary>
        public async Task<Playlist?> UpdatePlaylist(Guid playlistId, Guid userId, string newName, bool isPublic)
        {
            var playlist = await _playlistRepo.GetByIdAsync(playlistId);
            if (playlist == null || playlist.OwnerId != userId)
                throw new Exception("Playlist not found or you don't have permission to edit it");

            playlist.Name = newName;
            playlist.IsPublic = isPublic;
            playlist.UpdatedAt = DateTimeOffset.UtcNow;

            return await _playlistRepo.UpdateAsync(playlist);
        }

        /// <summary>
        /// Delete playlist
        /// </summary>
        public async Task<bool> DeletePlaylist(Guid playlistId, Guid userId)
        {
            var playlist = await _playlistRepo.GetByIdAsync(playlistId);
            if (playlist == null || playlist.OwnerId != userId)
                throw new Exception("Playlist not found or you don't have permission to delete it");

            if (playlist.Name == FAVORITES_PLAYLIST_NAME)
                throw new Exception("Cannot delete Liked Songs playlist");

            return await _playlistRepo.DeleteAsync(playlistId);
        }
    }
}
