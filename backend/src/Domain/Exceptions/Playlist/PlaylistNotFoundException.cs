namespace Backend.src.Domain.Exceptions.Playlist
{
    public class PlaylistNotFoundException : Exception
    {
        public PlaylistNotFoundException(string message) : base(message) { }
    }
}



