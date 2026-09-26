using Backend.src.Domain.Entities;
using Backend.src.Api.DTOs.Artist;

namespace Backend.src.Application.Interfaces
{
    public interface IArtistRepository
    {
        Task<Artist> AddAsync(Artist artist);
        Task<Artist?> GetByIdAsync(Guid value);
        Task<Artist?> GetByNameAsync(string name);
        Task<Artist?> UpdateAsync(Artist artist);
        Task<bool> DeleteAsync(Guid artistId);
        Task<List<Artist>> GetAllAsync();
        Task<List<ArtistResponse>> GetPaginatedAsync(int page, int pageSize);
        Task<List<ArtistResponse>> SearchAsync(string query);
        Task<List<ArtistResponse>> GetAllArtistsResponseAsync();
    }
}
