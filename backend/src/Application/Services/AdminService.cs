using Backend.src.Api.DTOs.Admin;
using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Backend.src.Api.DTOs.Artist;

namespace Backend.src.Application.Services
{
    public class AdminService
    {
        private readonly IUserRepository _userRepo;
        private readonly IArtistRepository _artistRepo;
        private readonly ITrackRepository _trackRepo;
        private readonly AppDbContext _context;

        public AdminService(
            IUserRepository userRepo,
            IArtistRepository artistRepo,
            ITrackRepository trackRepo,
            AppDbContext context)
        {
            _userRepo = userRepo;
            _artistRepo = artistRepo;
            _trackRepo = trackRepo;
            _context = context;
        }

        public async Task<DashboardStatsDTO> GetDashboardStatsAsync()
        {
            int totalUsers = (await _userRepo.GetAllUsersAsync()).Count;
            int totalArtists = (await _artistRepo.GetAllAsync()).Count;
            int totalTracks = (await _trackRepo.GetAllAsync()).Count;

            // Mocking revenue and growth for now as we don't have a payment system yet
            return new DashboardStatsDTO(
                totalUsers,
                totalArtists,
                totalTracks,
                1250000000,
                15.5,
                8.2,
                new List<RevenueChartItemDTO>
                {
                    new("Jan", 85000000),
                    new("Feb", 92000000),
                    new("Mar", 78000000),
                    new("Apr", 105000000),
                    new("May", 120000000),
                    new("Jun", 115000000),
                }
            );
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _userRepo.GetAllUsersAsync();
        }

        public async Task<List<ArtistResponse>> GetAllArtistsAsync()
        {
            var query = from artist in _context.Artists
                        join user in _context.Users on artist.Id equals user.Id into artistUser
                        from u in artistUser.DefaultIfEmpty()
                        join profile in _context.Profiles on artist.Id equals profile.UserId into artistProfile
                        from p in artistProfile.DefaultIfEmpty()
                        let followersCount = _context.UserFollowArtists.Count(ufa => ufa.ArtistId == artist.Id)
                        select new ArtistResponse(
                            artist.Id,
                            artist.Name,
                            u != null ? u.Username : null,
                            p != null ? p.AvatarUrl : null,
                            artist.IsVerified,
                            followersCount
                        );

            return await query.ToListAsync();
        }

        public async Task<bool> DeleteUserAsync(Guid id)
        {
            return await _userRepo.DeleteAsync(id);
        }

        public async Task<User?> UpdateUserRoleAsync(Guid id, UserRole newRole, bool isVerified)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user == null) return null;

            user.Role = newRole;
            user.IsVerified = isVerified;
            return await _userRepo.UpdateAsync(user);
        }

        public async Task<bool> DeleteArtistAsync(Guid id)
        {
            return await _artistRepo.DeleteAsync(id);
        }

        public async Task<bool> DeleteTrackAsync(Guid id)
        {
            return await _trackRepo.DeleteAsync(id);
        }
    }
}
