using Backend.src.Api.DTOs.Playlist;
using Backend.src.Api.DTOs.Track;
using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Backend.src.Domain.Exceptions.Playlist;

namespace Backend.src.Application.Services
{
    public class PlaylistService
    {
        private readonly IPlaylistRepository _playlistRepo;
        private readonly IPlaylistTrackRepository _ptRepo;
        private readonly ITrackRepository _trackRepo;
        private readonly IUserRepository _userRepo;
        private readonly AppDbContext _context;

        public PlaylistService(
            IPlaylistRepository playlistRepo,
            IPlaylistTrackRepository ptRepo,
            ITrackRepository trackRepo,
            IUserRepository userRepo,
            AppDbContext context
        )
        {
            _playlistRepo = playlistRepo;
            _ptRepo = ptRepo;
            _trackRepo = trackRepo;
            _userRepo = userRepo;
            _context = context;
        }

        public async Task<Playlist> Create(Guid ownerId, CreatePlaylistRequest req)
        {
            // Check if owner id is valid, check request field too
            var existingUser = await _userRepo.GetByIdAsync(ownerId);
            if (existingUser == null)
                throw new InvalidPlaylistDataException("Invalid user ID");

            Playlist pl = new Playlist()
            {
                Id = Guid.NewGuid(),
                OwnerId = ownerId,
                Name = req.Name,
                IsPublic = req.IsPublic,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            var res = await _playlistRepo.AddAsync(pl);

            return res;
        }

        public async Task<PlaylistTrack> Add(Guid ownerId, AddTrackRequest req)
        {
            // Check if owner owned the playlist
            var playlist = await _playlistRepo.GetByIdAsync(req.PlaylistId);
            if (playlist == null) throw new Exception("Can not find any playlist with the given ID");

            if (ownerId != playlist.OwnerId) throw new Exception("Playlist is not yours");

            // Add track to current playlist
            PlaylistTrack newPt = new PlaylistTrack()
            {
                PlaylistId = req.PlaylistId,
                TrackId = req.TrackId,
                Position = 0,
                AddedAt = DateTimeOffset.UtcNow
            };

            var playlistTrack = await _ptRepo.AddAsync(newPt);
            if (playlistTrack == null) throw new Exception("Failed to add new track to playlist");

            return playlistTrack;
        }

        public async Task<List<PlaylistDTO>> GetAll()
        {
            // Get all public playlists with their owners
            var publicPlaylists = await _playlistRepo.GetAllPublicAsync();

            var result = new List<PlaylistDTO>();

            foreach (var playlist in publicPlaylists)
            {
                // Get all tracks for this playlist with track and artist info
                var playlistTracks = await _ptRepo.GetByPlaylistIdWithTracksAsync(playlist.Id);

                // Map PlaylistTracks to PlaylistTrackDTOs
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
                            AudioUrl: pt.Track.AudioUrl,
                            CoverUrl: pt.Track.CoverUrl,
                            TrackNumber: pt.Track.TrackNumber,
                            Duration: pt.Track.Duration,
                            CreatedAt: pt.Track.CreatedAt
                        ),
                        AddedAt: pt.AddedAt
                    )).ToList();
                }

                // Create PlaylistDTO
                var playlistDTO = new PlaylistDTO(
                    Id: playlist.Id,
                    OwnerId: playlist.OwnerId,
                    OwnerName: playlist.Owner.Username,
                    Name: playlist.Name,
                    IsPublic: playlist.IsPublic,
                    Tracks: playlistTrackDTOs,
                    CreatedAt: playlist.CreatedAt,
                    UpdatedAt: playlist.UpdatedAt
                );

                result.Add(playlistDTO);
            }

            return result;
        }
        public async Task<List<PlaylistDTO>> GetPaginatedPublic(int page, int pageSize)
        {
            var publicPlaylists = await _playlistRepo.GetPaginatedPublicAsync(page, pageSize);
            var result = new List<PlaylistDTO>();

            foreach (var playlist in publicPlaylists)
            {
                var playlistTracks = await _ptRepo.GetByPlaylistIdWithTracksAsync(playlist.Id);
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
                            AudioUrl: pt.Track.AudioUrl,
                            CoverUrl: pt.Track.CoverUrl,
                            TrackNumber: pt.Track.TrackNumber,
                            Duration: pt.Track.Duration,
                            CreatedAt: pt.Track.CreatedAt
                        ),
                        AddedAt: pt.AddedAt
                    )).ToList();
                }

                result.Add(new PlaylistDTO(
                    Id: playlist.Id,
                    OwnerId: playlist.OwnerId,
                    OwnerName: playlist.Owner.Username,
                    Name: playlist.Name,
                    IsPublic: playlist.IsPublic,
                    Tracks: playlistTrackDTOs,
                    CreatedAt: playlist.CreatedAt,
                    UpdatedAt: playlist.UpdatedAt
                ));
            }

            return result;
        }
    }
}
