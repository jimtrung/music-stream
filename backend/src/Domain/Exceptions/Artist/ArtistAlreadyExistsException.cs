namespace Backend.src.Domain.Exceptions.Artist
{
    public class ArtistAlreadyExistsException : Exception
    {
        public ArtistAlreadyExistsException(string message) : base(message) { }
    }
}

