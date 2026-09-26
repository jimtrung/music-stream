using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class ProfileRepository : IProfileRepository
    {
        private readonly AppDbContext _context;

        public ProfileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Profile> AddAsync(Profile profile)
        {
            await _context.Profiles.AddAsync(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<Profile?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Profiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<Profile?> UpdateAsync(Profile profile)
        {
            var existingProfile = await _context.Profiles
                .FindAsync(profile.UserId);

            if (existingProfile == null)
                return null;

            _context.Entry(existingProfile)
                .CurrentValues
                .SetValues(profile);

            await _context.SaveChangesAsync();
            return existingProfile;
        }

        public async Task<bool> DeleteAsync(Guid userId)
        {
            var profile = await _context.Profiles.FindAsync(userId);
            if (profile == null)
                return false;

            _context.Profiles.Remove(profile);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Profile>> GetAllAsync()
        {
            return await _context.Profiles.ToListAsync();
        }
    }
}

