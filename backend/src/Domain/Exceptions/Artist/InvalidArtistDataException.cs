namespace Backend.src.Domain.Exceptions.Artist
{
    public class InvalidArtistDataException : Exception
    {
        public InvalidArtistDataException(string message) : base(message) { }
    }
}
