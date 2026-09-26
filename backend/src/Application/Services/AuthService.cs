using Microsoft.EntityFrameworkCore;
using Backend.src.Api.DTOs.Auth;
using Backend.src.Application.Interfaces;
using Backend.src.Domain.Entities;
using Backend.src.Domain.Exceptions.User;
using Backend.src.Domain.Exceptions.System;
using Backend.src.Infrastructure.Utils;
using Backend.src.Infrastructure.Database;
using Microsoft.Extensions.Options;
using Backend.src.Infrastructure.Storage;

namespace Backend.src.Application.Services
{
    public class AuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IProfileRepository _profileRepo;
        private readonly IRefreshTokenRepository _rtRepo;
        private readonly AppDbContext _context;
        private readonly AuthTokenUtil _authTokenUtil;
        private readonly EmailUtil _emailUtil;
        private readonly AppOptions _app;
        private readonly GoogleAuthService _googleAuth;
        private readonly IMinioStorage _fileStorage;
        private readonly IUserFollowArtistRepository _followRepo;

        public AuthService(
            IUserRepository userRepo,
            IProfileRepository profileRepo,
            IRefreshTokenRepository rtRepo,
            AppDbContext context,
            AuthTokenUtil authTokenUtil,
            EmailUtil emailUtil,
            IOptions<AppOptions> app,
            GoogleAuthService googleAuth,
            IMinioStorage fileStorage,
            IUserFollowArtistRepository followRepo
        )
        {
            _userRepo = userRepo;
            _profileRepo = profileRepo;
            _rtRepo = rtRepo;
            _context = context;
            _authTokenUtil = authTokenUtil;
            _emailUtil = emailUtil;
            _app = app.Value;
            _googleAuth = googleAuth;
            _fileStorage = fileStorage;
            _followRepo = followRepo;
        }

        public async Task<User> SignUpAsync(SignUpRequest request)
        {
            if (request.Username == null) throw new InvalidUserDataException("Tên đăng nhập không được để trống");
            if (request.Email == null) throw new InvalidUserDataException("Email không được để trống");
            if (request.Password == null) throw new InvalidUserDataException("Mật khẩu không được để trống");
            if (!_emailUtil.IsValidEmail(request.Email))
                throw new InvalidUserDataException("Định dạng email không hợp lệ");

            var existingUserByUsername = await _userRepo.GetByUsernameAsync(request.Username);
            if (existingUserByUsername != null)
                throw new UserAlreadyExistsException("Tên đăng nhập đã tồn tại");

            var existingUserByEmail = await _userRepo.GetByEmailAsync(request.Email);
            if (existingUserByEmail != null)
                throw new UserAlreadyExistsException("Email đã được sử dụng");

            string token = TokenUtil.GenerateToken();
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            using var tx = await _context.Database.BeginTransactionAsync();

            User? savedUser = null;
            Profile? savedProfile = null;

            try
            {
                User user = new()
                {
                    Id = Guid.NewGuid(),
                    Username = request.Username,
                    Email = request.Email,
                    Password = passwordHash,
                    Token = token,
                    Role = UserRole.listener,
                    Provider = Provider.local,
                    IsVerified = false,
                    IsPremium = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                savedUser = await _userRepo.AddAsync(user);

                Profile profile = new()
                {
                    UserId = user.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                savedProfile = await _profileRepo.AddAsync(profile);
                await tx.CommitAsync();
            }
            catch (Exception e)
            {
                await tx.RollbackAsync();
                throw new DatabaseOperationException("Failed to insert new user and profile: " + e);
            }

            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Run(() => _emailUtil.SendVerificationEmail(savedUser.Email, $"{_app.BaseUrl}/auth/verify-email?token={token}"));
                    Console.WriteLine("[DEBUG] Email đã được gửi thành công");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("[DEBUG] Gửi email thất bại: " + ex.Message);
                }
            });

