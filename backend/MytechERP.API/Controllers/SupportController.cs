using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MytechERP.Application.DTOs;
using MytechERP.Application.Interfaces;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MytechERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupportController : ControllerBase
    {
        private readonly IEmailService _emailService;

        public SupportController(IEmailService emailService)
        {
            _emailService = emailService;
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitSupportRequest([FromBody] SupportRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new { error = "Name and description are required." });
            }

            var userEmail = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ?? "Unknown";
            var tenantId = User.Claims.FirstOrDefault(c => c.Type == "TenantId")?.Value ?? "Unknown";

            string subject = $"Support Request: {request.SupportType} from {request.Name}";
            string body = $@"
                <h2>New Support Request</h2>
                <p><strong>Name:</strong> {request.Name}</p>
                <p><strong>User Email:</strong> {userEmail}</p>
                <p><strong>Tenant ID:</strong> {tenantId}</p>
                <p><strong>Support Type:</strong> {request.SupportType}</p>
                <p><strong>Description:</strong></p>
                <p>{request.Description.Replace("\n", "<br>")}</p>
            ";

            await _emailService.SendEmailAsync("fieldzenpro@gmail.com", subject, body, true);

            return Ok(new { message = "Support request sent successfully." });
        }
    }
}
