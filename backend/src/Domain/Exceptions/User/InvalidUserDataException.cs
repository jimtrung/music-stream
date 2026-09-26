namespace Backend.src.Domain.Exceptions.User
{
    public class InvalidUserDataException : Exception
    {
        public InvalidUserDataException(string message) : base(message) { }
    }
}
