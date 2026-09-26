using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Domain.Exceptions.Track;
using Backend.src.Domain.Exceptions.System;
using Backend.src.Api.DTOs.Track;
using Backend.src.Infrastructure.Utils;
using Backend.src.Infrastructure.Storage;
using Microsoft.Extensions.Options;
using TagLib;

namespace Backend.src.Application.Services
{
    public class TrackService
    {
        private readonly ITrackRepository _repo;
        private readonly ITrackStatRepository _statRepo;
        private readonly IUserLikeTrackRepository _likeTrackRepo;
        private readonly AppOptions _app;
        private readonly IMinioStorage _fileStorage;

        public TrackService(ITrackRepository repo, ITrackStatRepository statRepo, IUserLikeTrackRepository likeTrackRepo, IOptions<AppOptions> app, IMinioStorage fileStorage)
        {
            _repo = repo;
            _statRepo = statRepo;
            _likeTrackRepo = likeTrackRepo;
            _app = app.Value;
            _fileStorage = fileStorage;
        }

        public async Task<Track> CreateAsync(CreateTrackRequest request, Guid artistId)
        {
            if (request.Title == null) throw new InvalidTrackDataException("Title can not be empty");
            if (request.Audio == null) throw new InvalidTrackDataException("Audio file can not be empty");

            Track track = new Track()
            {
                Id = Guid.NewGuid(),
                ArtistId = artistId,
                AlbumId = request.AlbumId ?? null,
                Title = request.Title,
                TrackNumber = request.TrackNumber ?? null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                using (var stream = request.Audio.OpenReadStream())
                {
                    var tfile = TagLib.File.Create(new StreamFileAbstraction(request.Audio.FileName, stream, stream));
                    track.Duration = (int)tfile.Properties.Duration.TotalSeconds;
                }
            }
            catch (Exception ex)
            {
                throw new InvalidTrackDataException($"Could not extract duration from audio file: {ex.Message}");
            }

            string audioUrl = await _fileStorage.UploadTrackAsync(request.Audio, track.Id);
            track.AudioUrl = audioUrl;

            string coverUrl = null;
            if (request.Cover != null)
            {
                coverUrl = await _fileStorage.UploadTrackCoverAsync(request.Cover, track.Id);
                track.CoverUrl = coverUrl;
            }

            var savedTrack = await _repo.AddAsync(track);

            return savedTrack;
        }

        public async Task<Track?> GetByIdAsync(Guid id)
        {
            return await _repo.GetByIdAsync(id);
        }

        public async Task<List<TrackDTO>> GetAllAsync()
        {
            var tracks = await _repo.GetAllAsync();
            if (tracks == null) throw new TrackNotFoundException("Track not found");

            List<TrackDTO> res = new List<TrackDTO>();

            tracks.ForEach(track =>
            {
                TrackDTO trackRes = new TrackDTO(
                    track.Id,
                    track.Title,
                    track.Artist.Name,
                    track.AudioUrl,
                    track.CoverUrl,
                    track.TrackNumber,
                    track.Duration,
                    track.CreatedAt
                );

                res.Add(trackRes);
            });

            return res;
        }

        public async Task<Track> UpdateAsync(Guid id, string? title, int? trackNumber)
        {
            Track? existingTrack = await _repo.GetByIdAsync(id);
            if (existingTrack == null) throw new TrackNotFoundException("Track not found");

            if (title != null) existingTrack.Title = title;
            if (trackNumber.HasValue) existingTrack.TrackNumber = trackNumber.Value;
            existingTrack.UpdatedAt = DateTime.UtcNow;

            Track? updatedTrack = await _repo.UpdateAsync(existingTrack);
            if (updatedTrack == null) throw new DatabaseOperationException("Failed to update track");

            return updatedTrack;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _repo.DeleteAsync(id);
        }
        public async Task<List<TrackDTO>> GetPaginatedAsync(int page, int pageSize)
        {
            var tracks = await _repo.GetPaginatedAsync(page, pageSize);
            return tracks.Select(track => new TrackDTO(
                track.Id,
                track.Title,
                track.Artist.Name,
                track.AudioUrl,
                track.CoverUrl,
                track.TrackNumber,
                track.Duration,
                track.CreatedAt
            )).ToList();
        }

        public async Task IncrementPlayCountAsync(Guid trackId)
        {
            await _statRepo.IncrementPlayCountAsync(trackId);
        }

        public async Task<bool> LikeTrackAsync(Guid trackId, Guid userId)
        {
            // Check if track exists
            var track = await _repo.GetByIdAsync(trackId);
            if (track == null)
                throw new TrackNotFoundException("Track not found");

            // Check if already liked
            bool exists = await _likeTrackRepo.ExistsByUserAndTrackAsync(userId, trackId);
            if (exists)
                return true; // Already liked

            try
            {
                var likeRecord = new UserLikeTrack
                {
                    UserId = userId,
                    TrackId = trackId,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                await _likeTrackRepo.AddAsync(likeRecord);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UnlikeTrackAsync(Guid trackId, Guid userId)
        {
            return await _likeTrackRepo.DeleteByUserAndTrackAsync(userId, trackId);
        }

        public async Task<bool> IsTrackLikedAsync(Guid trackId, Guid userId)
        {
            return await _likeTrackRepo.ExistsByUserAndTrackAsync(userId, trackId);
        }
    }
}
