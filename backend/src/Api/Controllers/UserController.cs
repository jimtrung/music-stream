using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Domain.Entities;
using Backend.src.Api.DTOs.Auth;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("user")]
    [Authorize]
    public class UserController : Controller
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

    }
}
