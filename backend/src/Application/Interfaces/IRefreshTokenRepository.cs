using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IRefreshTokenRepository
    {
        Task<RefreshToken> AddAsync(RefreshToken token);
        Task<List<RefreshToken>?> GetByUserIdAsync(Guid userId);
        Task<RefreshToken?> UpdateAsync(RefreshToken token);
        Task<bool> DeleteAsync(Guid userId);
        Task<bool> RevokeOldTokenByUserIdAsync(Guid userId);
        Task<RefreshToken?> GetValidTokenById(Guid userId);
        Task<bool> RevokeAllTokensByUserIdAsync(Guid userId);
    }
}

