using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface ISubscriptionRepository
    {
        Task<Subscription> AddAsync(Subscription subscription);
        Task<Subscription?> GetByIdAsync(Guid value);
        Task<Subscription?> GetByUserIdAsync(Guid value);
        Task<Subscription?> UpdateAsync(Subscription subscription);
        Task<bool> DeleteAsync(Guid subscriptionId);
        Task<List<Subscription>> GetAllAsync();
    }
}
