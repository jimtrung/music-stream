using Minio;
using Minio.DataModel.Args;

namespace Backend.src.Infrastructure.Storage;

public class MinioStorage : IMinioStorage
{
    private readonly IMinioClient _minio;
    private const string Bucket = "musicstream";

    public MinioStorage(IMinioClient minio)
    {
        _minio = minio;
    }

    public async Task<string> UploadAvatarAsync(IFormFile file, Guid userId)
    {
        if (file == null)
            throw new ArgumentNullException(nameof(file));

        var objectName = $"/images/avatars/{userId}{Path.GetExtension(file.FileName)}";

        await EnsureBucketAsync();

        await _minio.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(Bucket)
                .WithObject(objectName)
                .WithStreamData(file.OpenReadStream())
                .WithObjectSize(file.Length)
                .WithContentType(file.ContentType)
        );

        return objectName;
    }

    public async Task<string> UploadTrackCoverAsync(IFormFile file, Guid trackId)
    {
        if (file == null)
            throw new ArgumentNullException(nameof(file));

        var objectName = $"/images/covers/{trackId}{Path.GetExtension(file.FileName)}";

        await EnsureBucketAsync();

        await _minio.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(Bucket)
                .WithObject(objectName)
                .WithStreamData(file.OpenReadStream())
                .WithObjectSize(file.Length)
                .WithContentType(file.ContentType)
        );

        return objectName;
    }

    public async Task<string> UploadTrackAsync(IFormFile file, Guid trackId)
    {
        if (file == null)
            throw new ArgumentNullException(nameof(file));

        var objectName = $"/audio/tracks/{trackId}.mp3";

        await EnsureBucketAsync();

        await _minio.PutObjectAsync(
            new PutObjectArgs()
                .WithBucket(Bucket)
                .WithObject(objectName)
                .WithStreamData(file.OpenReadStream())
                .WithObjectSize(file.Length)
                .WithContentType("audio/mpeg")
        );

        return objectName;
    }

    private async Task EnsureBucketAsync()
    {
        var exists = await _minio.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(Bucket)
        );

        if (!exists)
        {
            await _minio.MakeBucketAsync(
                new MakeBucketArgs().WithBucket(Bucket)
            );
        }
    }
}
