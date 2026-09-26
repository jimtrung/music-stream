using Backend.src.Api.DTOs.Track;

namespace Backend.src.Api.DTOs.Playlist;

public record CreatePlaylistRequest(string Name, bool IsPublic);

public record AddTrackRequest(Guid PlaylistId, Guid TrackId, int Position);

public record PlaylistDTO(
    Guid Id,
    Guid OwnerId,
    String OwnerName,
    String Name,
    bool IsPublic,
    List<PlaylistTrackDTO> Tracks,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record PlaylistTrackDTO(
  Guid Id,
  int Position,
  TrackDTO Track,
  DateTimeOffset AddedAt
);
