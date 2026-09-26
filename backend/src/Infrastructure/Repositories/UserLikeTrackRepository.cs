using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class UserLikeTrackRepository : IUserLikeTrackRepository
    {
        private readonly AppDbContext _context;

        public UserLikeTrackRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserLikeTrack> AddAsync(UserLikeTrack ult)
        {
            await _context.AddAsync(ult);
            await _context.SaveChangesAsync();
            return ult;
        }

        public async Task<UserLikeTrack?> GetByUserIdAsync(Guid value)
        {
            return await _context.UserLikeTracks.FirstOrDefaultAsync(ult => ult.UserId == value);
        }

        public async Task<UserLikeTrack?> GetByTrackIdAsync(Guid value)
        {
            return await _context.UserLikeTracks.FirstOrDefaultAsync(ult => ult.TrackId == value);
        }

        public async Task<UserLikeTrack?> UpdateAsync(UserLikeTrack ult)
        {
            var existingUlt = await _context.UserLikeTracks.FindAsync(ult.UserId, ult.TrackId);
            if (existingUlt == null)
                return null;

            _context.Entry(existingUlt).CurrentValues.SetValues(ult);
            await _context.SaveChangesAsync();
            return existingUlt;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var ult = await _context.UserLikeTracks.FindAsync(id);
            if (ult == null)
                return false;

            _context.UserLikeTracks.Remove(ult);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<UserLikeTrack>> GetAllAsync()
        {
            return await _context.UserLikeTracks.ToListAsync();
        }

        public async Task<List<UserLikeTrack>> GetAllByUserIdAsync(Guid userId)
        {
            return await _context.UserLikeTracks
                .Where(ult => ult.UserId == userId)
                .OrderByDescending(ult => ult.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteByUserAndTrackAsync(Guid userId, Guid trackId)
        {
            var ult = await _context.UserLikeTracks
                .FirstOrDefaultAsync(u => u.UserId == userId && u.TrackId == trackId);
            if (ult == null)
                return false;

            _context.UserLikeTracks.Remove(ult);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsByUserAndTrackAsync(Guid userId, Guid trackId)
        {
            return await _context.UserLikeTracks
                .AnyAsync(u => u.UserId == userId && u.TrackId == trackId);
        }
    }
}
