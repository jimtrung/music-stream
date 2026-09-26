namespace Backend.src.Domain.Exceptions.User
{
    public class MismatchedAuthProviderException : Exception
    {
        public MismatchedAuthProviderException(string message) : base(message) { }
    }
}
