using Google.Apis.Auth;

namespace Backend.src.Application.Services;

public class GoogleAuthService
{
    private readonly string _webClientId;

    public GoogleAuthService(IConfiguration config)
    {
        _webClientId = config["Google:WebClientId"]!;
    }

    public async Task<GoogleJsonWebSignature.Payload> VerifyAsync(string idToken)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = new[] { _webClientId }
        };

        return await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
    }
}

