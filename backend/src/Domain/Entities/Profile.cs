namespace Backend.src.Domain.Entities
{
    public class Profile
    {
        public Guid UserId { get; set; }
        public string? Name { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}

