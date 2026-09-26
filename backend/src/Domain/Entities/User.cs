namespace Backend.src.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Password { get; set; }
        public UserRole Role { get; set; }
        public Provider Provider { get; set; }
        public string? Token { get; set; }
        public bool IsVerified { get; set; }
        public bool IsPremium { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
    }
}
