using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IUserLikeTrackRepository
    {
        Task<UserLikeTrack> AddAsync(UserLikeTrack ult);
        Task<UserLikeTrack?> GetByUserIdAsync(Guid value);
        Task<UserLikeTrack?> GetByTrackIdAsync(Guid value);
        Task<UserLikeTrack?> UpdateAsync(UserLikeTrack ult);
        Task<bool> DeleteAsync(Guid ultId);
        Task<List<UserLikeTrack>> GetAllAsync();
        Task<List<UserLikeTrack>> GetAllByUserIdAsync(Guid userId);
        Task<bool> DeleteByUserAndTrackAsync(Guid userId, Guid trackId);
        Task<bool> ExistsByUserAndTrackAsync(Guid userId, Guid trackId);
    }
}
