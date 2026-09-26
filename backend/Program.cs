using System.Text.Json;
using Minio;
using Microsoft.EntityFrameworkCore;
using Backend.src.Infrastructure.Database;
using Backend.src.Infrastructure.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend.src.Infrastructure.Utils;
using Backend.src.Infrastructure.Storage;
using System.IdentityModel.Tokens.Jwt;
using Backend.src.Domain.Entities;
using Backend.src.Application.Interfaces;
using Backend.src.Infrastructure.Repositories;
using Backend.src.Application.Services;
using Backend.src.Api.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Get connection string from appsetting.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Setting for connection pool
var connectionStringBuilder = new Npgsql.NpgsqlConnectionStringBuilder(connectionString)
{
    MinPoolSize = 2,
    MaxPoolSize = 20,
    ConnectionIdleLifetime = 300,
    ConnectionPruningInterval = 10
};

// Mapping database enums
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(
        connectionStringBuilder.ConnectionString,
        npgsqlOptions =>
        {
            npgsqlOptions.MapEnum<Provider>("provider_type");
            npgsqlOptions.MapEnum<UserRole>("role_type");
            npgsqlOptions.MapEnum<SubscriptionStatus>("subscription_status");
        });
});

// Add JWT Auth options
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"])),

        NameClaimType = JwtRegisteredClaimNames.Sub
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// Using snake_case for JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Add configuration to use "App" values in appsetting.json
builder.Services.Configure<AppOptions>(builder.Configuration.GetSection("App"));

// MiniO Setup
builder.Services.AddSingleton<IMinioClient>(_ =>
    new MinioClient()
        .WithEndpoint("127.0.0.1:9000")
        .WithCredentials("minioadmin", "minioadmin")
        .WithSSL(false)
        .Build()
);

// AuthTokenUtil
builder.Services.AddScoped<AuthTokenUtil>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    return new AuthTokenUtil(config);
});

// Services
builder.Services.AddScoped<EmailUtil>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ArtistService>();
builder.Services.AddScoped<TrackService>();
builder.Services.AddScoped<PlaylistService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<GoogleAuthService>();
builder.Services.AddScoped<SearchService>();
builder.Services.AddScoped<LibraryService>();
builder.Services.AddScoped<IMinioStorage, MinioStorage>();
builder.Services.AddScoped<MessageService>();

builder.Services.AddSignalR();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IArtistRepository, ArtistRepository>();
builder.Services.AddScoped<ITrackRepository, TrackRepository>();
builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<IPlaylistRepository, PlaylistRepository>();
builder.Services.AddScoped<IPlaylistTrackRepository, PlaylistTrackRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IUserFollowArtistRepository, UserFollowArtistRepository>();
builder.Services.AddScoped<ITrackStatRepository, TrackStatRepository>();
builder.Services.AddScoped<IUserLikeTrackRepository, UserLikeTrackRepository>();

// Auth
builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins("http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
    );
});

var app = builder.Build();


// Preinitialize pool connection so it does not waste 2s for nothing
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        // Gọi một lệnh bất kì
        await dbContext.Users.AnyAsync();
        Console.WriteLine("Database connection pool đã được khởi tạo");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Không thể khởi tạo connection pool: {ex.Message}");
    }
}

// Add middleware handling exceptions
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/chathub");

app.Run();

// Partial class để WebApplicationFactory<Program> có thể truy cập từ test project
public partial class Program { }
