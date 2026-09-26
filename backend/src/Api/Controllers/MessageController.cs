using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Api.DTOs.Message;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("messages")]
    [Authorize]
    public class MessageController : Controller
    {
        private readonly MessageService _messageService;

        public MessageController(MessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpGet("conversations")]
        public async Task<ActionResult<List<ConversationResponse>>> GetConversations()
        {
            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
                return Unauthorized();

            var conversations = await _messageService.GetConversationsAsync(userId);
            return Ok(conversations);
        }

        [HttpGet("{otherUserId}")]
        public async Task<ActionResult<List<MessageResponse>>> GetChatHistory(Guid otherUserId)
        {
            string? userIdString = HttpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
                return Unauthorized();

            var messages = await _messageService.GetChatHistoryAsync(userId, otherUserId);
            return Ok(messages);
        }
    }
}
