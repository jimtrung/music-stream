using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Api.DTOs.Playlist;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("library")]
    [Authorize]
    public class LibraryController : Controller
    {
        private readonly LibraryService _libraryService;

        public LibraryController(LibraryService libraryService)
        {
            _libraryService = libraryService;
        }

        /// <summary>
        /// Get user's personal playlists
        /// </summary>
        [HttpGet("playlists")]
        public async Task<ActionResult<List<PlaylistDTO>>> GetUserPlaylists()
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) 
                return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            var playlists = await _libraryService.GetUserPlaylists(userId);
            return Ok(playlists);
        }

        /// <summary>
        /// Get liked songs as playlist
        /// </summary>
        [HttpGet("liked-songs")]
        public async Task<ActionResult<PlaylistDTO>> GetLikedSongs()
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) 
                return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            var likedSongs = await _libraryService.GetLikedSongsPlaylist(userId);
            if (likedSongs == null)
                return NotFound();

            return Ok(likedSongs);
        }

        /// <summary>
        /// Sync liked tracks to favorites playlist
        /// </summary>
        [HttpPost("sync-favorites")]
        public async Task<ActionResult> SyncFavorites()
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) 
                return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            try
            {
                await _libraryService.SyncLikedTracksToFavorites(userId);
                return Ok(new { message = "Favorites synced successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Update playlist name and visibility
        /// </summary>
        [HttpPut("playlists/{playlistId}")]
        public async Task<ActionResult<PlaylistDTO>> UpdatePlaylist(Guid playlistId, [FromBody] UpdatePlaylistRequest request)
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) 
                return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            try
            {
                var updated = await _libraryService.UpdatePlaylist(playlistId, userId, request.Name, request.IsPublic);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Delete a playlist
        /// </summary>
        [HttpDelete("playlists/{playlistId}")]
        public async Task<ActionResult> DeletePlaylist(Guid playlistId)
        {
            var user = HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) 
                return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            try
            {
                await _libraryService.DeletePlaylist(playlistId, userId);
                return Ok(new { message = "Playlist deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}

public record UpdatePlaylistRequest(string Name, bool IsPublic);
