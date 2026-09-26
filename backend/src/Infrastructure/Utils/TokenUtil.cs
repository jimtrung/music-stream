using System.Security.Cryptography;

namespace Backend.src.Infrastructure.Utils
{
    public static class TokenUtil
    {
        public static string GenerateToken()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var bytes = new byte[32];
                rng.GetBytes(bytes);
                return Convert.ToBase64String(bytes)
                    .Replace("+", "-")
                    .Replace("/", "_")
                    .Replace("=", "");
            }
        }
    }
}
