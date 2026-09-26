using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface ITrackRepository
    {
        Task<Track> AddAsync(Track track);
        Task<Track?> GetByIdAsync(Guid value);
        Task<List<Track>?> GetByAlbumIdAsync(Guid value);
        Task<Track?> UpdateAsync(Track track);
        Task<bool> DeleteAsync(Guid trackId);
        Task<List<Track>> GetAllAsync();
        Task<List<Track>> GetPaginatedAsync(int page, int pageSize);
        Task<List<Track>> SearchAsync(string query);
    }
}
