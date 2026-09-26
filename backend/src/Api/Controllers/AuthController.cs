using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Api.DTOs.Auth;
using Backend.src.Application.Services;
using Backend.src.Domain.Entities;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : Controller
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("signup")]
        public async Task<ActionResult<User>> SignUp([FromBody] SignUpRequest request)
        {
            var user = await _authService.SignUpAsync(request);
            return Ok(user);
        }

        [HttpPost("signin")]
        public async Task<ActionResult<AuthToken>> SignIn([FromBody] SignInRequest request)
        {
            var authToken = await _authService.SignInAsync(request);
            return Ok(authToken);
        }

        [HttpPost("google")]
        public async Task<ActionResult<AuthToken>> GoogleLogin([FromBody] GoogleLoginDto request)
        {
            AuthToken authToken = await _authService.GoogleSignInAsync(request);
            return Ok(authToken);
        }

        [HttpGet("refresh")]
        public async Task<ActionResult<string>> Refresh()
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            var userIdStr = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("Invalid user ID");
            if (!Guid.TryParse(userIdStr, out Guid userId)) return Unauthorized("Invalid user ID format");

            RefreshResponse? newAccessToken = await _authService.RefreshAsync(userId);
            if (newAccessToken == null) return Unauthorized("Failed to create new token");
            return Ok(newAccessToken);
        }

        [HttpPost("resend-verification-email")]
        public async Task<ActionResult> ResendVerificationEmail([FromBody] ResendEmailVerificationRequest req)
        {
            await _authService.SendVerificationEmailAsync(req.Email);
            return Ok("Email xác thực đã được gửi đi");
        }

        [HttpGet("verify-email")]
        public async Task<ActionResult> VerifyEmail([FromQuery] string token)
        {
            var result = await _authService.VerifyEmailAsync(token);
            return Content(result, "text/html");
        }

        [HttpGet("me")]
        public async Task<ActionResult<User>> GetUser()
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            var userIdStr = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("Invalid user ID");
            if (!Guid.TryParse(userIdStr, out Guid userId)) return Unauthorized("Invalid user ID format");

            User? userInfo = await _authService.GetUserAsync(userId);

            return Ok(userInfo);
        }

        [HttpGet("profile")]
        public async Task<ActionResult<ProfileDTO>> GetProfile()
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            var userIdStr = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("Invalid user ID");
            Guid userId = Guid.Parse(userIdStr);

            ProfileDTO? res = await _authService.GetProfileAsync(userId);

            return Ok(res);
        }

        [HttpGet("profile/{username}")]
        [AllowAnonymous]
        public async Task<ActionResult<ProfileDTO>> GetProfileByUsername(string username)
        {
            ProfileDTO? res = await _authService.GetProfileByUsernameAsync(username);
            return Ok(res);
        }

        [HttpPut("profile")]
        public async Task<ActionResult<string>> UpdateProfile([FromForm] UpdateProfileRequest request)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            var userIdStr = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("Invalid user ID");
            Guid userId = Guid.Parse(userIdStr);

            await _authService.UpdateProfileAsync(userId, request);

            return Ok("User profile updated successfully");
        }
        [HttpPost("signout")]
        public async Task<ActionResult> SignOut()
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            var userIdStr = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized("Invalid user ID");
            Guid userId = Guid.Parse(userIdStr);

            await _authService.SignOutAsync(userId);

            return Ok("User signed out successfully");
        }
    }
}
