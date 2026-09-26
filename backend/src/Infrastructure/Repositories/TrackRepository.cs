using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class TrackRepository : ITrackRepository
    {
        private readonly AppDbContext _context;

        public TrackRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Track> AddAsync(Track track)
        {
            await _context.AddAsync(track);
            await _context.SaveChangesAsync();
            return track;
        }

        public async Task<Track?> GetByIdAsync(Guid value)
        {
            return await _context.Tracks.FirstOrDefaultAsync(t => t.Id == value);
        }

        public async Task<List<Track>?> GetByAlbumIdAsync(Guid value)
        {
            return await _context.Tracks.Where(t => t.AlbumId == value).ToListAsync();
        }

        public async Task<Track?> UpdateAsync(Track track)
        {
            var existingTrack = await _context.Tracks.FindAsync(track.Id);
            if (existingTrack == null)
                return null;

            _context.Entry(existingTrack).CurrentValues.SetValues(track);
            await _context.SaveChangesAsync();
            return existingTrack;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var track = await _context.Tracks.FindAsync(id);
            if (track == null)
                return false;

            _context.Tracks.Remove(track);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Track>> GetAllAsync()
        {
            return await _context.Tracks
              .Include(a => a.Artist)
              .ToListAsync();
        }
        public async Task<List<Track>> GetPaginatedAsync(int page, int pageSize)
        {
            return await _context.Tracks
                .Include(a => a.Artist)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<Track>> SearchAsync(string query)
        {
            var lowerQuery = query.ToLower();
            return await _context.Tracks
                .Include(a => a.Artist)
                .Where(t => t.Title.ToLower().Contains(lowerQuery) || 
                           (t.Artist != null && t.Artist.Name.ToLower().Contains(lowerQuery)))
                .OrderBy(t => t.Title)
                .ToListAsync();
        }
    }
}
