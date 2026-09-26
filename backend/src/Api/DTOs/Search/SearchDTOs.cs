using Backend.src.Api.DTOs.Artist;
using Backend.src.Api.DTOs.Track;
using Backend.src.Api.DTOs.Playlist;

namespace Backend.src.Api.DTOs.Search;

public record SearchUserDTO(
    Guid Id,
    string Username,
    string? AvatarUrl,
    string? Email
);

public record SearchResultsDTO(
    List<TrackDTO> Tracks,
    List<ArtistResponse> Artists,
    List<SearchPlaylistDTO> Playlists,
    List<SearchUserDTO> Users
);

public record SearchPlaylistDTO(
    Guid Id,
    string Name,
    Guid OwnerId,
    string OwnerName,
    bool IsPublic,
    DateTimeOffset CreatedAt
);
