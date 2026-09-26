using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly AppDbContext _context;

        public SubscriptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Subscription> AddAsync(Subscription subscription)
        {
            await _context.AddAsync(subscription);
            await _context.SaveChangesAsync();
            return subscription;
        }

        public async Task<Subscription?> GetByIdAsync(Guid value)
        {
            return await _context.Subscriptions.FirstOrDefaultAsync(s => s.Id == value);
        }

        public async Task<Subscription?> GetByUserIdAsync(Guid value)
        {
            return await _context.Subscriptions.FirstOrDefaultAsync(s => s.UserId == value);
        }

        public async Task<Subscription?> UpdateAsync(Subscription subscription)
        {
            var existingSub = await _context.Subscriptions.FindAsync(subscription.Id);
            if (existingSub == null)
                return null;

            _context.Entry(existingSub).CurrentValues.SetValues(subscription);
            await _context.SaveChangesAsync();
            return existingSub;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var sub = await _context.Subscriptions.FindAsync(id);
            if (sub == null)
                return false;

            _context.Subscriptions.Remove(sub);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<Subscription>> GetAllAsync()
        {
            return await _context.Subscriptions.ToListAsync();
        }
    }
}
