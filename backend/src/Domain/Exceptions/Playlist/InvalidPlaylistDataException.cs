namespace Backend.src.Domain.Exceptions.Playlist
{
    public class InvalidPlaylistDataException : Exception
    {
        public InvalidPlaylistDataException(string message) : base(message) { }
    }
}

