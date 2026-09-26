namespace Backend.src.Domain.Exceptions.Playlist
{
    public class PlaylistAlreadyExistsException : Exception
    {
        public PlaylistAlreadyExistsException(string message) : base(message) { }
    }
}


