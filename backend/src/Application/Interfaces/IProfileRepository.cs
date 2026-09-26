using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IProfileRepository
    {
        Task<Profile> AddAsync(Profile profile);
        Task<Profile?> GetByUserIdAsync(Guid userId);
        Task<Profile?> UpdateAsync(Profile profile);
        Task<bool> DeleteAsync(Guid userId);
        Task<List<Profile>> GetAllAsync();
    }
}

