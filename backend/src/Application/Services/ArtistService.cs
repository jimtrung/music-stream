using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Domain.Exceptions.Artist;
using Backend.src.Domain.Exceptions.System;
using Backend.src.Api.DTOs.Artist;
using Backend.src.Infrastructure.Utils;
using Backend.src.Infrastructure.Storage;
using Microsoft.Extensions.Options;

namespace Backend.src.Application.Services
{
    public class ArtistService
    {
        private readonly IArtistRepository _repo;
        private readonly IUserFollowArtistRepository _followRepo;
        private readonly AppOptions _app;
        private readonly IMinioStorage _fileStorage;

        public ArtistService(IArtistRepository repo, IUserFollowArtistRepository followRepo, IOptions<AppOptions> app, IMinioStorage fileStorage)
        {
            _repo = repo;
            _followRepo = followRepo;
            _app = app.Value;
            _fileStorage = fileStorage;
        }

        // One artist profile per account
        public async Task<Artist> CreateAsync(CreateArtistRequest request, Guid userId)
        {
            if (request.Name == null) throw new InvalidArtistDataException("Name can not be empty");
            if (userId == Guid.Empty) throw new InvalidArtistDataException("ID can not be empty");

            Artist? existingArtist = await _repo.GetByIdAsync(userId);
            if (existingArtist != null) throw new ArtistAlreadyExistsException("You already created a profile with this account");

            existingArtist = await _repo.GetByNameAsync(request.Name);
            if (existingArtist != null) throw new InvalidArtistDataException("User with this username already exists");

            Artist artist = new Artist()
            {
                Id = userId,
                Name = request.Name,
                IsVerified = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var savedArtist = await _repo.AddAsync(artist);

            return savedArtist;
        }

        public async Task<Artist> UpdateAsync(UpdateArtistRequest request, Guid id)
        {
            Artist? existingArtist = await _repo.GetByIdAsync(id);
            if (existingArtist == null) throw new ArtistNotFoundException("You haven't create the artist profile yet");

            if (request.Name != null) existingArtist.Name = request.Name;

            Artist? updateArtist = await _repo.UpdateAsync(existingArtist);
            if (updateArtist == null) throw new DatabaseOperationException("Failed to update artist profile");

            return updateArtist;
        }
        public async Task<List<ArtistResponse>> GetPaginatedAsync(int page, int pageSize)
        {
            return await _repo.GetPaginatedAsync(page, pageSize);
        }

        public async Task<bool> FollowArtistAsync(Guid artistId, Guid userId)
        {
            var existing = await _followRepo.GetAsync(userId, artistId);
            if (existing != null) return true;

            try {
                await _followRepo.AddAsync(new UserFollowArtist { UserId = userId, ArtistId = artistId, CreatedAt = DateTimeOffset.UtcNow });
                return true;
            } catch {
                return false;
            }
        }

        public async Task<bool> UnfollowArtistAsync(Guid artistId, Guid userId)
        {
            return await _followRepo.DeleteAsync(userId, artistId);
        }

        public async Task<bool> CheckFollowStatusAsync(Guid artistId, Guid userId)
        {
            var existing = await _followRepo.GetAsync(userId, artistId);
            return existing != null;
        }
    }
}
