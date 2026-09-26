namespace Backend.src.Domain.Exceptions.Track
{
    public class TrackNotFoundException : Exception
    {
        public TrackNotFoundException(string message) : base(message) { }
    }
}
