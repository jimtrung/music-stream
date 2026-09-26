using System;

namespace Backend.src.Api.DTOs.Message
{
    public record SendMessageRequest(Guid ReceiverId, string Content);
    
    public record MessageResponse(
        Guid Id, 
        Guid SenderId, 
        Guid ReceiverId, 
        string Content, 
        DateTime SentAt, 
        bool IsRead
    );
    
    public record ConversationResponse(
        Guid UserId,
        string Name,
        string? AvatarUrl,
        string LastMessage,
        DateTime LastMessageTime,
        int UnreadCount
    );
}
