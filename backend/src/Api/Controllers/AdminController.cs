using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Api.DTOs.Admin;
using Backend.src.Api.DTOs.Artist;
using Backend.src.Domain.Entities;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("admin")]
    [Authorize] // Should be [Authorize(Roles = "admin")] but I need to make sure role claim is mapped
    public class AdminController : Controller
    {
        private readonly AdminService _adminService;

        public AdminController(AdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDTO>> GetStats()
        {
            var role = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "admin") return Forbid("Bạn không có quyền truy cập");

            return Ok(await _adminService.GetDashboardStatsAsync());
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<User>>> GetUsers()
        {
            var role = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "admin") return Forbid("Bạn không có quyền truy cập");

            return Ok(await _adminService.GetAllUsersAsync());
        }

        [HttpGet("artists")]
        public async Task<ActionResult<List<ArtistResponse>>> GetArtists()
        {
            var role = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "admin") return Forbid("Bạn không có quyền truy cập");

            return Ok(await _adminService.GetAllArtistsAsync());
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var role = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "admin") return Forbid("Bạn không có quyền truy cập");

            bool success = await _adminService.DeleteUserAsync(id);
            if (!success) return NotFound("User không tồn tại");
            return Ok(new { message = "Xóa user thành công" });
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequestDTO request)
        {
            var role = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "admin") return Forbid("Bạn không có quyền truy cập");

            if (!Enum.TryParse<UserRole>(request.Role, true, out var parsedRole))
            {
                return BadRequest("Role không hợp lệ");
            }

            var updatedUser = await _adminService.UpdateUserRoleAsync(id, parsedRole, request.IsVerified);
            if (updatedUser == null) return NotFound("User không tồn tại");
            
            return Ok(updatedUser);
        }

        [HttpDelete("artists/{id}")]
        public async Task<IActionResult> DeleteArtist(Guid id)
        {
            var role = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "admin") return Forbid("Bạn không có quyền truy cập");

            bool success = await _adminService.DeleteArtistAsync(id);
            if (!success) return NotFound("Artist không tồn tại");
            return Ok(new { message = "Xóa artist thành công" });
        }

        [HttpDelete("tracks/{id}")]
        public async Task<IActionResult> DeleteTrack(Guid id)
        {
            var role = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            if (role != "admin") return Forbid("Bạn không có quyền truy cập");

            bool success = await _adminService.DeleteTrackAsync(id);
            if (!success) return NotFound("Track không tồn tại");
            return Ok(new { message = "Xóa track thành công" });
        }
    }
}
