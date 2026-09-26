using System.Net;
using System.Text.Json;
using Backend.src.Domain.Exceptions.System;
using Backend.src.Domain.Exceptions.User;
using Backend.src.Domain.Exceptions.Artist;
using Backend.src.Domain.Exceptions.Track;
using Backend.src.Domain.Exceptions.Playlist;

namespace Backend.src.Infrastructure.Middlewares
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");

                var response = context.Response;
                response.ContentType = "application/json";
                var statusCode = HttpStatusCode.InternalServerError;
                string message = "Something went wrong";

                switch (ex)
                {
                    case UserNotFoundException:
                        statusCode = HttpStatusCode.NotFound;
                        message = ex.Message;
                        break;

                    case InvalidCredentialsException:
                        statusCode = HttpStatusCode.Unauthorized;
                        message = ex.Message;
                        break;

                    case UserAlreadyExistsException:
                        statusCode = HttpStatusCode.Conflict;
                        message = ex.Message;
                        break;

                    case MismatchedAuthProviderException:
                        statusCode = HttpStatusCode.Unauthorized;
                        message = ex.Message;
                        break;

                    case InvalidUserDataException:
                        statusCode = HttpStatusCode.BadRequest;
                        message = ex.Message;
                        break;

                    case DatabaseOperationException:
                        statusCode = HttpStatusCode.InternalServerError;
                        message = "Database operation failed";
                        break;

                    case ArtistAlreadyExistsException:
                        statusCode = HttpStatusCode.Conflict;
                        message = ex.Message;
                        break;

                    case InvalidArtistDataException:
                        statusCode = HttpStatusCode.BadRequest;
                        message = ex.Message;
                        break;

                    case ArtistNotFoundException:
                        statusCode = HttpStatusCode.NotFound;
                        message = ex.Message;
                        break;

                    case TrackAlreadyExistsException:
                        statusCode = HttpStatusCode.Conflict;
                        message = ex.Message;
                        break;

                    case InvalidTrackDataException:
                        statusCode = HttpStatusCode.BadRequest;
                        message = ex.Message;
                        break;

                    case InvalidPlaylistDataException:
                        statusCode = HttpStatusCode.BadRequest;
                        message = ex.Message;
                        break;

                    case PlaylistNotFoundException:
                        statusCode = HttpStatusCode.NotFound;
                        message = ex.Message;
                        break;

                    case PlaylistAlreadyExistsException:
                        statusCode = HttpStatusCode.Conflict;
                        message = ex.Message;
                        break;
                }

                response.StatusCode = (int)statusCode;
                var result = JsonSerializer.Serialize(new { error = message });
                await response.WriteAsync(result);
            }
        }
    }
}