            return savedUser;
        }

        public async Task<AuthToken> SignInAsync(SignInRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
                throw new InvalidUserDataException("Tên đăng nhập không được để trống");
            if (string.IsNullOrWhiteSpace(request.Password))
                throw new InvalidUserDataException("Mật khẩu không được để trống");

            var user = await _userRepo.GetByUsernameAsync(request.Username)
                       ?? throw new UserNotFoundException("Tên đăng nhập không tồn tại");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                throw new InvalidCredentialsException("Mật khẩu không chính xác");

            string refreshToken = _authTokenUtil.GenerateRefreshToken(user.Id);
            string accessToken = _authTokenUtil.GenerateAccessToken(user.Id, user.Role);

            RefreshToken token = new RefreshToken()
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Token = refreshToken,
                ExpiredAt = _authTokenUtil.GetExpireDate(refreshToken),
                RevokedAt = null,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _rtRepo.AddAsync(token);
            await _rtRepo.RevokeOldTokenByUserIdAsync(user.Id);

            return new AuthToken(accessToken);
        }

        public async Task<AuthToken> GoogleSignInAsync(GoogleLoginDto request)
        {
            var payload = await _googleAuth.VerifyAsync(request.IdToken);

            using var tx = await _context.Database.BeginTransactionAsync();

            User? savedUser = null;
            Profile? savedProfile = null;

            try
            {
                var user = await _userRepo.GetByEmailAsync(payload.Email);

                if (user == null)
                {
                    user = new User
                    {
                        Id = Guid.NewGuid(),
                        Email = payload.Email,
                        Username = payload.Email,
                        Role = UserRole.listener,
                        Provider = Provider.google,
                        IsVerified = true,
                        IsPremium = false,
                        CreatedAt = DateTimeOffset.UtcNow,
                        UpdatedAt = DateTimeOffset.UtcNow
                    };

                    await _userRepo.AddAsync(user);

                    Profile profile = new()
                    {
                        UserId = user.Id,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    savedUser = await _userRepo.AddAsync(user);
                    savedProfile = await _profileRepo.AddAsync(profile);

                    await tx.CommitAsync();
                }
            }
            catch (Exception e)
            {
                await tx.RollbackAsync();
                throw new DatabaseOperationException("Failed to insert new user and profile: " + e);
            }

            string refreshToken = _authTokenUtil.GenerateRefreshToken(savedUser.Id);
            string accessToken = _authTokenUtil.GenerateAccessToken(savedUser.Id, savedUser.Role);

            RefreshToken token = new RefreshToken()
            {
                Id = Guid.NewGuid(),
                UserId = savedUser.Id,
                Token = refreshToken,
                ExpiredAt = _authTokenUtil.GetExpireDate(refreshToken),
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            await _rtRepo.AddAsync(token);

            return new AuthToken(accessToken);
        }

        public async Task<RefreshResponse> RefreshAsync(Guid userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            var refreshToken = await _rtRepo.GetValidTokenById(userId);
            if (refreshToken == null) return null;
            if (_authTokenUtil.IsTokenExpired(refreshToken.Token)) return null;
            if (user == null) return null;

            return new RefreshResponse(_authTokenUtil.GenerateAccessToken(userId, user.Role));
        }

        public async Task<string> VerifyEmailAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return _emailUtil.GetFailedHtml();

            var user = await _userRepo.GetByTokenAsync(token);
            if (user == null) return _emailUtil.GetFailedHtml();

            user.IsVerified = true;
            user.Token = null;

            var updated = await _userRepo.UpdateAsync(user);

            return updated != null ? _emailUtil.GetSuccessHtml() : _emailUtil.GetFailedHtml();
        }

        public async Task SendVerificationEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new InvalidUserDataException("Email is empty");

            var user = await _userRepo.GetByEmailAsync(email);
            if (user == null) throw new UserNotFoundException("Found no user with email: " + email);

            string token = TokenUtil.GenerateToken();
            user.Token = token;

            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Run(() => _emailUtil.SendVerificationEmail(user.Email, $"{_app.BaseUrl}/auth/verify-email?token={token}"));
                    Console.WriteLine("[DEBUG] Email đã được gửi thành công");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("[DEBUG] Gửi email thất bại: " + ex.Message);
                }
            });

            await _userRepo.UpdateAsync(user);
        }

        public async Task<User?> GetUserAsync(Guid id)
        {
            if (id == Guid.Empty) throw new InvalidUserDataException("ID không hợp lệ");
            return await _userRepo.GetByIdAsync(id);
        }

        public async Task<ProfileDTO?> GetProfileAsync(Guid id)
        {
            if (id == Guid.Empty) throw new InvalidUserDataException("ID không hợp lệ");
            User? userInfo = await _userRepo.GetByIdAsync(id);
            if (userInfo == null) throw new UserNotFoundException("User does not exists");
            Profile? profileInfo = await _profileRepo.GetByUserIdAsync(id);

            int followers = await _followRepo.GetFollowersCountAsync(id);
            int following = await _followRepo.GetFollowingCountAsync(id);
            int playlists = await _context.Playlists.CountAsync(p => p.OwnerId == id);

            ProfileDTO res = new ProfileDTO(
                id,
                userInfo.Username,
                profileInfo?.Name,
                userInfo.Email,
                profileInfo?.AvatarUrl,
                userInfo.IsVerified,
                userInfo.IsPremium,
                userInfo.Role.ToString(),
                followers,
                following,
                playlists
            );

            return res;
        }

        public async Task<ProfileDTO?> GetProfileByUsernameAsync(string username)
        {
            if (string.IsNullOrWhiteSpace(username)) throw new InvalidUserDataException("Username không hợp lệ");
            User? userInfo = await _userRepo.GetByUsernameAsync(username);
            if (userInfo == null) throw new UserNotFoundException("User does not exists");
            Profile? profileInfo = await _profileRepo.GetByUserIdAsync(userInfo.Id);

            int followers = await _followRepo.GetFollowersCountAsync(userInfo.Id);
            int following = await _followRepo.GetFollowingCountAsync(userInfo.Id);
            int playlists = await _context.Playlists.CountAsync(p => p.OwnerId == userInfo.Id);

            ProfileDTO res = new ProfileDTO(
                userInfo.Id,
                userInfo.Username,
                profileInfo?.Name,
                userInfo.Email,
                profileInfo?.AvatarUrl,
                userInfo.IsVerified,
                userInfo.IsPremium,
                userInfo.Role.ToString(),
                followers,
                following,
                playlists
            );

            return res;
        }

        public async Task UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
        {
            if (userId == Guid.Empty) throw new InvalidUserDataException("ID không hợp lệ");
            Profile? profileInfo = await _profileRepo.GetByUserIdAsync(userId);
            if (profileInfo == null) throw new UserNotFoundException("User does not exists");

            if (request.Name != null) profileInfo.Name = request.Name;

            if (request.Avatar != null)
            {
                string avatarUrl = await _fileStorage.UploadAvatarAsync(request.Avatar, userId);
                profileInfo.AvatarUrl = avatarUrl;
            }

            await _profileRepo.UpdateAsync(profileInfo);
        }
        public async Task SignOutAsync(Guid userId)
        {
            if (userId == Guid.Empty) throw new InvalidUserDataException("ID không hợp lệ");
            await _rtRepo.RevokeAllTokensByUserIdAsync(userId);
        }
    }
}
