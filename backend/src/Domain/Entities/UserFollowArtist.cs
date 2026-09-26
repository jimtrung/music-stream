namespace Backend.src.Domain.Entities;

public class UserFollowArtist
{
    public Guid UserId { get; set; }
    public Guid ArtistId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

