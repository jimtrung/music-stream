namespace Backend.src.Domain.Exceptions.Track
{
    public class InvalidTrackDataException : Exception
    {
        public InvalidTrackDataException(string message) : base(message) { }
    }
}

