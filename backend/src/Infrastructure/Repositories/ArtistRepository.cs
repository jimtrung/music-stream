using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;
using Backend.src.Api.DTOs.Artist;

namespace Backend.src.Infrastructure.Repositories
{
    public class ArtistRepository : IArtistRepository
    {
        private readonly AppDbContext _context;
        public ArtistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Artist> AddAsync(Artist artist)
        {
            await _context.AddAsync(artist);
            await _context.SaveChangesAsync();
            return artist;
        }

        public async Task<Artist?> GetByIdAsync(Guid value)
        {
            return await _context.Artists.FirstOrDefaultAsync(u => u.Id == value);
        }

        public async Task<Artist?> GetByNameAsync(string name)
        {
            return await _context.Artists.FirstOrDefaultAsync(u => u.Name == name);
        }

        public async Task<Artist?> UpdateAsync(Artist artist)
        {
            var existingArtist = await _context.Artists.FindAsync(artist.Id);
            if (existingArtist == null)
                return null;

            _context.Entry(existingArtist).CurrentValues.SetValues(artist);
            await _context.SaveChangesAsync();
            return existingArtist;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var artist = await _context.Artists.FindAsync(id);
            if (artist == null)
                return false;

            _context.Artists.Remove(artist);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Artist>> GetAllAsync()
        {
            return await _context.Artists.ToListAsync();
        }
        public async Task<List<ArtistResponse>> GetPaginatedAsync(int page, int pageSize)
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

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<ArtistResponse>> SearchAsync(string query)
        {
            var lowerQuery = query.ToLower();
            var artistQuery = from artist in _context.Artists
                              where artist.Name.ToLower().Contains(lowerQuery)
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

            return await artistQuery
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<List<ArtistResponse>> GetAllArtistsResponseAsync()
        {
            var artistQuery = from artist in _context.Artists
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

            return await artistQuery
                .OrderBy(a => a.Name)
                .ToListAsync();
        }
    }
}
