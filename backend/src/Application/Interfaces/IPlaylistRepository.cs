using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IPlaylistRepository
    {
        Task<Playlist> AddAsync(Playlist playlist);
        Task<Playlist?> GetByIdAsync(Guid value);
        Task<List<Playlist>?> GetByOwnerIdAsync(Guid value);
        Task<Playlist?> UpdateAsync(Playlist playlist);
        Task<bool> DeleteAsync(Guid playlistId);
        Task<List<Playlist>> GetAllAsync();
        Task<List<Playlist>> GetAllPublicAsync();
        Task<List<Playlist>> GetPaginatedAsync(int page, int pageSize);
        Task<List<Playlist>> GetPaginatedPublicAsync(int page, int pageSize);
        Task<List<Playlist>> SearchAsync(string query);
        Task<Playlist?> GetByOwnerIdAndNameAsync(Guid ownerId, string name);
    }
}
