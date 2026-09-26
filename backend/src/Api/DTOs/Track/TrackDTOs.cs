namespace Backend.src.Api.DTOs.Track;
using System.Text.Json.Serialization;

public record CreateTrackRequest(
    Guid? AlbumId,
    string Title,
    IFormFile Audio,
    IFormFile? Cover,
    int? TrackNumber
);

public record UpdateTrackRequest(
    string? Title,
    int? TrackNumber
);

public record TrackDTO(
    [property: JsonPropertyName("id")] Guid Id,
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("artist_name")] string ArtistName,
    [property: JsonPropertyName("audio_url")] string AudioUrl,
    [property: JsonPropertyName("cover_url")] string? CoverUrl,
    [property: JsonPropertyName("track_number")] int? TrackNumber,
    [property: JsonPropertyName("duration")] int Duration,
    [property: JsonPropertyName("created_at")] DateTimeOffset CreatedAt
);
