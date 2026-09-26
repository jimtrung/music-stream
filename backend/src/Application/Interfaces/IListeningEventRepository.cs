using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IListeningEventRepository
    {
        Task<ListeningEvent> AddAsync(ListeningEvent le);
        Task<ListeningEvent?> GetByIdAsync(Guid value);
        Task<ListeningEvent?> UpdateAsync(ListeningEvent le);
        Task<bool> DeleteAsync(Guid leId);
        Task<List<ListeningEvent>> GetAllAsync();
    }
}
