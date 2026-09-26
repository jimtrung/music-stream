using Backend.src.Application.Interfaces;
using Backend.src.Api.DTOs.Search;
using Backend.src.Api.DTOs.Artist;
using Backend.src.Api.DTOs.Track;
using Backend.src.Api.DTOs.Playlist;
using Backend.src.Infrastructure.Storage;

namespace Backend.src.Application.Services
{
    public class SearchService
    {
        private readonly IArtistRepository _artistRepo;
        private readonly ITrackRepository _trackRepo;
        private readonly IPlaylistRepository _playlistRepo;
        private readonly IUserRepository _userRepo;
        private readonly IProfileRepository _profileRepo;
        private readonly IMinioStorage _fileStorage;

        public SearchService(
            IArtistRepository artistRepo,
            ITrackRepository trackRepo,
            IPlaylistRepository playlistRepo,
            IUserRepository userRepo,
            IProfileRepository profileRepo,
            IMinioStorage fileStorage
        )
        {
            _artistRepo = artistRepo;
            _trackRepo = trackRepo;
            _playlistRepo = playlistRepo;
            _userRepo = userRepo;
            _profileRepo = profileRepo;
            _fileStorage = fileStorage;
        }

        public async Task<SearchResultsDTO> SearchAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new SearchResultsDTO(
                    new List<TrackDTO>(),
                    new List<ArtistResponse>(),
                    new List<SearchPlaylistDTO>(),
                    new List<SearchUserDTO>()
                );
            }

            // Perform searches in parallel for better performance
            var tracksTask = _trackRepo.SearchAsync(query);
            var artistsTask = _artistRepo.SearchAsync(query);
            var playlistsTask = _playlistRepo.SearchAsync(query);
            var usersTask = _userRepo.SearchAsync(query);

            await Task.WhenAll(tracksTask, artistsTask, playlistsTask, usersTask);

            var tracks = tracksTask.Result;
            var artists = artistsTask.Result;
            var playlists = playlistsTask.Result;
            var users = usersTask.Result;

            // Convert tracks to TrackDTO
            var trackDTOs = tracks.Select(t => new TrackDTO(
                t.Id,
                t.Title,
                t.Artist?.Name ?? "Unknown Artist",
                t.AudioUrl ?? "",
                t.CoverUrl,
                t.TrackNumber,
                t.Duration,
                t.CreatedAt
            )).ToList();

            // Convert playlists to SearchPlaylistDTO
            var playlistDTOs = playlists.Select(p => new SearchPlaylistDTO(
                p.Id,
                p.Name,
                p.OwnerId,
                p.Owner?.Username ?? "Unknown",
                p.IsPublic,
                p.CreatedAt
            )).ToList();

            // Convert users to SearchUserDTO
            var userDTOs = new List<SearchUserDTO>();
            foreach (var u in users)
            {
                var profile = await _profileRepo.GetByUserIdAsync(u.Id);
                userDTOs.Add(new SearchUserDTO(
                    u.Id,
                    u.Username,
                    profile?.AvatarUrl,
                    u.Email
                ));
            }

            return new SearchResultsDTO(trackDTOs, artists, playlistDTOs, userDTOs);
        }

        public async Task<SearchResultsDTO> GetAllSearchableAsync()
        {
            var tracksTask = _trackRepo.GetAllAsync();
            var artistsTask = _artistRepo.GetAllArtistsResponseAsync();
            var playlistsTask = _playlistRepo.GetAllAsync();
            var usersTask = _userRepo.GetAllUsersAsync();

            await Task.WhenAll(tracksTask, artistsTask, playlistsTask, usersTask);

            var tracks = tracksTask.Result;
            var artists = artistsTask.Result;
            var playlists = playlistsTask.Result;
            var users = usersTask.Result;

            // Convert tracks to TrackDTO
            var trackDTOs = tracks.Select(t => new TrackDTO(
                t.Id,
                t.Title,
                t.Artist?.Name ?? "Unknown Artist",
                t.AudioUrl ?? "",
                t.CoverUrl,
                t.TrackNumber,
                t.Duration,
                t.CreatedAt
            )).ToList();

            // Convert playlists to SearchPlaylistDTO
            var playlistDTOs = playlists.Select(p => new SearchPlaylistDTO(
                p.Id,
                p.Name,
                p.OwnerId,
                p.Owner?.Username ?? "Unknown",
                p.IsPublic,
                p.CreatedAt
            )).ToList();

            // Convert users to SearchUserDTO
            var userDTOs = new List<SearchUserDTO>();
            foreach (var u in users)
            {
                var profile = await _profileRepo.GetByUserIdAsync(u.Id);
                userDTOs.Add(new SearchUserDTO(
                    u.Id,
                    u.Username,
                    profile?.AvatarUrl,
                    u.Email
                ));
            }

            return new SearchResultsDTO(trackDTOs, artists, playlistDTOs, userDTOs);
        }
    }
}
