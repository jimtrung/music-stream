namespace Backend.src.Domain.Entities;

public class ListeningEvent
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TrackId { get; set; }
    public DateTimeOffset ListenedAt { get; set; }
    public int ListenDuration { get; set; }
}

