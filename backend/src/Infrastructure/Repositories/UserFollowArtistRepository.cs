using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class UserFollowArtistRepository : IUserFollowArtistRepository
    {
        private readonly AppDbContext _context;

        public UserFollowArtistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserFollowArtist> AddAsync(UserFollowArtist ufa)
        {
            await _context.AddAsync(ufa);
            await _context.SaveChangesAsync();
            return ufa;
        }

        public async Task<UserFollowArtist?> GetByUserIdAsync(Guid value)
        {
            return await _context.UserFollowArtists.FirstOrDefaultAsync(u => u.UserId == value);
        }

        public async Task<UserFollowArtist?> GetByArtistIdAsync(Guid value)
        {
            return await _context.UserFollowArtists.FirstOrDefaultAsync(u => u.ArtistId == value);
        }

        public async Task<UserFollowArtist?> UpdateAsync(UserFollowArtist ufa)
        {
            var existingUfa = await _context.UserFollowArtists.FindAsync(ufa.UserId, ufa.ArtistId);
            if (existingUfa == null)
                return null;

            _context.Entry(existingUfa).CurrentValues.SetValues(ufa);
            await _context.SaveChangesAsync();
            return existingUfa;
        }

        public async Task<UserFollowArtist?> GetAsync(Guid userId, Guid artistId)
        {
            return await _context.UserFollowArtists.FirstOrDefaultAsync(u => u.UserId == userId && u.ArtistId == artistId);
        }

        public async Task<bool> DeleteAsync(Guid userId, Guid artistId)
        {
            var ufa = await _context.UserFollowArtists.FindAsync(userId, artistId);
            if (ufa == null)
                return false;

            _context.UserFollowArtists.Remove(ufa);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserFollowArtist>> GetAllAsync()
        {
            return await _context.UserFollowArtists.ToListAsync();
        }

        public async Task<int> GetFollowersCountAsync(Guid artistId)
        {
            return await _context.UserFollowArtists.CountAsync(u => u.ArtistId == artistId);
        }

        public async Task<int> GetFollowingCountAsync(Guid userId)
        {
            return await _context.UserFollowArtists.CountAsync(u => u.UserId == userId);
        }
    }
}
