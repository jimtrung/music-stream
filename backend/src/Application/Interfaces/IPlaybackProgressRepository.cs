using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IPlaybackProgressRepository
    {
        Task<PlaybackProgress> AddAsync(PlaybackProgress pp);
        Task<PlaybackProgress?> GetByUserIdAsync(Guid value);
        Task<PlaybackProgress?> UpdateAsync(PlaybackProgress pp);
        Task<bool> DeleteAsync(Guid ppId);
        Task<List<PlaybackProgress>> GetAllAsync();
    }
}
