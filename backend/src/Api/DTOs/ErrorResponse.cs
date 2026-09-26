namespace Backend.src.Api.DTOs
{
    public record ErrorResponse(DateTime Timestamp, int Status, string Error, string Message, string Path);
}
