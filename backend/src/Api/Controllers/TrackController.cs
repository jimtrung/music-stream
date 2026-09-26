using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Domain.Entities;
using Backend.src.Api.DTOs.Track;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("track")]
    [Authorize]
    public class TrackController : Controller
    {
        private readonly TrackService _trackService;

        public TrackController(TrackService trackService)
        {
            _trackService = trackService;
        }

        [HttpPost]
        public async Task<ActionResult<Track>> Create([FromForm] CreateTrackRequest request)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized("Empty user id");

            Guid userId = Guid.Parse(userIdString);

            Track savedTrack = await _trackService.CreateAsync(request, userId);

            return Ok(savedTrack);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Track>> GetById(Guid id)
        {
            var track = await _trackService.GetByIdAsync(id);
            if (track == null)
                return NotFound("Track không tồn tại");

            await _trackService.IncrementPlayCountAsync(id);

            return Ok(track);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TrackDTO>>> GetAll([FromQuery] int? page = null, [FromQuery] int? pageSize = null)
        {
            if (page.HasValue && pageSize.HasValue)
            {
                var paginatedTracks = await _trackService.GetPaginatedAsync(page.Value, pageSize.Value);
                return Ok(paginatedTracks);
            }
            var tracks = await _trackService.GetAllAsync();
            return Ok(tracks);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Track>> Update(Guid id, [FromBody] UpdateTrackRequest request)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            Track updatedTrack = await _trackService.UpdateAsync(id, request.Title, request.TrackNumber);

            return Ok(updatedTrack);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            var user = HttpContext.User;

            if (user?.Identity == null || !user.Identity.IsAuthenticated)
                return Unauthorized("Chưa đăng nhập");

            bool result = await _trackService.DeleteAsync(id);
            if (!result)
                return NotFound("Track không tồn tại");

            return Ok(new { message = "Xóa track thành công" });
        }

        [HttpPost("{id}/like")]
        public async Task<ActionResult> LikeTrack(Guid id)
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
                bool result = await _trackService.LikeTrackAsync(id, userId);
                return Ok(new { success = result, message = "Track liked successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("{id}/like")]
        public async Task<ActionResult> UnlikeTrack(Guid id)
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
                bool result = await _trackService.UnlikeTrackAsync(id, userId);
                return Ok(new { success = result, message = "Track unliked successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("{id}/is-liked")]
        public async Task<ActionResult> IsTrackLiked(Guid id)
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
                bool isLiked = await _trackService.IsTrackLikedAsync(id, userId);
                return Ok(new { isLiked });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
