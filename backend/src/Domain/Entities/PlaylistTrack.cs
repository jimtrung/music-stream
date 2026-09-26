namespace Backend.src.Domain.Entities;

public class PlaylistTrack
{
    public Guid PlaylistId { get; set; }
    public Guid TrackId { get; set; }
    public int Position { get; set; }
    public DateTimeOffset AddedAt { get; set; }

    public Track Track { get; set; } = null!;
}

