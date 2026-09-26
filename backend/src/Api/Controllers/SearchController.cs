using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.src.Application.Services;
using Backend.src.Api.DTOs.Search;

namespace Backend.src.Api.Controllers
{
    [ApiController]
    [Route("search")]
    [Authorize]
    public class SearchController : Controller
    {
        private readonly SearchService _searchService;

        public SearchController(SearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet]
        public async Task<ActionResult<SearchResultsDTO>> Search([FromQuery] string? query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                {
                    var allResults = await _searchService.GetAllSearchableAsync();
                    return Ok(allResults);
                }

                var results = await _searchService.SearchAsync(query);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }
    }
}
