namespace Backend.src.Api.DTOs.Artist;

public record CreateArtistRequest(string Name);
public record UpdateArtistRequest(string? Name);
public record ArtistResponse(Guid Id, string Name, string? Username, string? AvatarUrl, bool IsVerified, int FollowersCount);
