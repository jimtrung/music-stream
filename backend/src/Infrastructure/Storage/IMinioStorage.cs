namespace Backend.src.Infrastructure.Storage;

public interface IMinioStorage
{
    Task<string> UploadAvatarAsync(IFormFile file, Guid artistId);
    Task<string> UploadTrackCoverAsync(IFormFile file, Guid trackId);
    Task<string> UploadTrackAsync(IFormFile file, Guid trackId);
}
