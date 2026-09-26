namespace Backend.src.Domain.Exceptions.Artist
{
    public class ArtistNotFoundException : Exception
    {
        public ArtistNotFoundException(string message) : base(message) { }
    }
}

