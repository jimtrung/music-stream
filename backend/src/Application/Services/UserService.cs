using Backend.src.Api.DTOs.Auth;
using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Domain.Exceptions.User;
using Backend.src.Infrastructure.Database;
using Backend.src.Infrastructure.Storage;

namespace Backend.src.Application.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepo;
        private readonly IProfileRepository _profileRepo;
        private readonly AppDbContext _context;
        private readonly IMinioStorage _fileStorage;

        public UserService(
            IUserRepository userRepo,
            IProfileRepository profileRepo,
            AppDbContext context,
            IMinioStorage fileStorage
        )
        {
            _userRepo = userRepo;
            _profileRepo = profileRepo;
            _context = context;
            _fileStorage = fileStorage;
        }

    }
}
