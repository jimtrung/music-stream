using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Microsoft.EntityFrameworkCore;

namespace Backend.src.Infrastructure.Repositories
{
    public class ListeningEventRepository : IListeningEventRepository
    {
        private readonly AppDbContext _context;
        public ListeningEventRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ListeningEvent> AddAsync(ListeningEvent le)
        {
            await _context.AddAsync(le);
            await _context.SaveChangesAsync();
            return le;
        }

        public async Task<ListeningEvent?> GetByIdAsync(Guid value)
        {
            return await _context.ListeningEvents.FirstOrDefaultAsync(u => u.Id == value);
        }

        public async Task<ListeningEvent?> UpdateAsync(ListeningEvent le)
        {
            var existingLe = await _context.ListeningEvents.FindAsync(le.Id);
            if (existingLe == null)
                return null;

            _context.Entry(existingLe).CurrentValues.SetValues(le);
            await _context.SaveChangesAsync();
            return existingLe;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var le = await _context.ListeningEvents.FindAsync(id);
            if (le == null)
                return false;

            _context.ListeningEvents.Remove(le);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ListeningEvent>> GetAllAsync()
        {
            return await _context.ListeningEvents.ToListAsync();
        }
    }
}
