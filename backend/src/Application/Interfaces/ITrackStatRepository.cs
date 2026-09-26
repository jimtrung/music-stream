using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface ITrackStatRepository
    {
        Task<TrackStat> AddAsync(TrackStat trackStat);
        Task<TrackStat?> GetByTrackIdAsync(Guid value);
        Task<TrackStat?> UpdateAsync(TrackStat trackStat);
        Task<bool> DeleteAsync(Guid trackStatId);
        Task<List<TrackStat>> GetAllAsync();
        Task<TrackStat> IncrementPlayCountAsync(Guid trackId);
    }
}
