using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Backend.src.Api.DTOs.Playlist;

namespace Backend.src.Infrastructure.Repositories
{
    public class PlaylistTrackRepository : IPlaylistTrackRepository
    {
        private readonly AppDbContext _context;

        public PlaylistTrackRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PlaylistTrack> AddAsync(PlaylistTrack playlistTrack)
        {
            await _context.AddAsync(playlistTrack);
            await _context.SaveChangesAsync();
            return playlistTrack;
        }

        public async Task<List<PlaylistTrack>?> GetByPlaylistIdAsync(Guid value)
        {
            return await _context.PlaylistTracks.Where(pt => pt.PlaylistId == value).ToListAsync();
        }

        public async Task<List<PlaylistTrack>?> GetByPlaylistIdWithTracksAsync(Guid value)
        {
            return await _context.PlaylistTracks
                .Where(pt => pt.PlaylistId == value)
                .Include(pt => pt.Track)
                    .ThenInclude(t => t.Artist)
                .OrderBy(pt => pt.Position)
                .ToListAsync();
        }

        public async Task<PlaylistTrack?> UpdateAsync(PlaylistTrack playlistTrack)
        {
            var existingPt = await _context.PlaylistTracks.FindAsync(playlistTrack.PlaylistId);
            if (existingPt == null)
                return null;

            _context.Entry(existingPt).CurrentValues.SetValues(playlistTrack);
            await _context.SaveChangesAsync();
            return existingPt;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var pt = await _context.PlaylistTracks.FindAsync(id);
            if (pt == null)
                return false;

            _context.PlaylistTracks.Remove(pt);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteByCompositeKeyAsync(Guid playlistId, Guid trackId)
        {
            var pt = await _context.PlaylistTracks
                .FirstOrDefaultAsync(p => p.PlaylistId == playlistId && p.TrackId == trackId);
            if (pt == null)
                return false;

            _context.PlaylistTracks.Remove(pt);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<PlaylistTrack>> GetAllAsync()
        {
            return await _context.PlaylistTracks.ToListAsync();
        }
    }
}
