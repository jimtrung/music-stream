namespace Backend.src.Domain.Entities;

public class TrackStat
{
    public Guid TrackId { get; set; }
    public long PlayCount { get; set; }
    public DateTimeOffset? LastPlayedAt { get; set; }
}

