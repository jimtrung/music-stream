namespace Backend.src.Api.DTOs.Auth;

public record SignUpRequest(string Username, string Email, string Password);
public record SignInRequest(string Username, string Password);
public record RefreshResponse(string AccessToken);
public record ForgotPasswordRequest(string Email);
public record AuthToken(string AccessToken);

public record ProfileDTO(
    Guid Id,
    string Username,
    string? Name,
    string Email,
    string? AvatarUrl,
    bool IsVerified,
    bool IsPremium,
    string Role,
    int Followers,
    int Following,
    int Playlists
);

public record GoogleLoginDto(string IdToken);
public record ResendEmailVerificationRequest(string Email);

public record UpdateProfileRequest(string? Name, IFormFile? Avatar);
