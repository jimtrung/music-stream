namespace Backend.src.Domain.Entities;

public class PlaybackProgress
{
    public Guid UserId { get; set; }
    public Guid? TrackId { get; set; }
    public int ProgressSeconds { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

