using Backend.src.Domain.Entities;

namespace Backend.src.Application.Interfaces
{
    public interface IPlaylistTrackRepository
    {
        Task<PlaylistTrack> AddAsync(PlaylistTrack playlistTrack);
        Task<List<PlaylistTrack>?> GetByPlaylistIdAsync(Guid value);
        Task<List<PlaylistTrack>?> GetByPlaylistIdWithTracksAsync(Guid value);
        Task<PlaylistTrack?> UpdateAsync(PlaylistTrack playlistTrack);
        Task<bool> DeleteAsync(Guid playlistTrackId);
        Task<bool> DeleteByCompositeKeyAsync(Guid playlistId, Guid trackId);
        Task<List<PlaylistTrack>> GetAllAsync();
    }
}
