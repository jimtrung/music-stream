using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class PlaylistRepository : IPlaylistRepository
    {
        private readonly AppDbContext _context;

        public PlaylistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Playlist> AddAsync(Playlist playlist)
        {
            await _context.AddAsync(playlist);
            await _context.SaveChangesAsync();
            return playlist;
        }

        public async Task<Playlist?> GetByIdAsync(Guid value)
        {
            return await _context.Playlists.FirstOrDefaultAsync(p => p.Id == value);
        }

        public async Task<List<Playlist>?> GetByOwnerIdAsync(Guid value)
        {
            return await _context.Playlists.Where(p => p.OwnerId == value).ToListAsync();
        }

        public async Task<Playlist?> UpdateAsync(Playlist playlist)
        {
            var existingPlaylist = await _context.Playlists.FindAsync(playlist.Id);
            if (existingPlaylist == null)
                return null;

            _context.Entry(existingPlaylist).CurrentValues.SetValues(playlist);
            await _context.SaveChangesAsync();
            return existingPlaylist;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var playlist = await _context.Playlists.FindAsync(id);
            if (playlist == null)
                return false;

            _context.Playlists.Remove(playlist);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Playlist>> GetAllAsync()
        {
            return await _context.Playlists.ToListAsync();
        }

        public async Task<List<Playlist>> GetAllPublicAsync()
        {
            return await _context.Playlists
                .Where(p => p.IsPublic)
                .Include(p => p.Owner)
                .ToListAsync();
        }
        public async Task<List<Playlist>> GetPaginatedAsync(int page, int pageSize)
        {
            return await _context.Playlists
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<Playlist>> GetPaginatedPublicAsync(int page, int pageSize)
        {
            return await _context.Playlists
                .Where(p => p.IsPublic)
                .Include(p => p.Owner)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<Playlist>> SearchAsync(string query)
        {
            var lowerQuery = query.ToLower();
            return await _context.Playlists
                .Where(p => p.IsPublic && p.Name.ToLower().Contains(lowerQuery))
                .Include(p => p.Owner)
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<Playlist?> GetByOwnerIdAndNameAsync(Guid ownerId, string name)
        {
            return await _context.Playlists
                .FirstOrDefaultAsync(p => p.OwnerId == ownerId && p.Name == name);
        }
    }
}
