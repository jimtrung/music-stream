using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class AlbumRepository : IAlbumRepository
    {
        private readonly AppDbContext _context;
        public AlbumRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Album> AddAsync(Album album)
        {
            await _context.AddAsync(album);
            await _context.SaveChangesAsync();
            return album;
        }

        public async Task<Album?> GetByIdAsync(Guid value)
        {
            return await _context.Albums.FirstOrDefaultAsync(u => u.Id == value);
        }

        public async Task<List<Album>?> GetByArtistIdAsync(Guid value)
        {
            return await _context.Albums.Where(u => u.ArtistId == value).ToListAsync();
        }

        public async Task<Album?> UpdateAsync(Album album)
        {
            var existingAlbum = await _context.Albums.FindAsync(album.Id);
            if (existingAlbum == null)
                return null;

            _context.Entry(existingAlbum).CurrentValues.SetValues(album);
            await _context.SaveChangesAsync();
            return existingAlbum;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var album = await _context.Albums.FindAsync(id);
            if (album == null)
                return false;

            _context.Albums.Remove(album);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Album>> GetAllAsync()
        {
            return await _context.Albums.ToListAsync();
        }
    }
}
