using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class TrackStatRepository : ITrackStatRepository
    {
        private readonly AppDbContext _context;

        public TrackStatRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TrackStat> AddAsync(TrackStat trackStat)
        {
            await _context.AddAsync(trackStat);
            await _context.SaveChangesAsync();
            return trackStat;
        }

        public async Task<TrackStat?> GetByTrackIdAsync(Guid value)
        {
            return await _context.TrackStats.FirstOrDefaultAsync(ts => ts.TrackId == value);
        }

        public async Task<TrackStat?> UpdateAsync(TrackStat trackStat)
        {
            var existingTs = await _context.TrackStats.FindAsync(trackStat.TrackId);
            if (existingTs == null)
                return null;

            _context.Entry(existingTs).CurrentValues.SetValues(trackStat);
            await _context.SaveChangesAsync();
            return existingTs;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var ts = await _context.TrackStats.FindAsync(id);
            if (ts == null)
                return false;

            _context.TrackStats.Remove(ts);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<TrackStat>> GetAllAsync()
        {
            return await _context.TrackStats.ToListAsync();
        }

        public async Task<TrackStat> IncrementPlayCountAsync(Guid trackId)
        {
            var stat = await _context.TrackStats.FirstOrDefaultAsync(ts => ts.TrackId == trackId);
            if (stat == null)
            {
                stat = new TrackStat
                {
                    TrackId = trackId,
                    PlayCount = 1,
                    LastPlayedAt = DateTimeOffset.UtcNow
                };
                await _context.TrackStats.AddAsync(stat);
            }
            else
            {
                stat.PlayCount++;
                stat.LastPlayedAt = DateTimeOffset.UtcNow;
            }
            await _context.SaveChangesAsync();
            return stat;
        }
    }
}
