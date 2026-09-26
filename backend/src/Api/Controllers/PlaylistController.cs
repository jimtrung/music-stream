using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Domain.Entities;
using Backend.src.Api.DTOs.Playlist;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("playlist")]
    [Authorize]
    public class PlaylistController : Controller
    {
        private readonly PlaylistService _playlistService;

        public PlaylistController(PlaylistService playlistService)
        {
            _playlistService = playlistService;
        }

        [HttpPost]
        public async Task<ActionResult<Playlist>> Create([FromBody] CreatePlaylistRequest request)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            Playlist savedPlaylist = await _playlistService.Create(userId, request);

            return Ok(savedPlaylist);
        }

        [HttpPost("add")]
        public async Task<ActionResult<PlaylistTrack>> Add([FromBody] AddTrackRequest request)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            var res = await _playlistService.Add(userId, request);

            return Ok(res);
        }

        [HttpGet("all")]
        public async Task<ActionResult<List<PlaylistDTO>>> GetAll([FromQuery] int? page = null, [FromQuery] int? pageSize = null)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            if (page.HasValue && pageSize.HasValue)
            {
                var paginatedPlaylists = await _playlistService.GetPaginatedPublic(page.Value, pageSize.Value);
                return Ok(paginatedPlaylists);
            }

            var playlists = await _playlistService.GetAll();

            return Ok(playlists);
        }
    }
}

