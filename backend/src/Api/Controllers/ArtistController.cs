using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Domain.Entities;
using Backend.src.Api.DTOs.Artist;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("artist")]
    [Authorize]
    public class ArtistController : Controller
    {
        private readonly ArtistService _artistService;

        public ArtistController(ArtistService artistService)
        {
            _artistService = artistService;
        }

        [HttpPost]
        public async Task<ActionResult<Artist>> Create([FromBody] CreateArtistRequest request)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            Artist savedArtist = await _artistService.CreateAsync(request, userId);

            return Ok(savedArtist);
        }

        [HttpPut]
        public async Task<ActionResult<Artist>> Update([FromBody] UpdateArtistRequest request)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            Artist savedArtist = await _artistService.UpdateAsync(request, userId);

            return Ok(savedArtist);
        }
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<ArtistResponse>>> GetArtists([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var artists = await _artistService.GetPaginatedAsync(page, pageSize);
            return Ok(artists);
        }

        [HttpPost("{id}/follow")]
        public async Task<ActionResult> FollowArtist(Guid id)
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized("Empty user id");

            bool success = await _artistService.FollowArtistAsync(id, Guid.Parse(userIdString));
            if (!success) return BadRequest("Không thể follow nghệ sĩ này");
            
            return Ok(new { message = "Follow thành công" });
        }

        [HttpDelete("{id}/follow")]
        public async Task<ActionResult> UnfollowArtist(Guid id)
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized("Empty user id");

            bool success = await _artistService.UnfollowArtistAsync(id, Guid.Parse(userIdString));
            if (!success) return BadRequest("Không thể unfollow nghệ sĩ này");
            
            return Ok(new { message = "Unfollow thành công" });
        }

        [HttpGet("{id}/follow/status")]
        public async Task<ActionResult> CheckFollowStatus(Guid id)
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Ok(new { isFollowing = false });

            string? userIdString = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Ok(new { isFollowing = false });

            bool isFollowing = await _artistService.CheckFollowStatusAsync(id, Guid.Parse(userIdString));
            
            return Ok(new { isFollowing });
        }
    }
}
