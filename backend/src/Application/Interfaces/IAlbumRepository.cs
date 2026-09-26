using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IAlbumRepository
    {
        Task<Album> AddAsync(Album album);
        Task<Album?> GetByIdAsync(Guid value);
        Task<List<Album>?> GetByArtistIdAsync(Guid value);
        Task<Album?> UpdateAsync(Album album);
        Task<bool> DeleteAsync(Guid albumId);
        Task<List<Album>> GetAllAsync();
    }
}
