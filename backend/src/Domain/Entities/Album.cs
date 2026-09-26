namespace Backend.src.Domain.Entities;

public class Album
{
    public Guid Id { get; set; }
    public Guid ArtistId { get; set; }
    public string Title { get; set; } = null!;
    public string? CoverUrl { get; set; }
    public DateTimeOffset? ReleaseDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public Artist Artist { get; set; } = null!;
}
