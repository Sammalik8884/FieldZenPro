using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyTechERP.Infrastructure.Persistence;

namespace MytechERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebugController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DebugController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("migrate")]
        public async Task<IActionResult> Migrate()
        {
            try
            {
                var pending = await _context.Database.GetPendingMigrationsAsync();
                await _context.Database.MigrateAsync();
                return Ok(new { Message = "Migration successful", PendingMigrations = pending });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message, Inner = ex.InnerException?.Message, StackTrace = ex.StackTrace });
            }
        }
    }
}
