using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.src.Domain.Entities;
using Backend.src.Infrastructure.Database;
using Backend.src.Api.DTOs.Message;

namespace Backend.src.Application.Services
{
    public class MessageService
    {
        private readonly AppDbContext _context;

        public MessageService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<MessageResponse> SendMessageAsync(Guid senderId, Guid receiverId, string content)
        {
            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsRead = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return new MessageResponse(
                message.Id,
                message.SenderId,
                message.ReceiverId,
                message.Content,
                message.SentAt,
                message.IsRead
            );
        }

        public async Task<List<MessageResponse>> GetChatHistoryAsync(Guid currentUserId, Guid otherUserId)
        {
            var messages = await _context.Messages
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == otherUserId) || 
                            (m.SenderId == otherUserId && m.ReceiverId == currentUserId))
                .OrderBy(m => m.SentAt)
                .Select(m => new MessageResponse(m.Id, m.SenderId, m.ReceiverId, m.Content, m.SentAt, m.IsRead))
                .ToListAsync();

            return messages;
        }

        public async Task<List<ConversationResponse>> GetConversationsAsync(Guid userId)
        {
            var messages = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();

            var otherUserIds = messages
                .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Distinct()
                .ToList();

            var profiles = await _context.Profiles
                .Where(p => otherUserIds.Contains(p.UserId))
                .ToDictionaryAsync(p => p.UserId);

            var conversations = new Dictionary<Guid, ConversationResponse>();

            foreach (var m in messages)
            {
                var otherUserId = m.SenderId == userId ? m.ReceiverId : m.SenderId;
                profiles.TryGetValue(otherUserId, out var otherProfile);

                if (!conversations.ContainsKey(otherUserId))
                {
                    int unreadCount = messages.Count(x => x.SenderId == otherUserId && x.ReceiverId == userId && !x.IsRead);
                    
                    conversations[otherUserId] = new ConversationResponse(
                        otherUserId,
                        otherProfile?.Name ?? "Unknown",
                        otherProfile?.AvatarUrl,
                        m.Content,
                        m.SentAt,
                        unreadCount
                    );
                }
            }

            return conversations.Values.OrderByDescending(c => c.LastMessageTime).ToList();
        }

        public async Task MarkAsReadAsync(Guid currentUserId, Guid otherUserId)
        {
            var unreadMessages = await _context.Messages
                .Where(m => m.SenderId == otherUserId && m.ReceiverId == currentUserId && !m.IsRead)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                foreach (var m in unreadMessages)
                {
                    m.IsRead = true;
                }
                await _context.SaveChangesAsync();
            }
        }
    }
}
