using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly AppDbContext _context;

        public RefreshTokenRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RefreshToken> AddAsync(RefreshToken token)
        {
            await _context.RefreshTokens.AddAsync(token);
            await _context.SaveChangesAsync();
            return token;
        }

        public async Task<List<RefreshToken>?> GetByUserIdAsync(Guid userId)
        {
            return await _context.RefreshTokens
                .Where(t => t.UserId == userId)
                .ToListAsync();
        }

        public async Task<RefreshToken?> UpdateAsync(RefreshToken token)
        {
            var existing = await _context.RefreshTokens
                .FindAsync(token.Id);

            if (existing == null)
                return null;

            _context.Entry(existing)
                .CurrentValues
                .SetValues(token);

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(Guid userId)
        {
            var token = await _context.Profiles.FindAsync(userId);
            if (token == null)
                return false;

            _context.Profiles.Remove(token);
            await _context.SaveChangesAsync();
            return true;
        }

        // Revoke all old token except for the latest one from a user based on
        // their user ID
        public async Task<bool> RevokeOldTokenByUserIdAsync(Guid userId)
        {
            string query = """
                  UPDATE refresh_tokens
                  SET revoked_at = NOW()
                  WHERE user_id = {0}
                  AND id != (
                      SELECT id FROM refresh_tokens
                      WHERE user_id = {0}
                      ORDER BY created_at DESC
                      LIMIT 1
                  )
                  """;

            int rowsAffected = await _context.Database
              .ExecuteSqlRawAsync(query, userId);

            return rowsAffected > 0;
        }

        public async Task<RefreshToken?> GetValidTokenById(Guid userId)
        {
            string query = """
              SELECT * FROM refresh_tokens
              WHERE revoked_at IS NULL
              AND user_id = {0}
              ORDER BY created_at DESC
              LIMIT 1
              """;

            var token = await _context.RefreshTokens
              .FromSqlRaw(query, userId)
              .AsNoTracking()
              .FirstOrDefaultAsync();

            return token;
        }

        public async Task<bool> RevokeAllTokensByUserIdAsync(Guid userId)
        {
            string query = """
                  UPDATE refresh_tokens
                  SET revoked_at = NOW()
                  WHERE user_id = {0}
                  AND revoked_at IS NULL
                  """;

            int rowsAffected = await _context.Database
              .ExecuteSqlRawAsync(query, userId);

            return rowsAffected > 0;
        }
    }
}
