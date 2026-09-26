using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IUserFollowArtistRepository
    {
        Task<UserFollowArtist> AddAsync(UserFollowArtist ufa);
        Task<UserFollowArtist?> GetByUserIdAsync(Guid value);
        Task<UserFollowArtist?> GetByArtistIdAsync(Guid value);
        Task<UserFollowArtist?> GetAsync(Guid userId, Guid artistId);
        Task<UserFollowArtist?> UpdateAsync(UserFollowArtist ufa);
        Task<bool> DeleteAsync(Guid userId, Guid artistId);
        Task<List<UserFollowArtist>> GetAllAsync();
        Task<int> GetFollowersCountAsync(Guid artistId);
        Task<int> GetFollowingCountAsync(Guid userId);
    }
}
