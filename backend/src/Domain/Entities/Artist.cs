namespace Backend.src.Domain.Entities;

public class Artist
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsVerified { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
