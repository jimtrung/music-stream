using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Backend.src.Application.Services;

namespace Backend.src.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly MessageService _messageService;

        public ChatHub(MessageService messageService)
        {
            _messageService = messageService;
        }

        public async Task SendMessage(Guid receiverId, string content)
        {
            string? userIdString = Context.UserIdentifier ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid senderId))
                return;

            var message = await _messageService.SendMessageAsync(senderId, receiverId, content);

            // Send to receiver
            await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", message);
            
            // Also send back to sender so they can update their UI if they are logged in on multiple devices
            await Clients.User(senderId.ToString()).SendAsync("ReceiveMessage", message);
        }

        public async Task MarkAsRead(Guid otherUserId)
        {
            string? userIdString = Context.UserIdentifier ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid currentUserId))
                return;

            await _messageService.MarkAsReadAsync(currentUserId, otherUserId);

            // Notify the other user that their messages were read
            await Clients.User(otherUserId.ToString()).SendAsync("MessagesRead", currentUserId);
            // Notify other devices of the current user to update read status
            await Clients.User(currentUserId.ToString()).SendAsync("MessagesRead", currentUserId);
        }
    }
}
