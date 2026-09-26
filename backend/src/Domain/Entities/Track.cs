namespace Backend.src.Domain.Entities;

public class Track
{
    public Guid Id { get; set; }
    public Guid ArtistId { get; set; }
    public Guid? AlbumId { get; set; }
    public string Title { get; set; } = null!;
    public string AudioUrl { get; set; } = null!;
    public string? CoverUrl { get; set; }
    public int? TrackNumber { get; set; }
    public int Duration { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Album? Album { get; set; }
    public Artist Artist { get; set; } = null!;

    public ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
}

