namespace Backend.src.Domain.Exceptions.Track
{
    public class TrackAlreadyExistsException : Exception
    {
        public TrackAlreadyExistsException(string message) : base(message) { }
    }
}


