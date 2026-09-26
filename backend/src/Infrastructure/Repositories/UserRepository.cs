using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User> AddAsync(User user)
        {
            await _context.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User?> GetByIdAsync(Guid value)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == value);
        }

        public async Task<User?> GetByUsernameAsync(string value)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == value);
        }

        public async Task<User?> GetByEmailAsync(string value)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == value);
        }

        public async Task<User?> GetByTokenAsync(string token)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Token == token);
        }

        public async Task<User?> UpdateAsync(User user)
        {
            var existingUser = await _context.Users.FindAsync(user.Id);
            if (existingUser == null)
                return null;

            _context.Entry(existingUser).CurrentValues.SetValues(user);
            await _context.SaveChangesAsync();
            return existingUser;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return false;

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<User?> GetByUsernameOrEmailAsync(string username, string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u =>
                (u.Username == username) || (u.Email == email)
            );
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.ToListAsync();
        }

        public async Task<List<User>> SearchAsync(string query)
        {
            var lowerQuery = query.ToLower();
            return await _context.Users
                .Where(u => u.Username.ToLower().Contains(lowerQuery) || 
                           u.Email.ToLower().Contains(lowerQuery))
                .OrderBy(u => u.Username)
                .ToListAsync();
        }
    }
}
