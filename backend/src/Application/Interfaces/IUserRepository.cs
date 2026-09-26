using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User> AddAsync(User user);
        Task<User?> GetByIdAsync(Guid value);
        Task<User?> GetByUsernameAsync(string value);
        Task<User?> GetByEmailAsync(string value);
        Task<User?> GetByTokenAsync(string token);
        Task<User?> UpdateAsync(User user);
        Task<bool> DeleteAsync(Guid userId);
        Task<User?> GetByUsernameOrEmailAsync(string username, string email);
        Task<List<User>> GetAllUsersAsync();
        Task<List<User>> SearchAsync(string query);
    }
}
