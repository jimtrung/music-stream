using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class PlaybackProgressRepository : IPlaybackProgressRepository
    {
        private readonly AppDbContext _context;

        public PlaybackProgressRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PlaybackProgress> AddAsync(PlaybackProgress pp)
        {
            await _context.AddAsync(pp);
            await _context.SaveChangesAsync();
            return pp;
        }

        public async Task<PlaybackProgress?> GetByUserIdAsync(Guid value)
        {
            return await _context.PlaybackProgresses.FirstOrDefaultAsync(p => p.UserId == value);
        }

        public async Task<PlaybackProgress?> UpdateAsync(PlaybackProgress pp)
        {
            var existingPp = await _context.PlaybackProgresses.FindAsync(pp.UserId);
            if (existingPp == null)
                return null;

            _context.Entry(existingPp).CurrentValues.SetValues(pp);
            await _context.SaveChangesAsync();
            return existingPp;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var pp = await _context.PlaybackProgresses.FindAsync(id);
            if (pp == null)
                return false;

            _context.PlaybackProgresses.Remove(pp);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<PlaybackProgress>> GetAllAsync()
        {
            return await _context.PlaybackProgresses.ToListAsync();
        }
    }
}
