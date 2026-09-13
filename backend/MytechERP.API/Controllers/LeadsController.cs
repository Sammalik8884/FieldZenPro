using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using MytechERP.Application.DTOs.Leads;
using MytechERP.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace MytechERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeadsController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _cache;

        public LeadsController(IEmailService emailService, IMemoryCache cache)
        {
            _emailService = emailService;
            _cache = cache;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] CustomBuildRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Generate 6 digit OTP
            var otp = new Random().Next(100000, 999999).ToString();

            // Cache OTP for 10 minutes
            _cache.Set($"OTP_{request.Email.ToLower()}", otp, TimeSpan.FromMinutes(10));

            // Send OTP to the user's email to verify they are real
            var subject = "Verify your FieldZenPro Request";
            var body = $@"
                <div style='font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                    <h2 style='color: #2563eb;'>FieldZenPro Custom Build</h2>
                    <p>Hi {request.ContactPerson},</p>
                    <p>Please use the verification code below to confirm your request for a customized ERP system.</p>
                    <div style='font-size: 24px; font-weight: bold; padding: 15px; background: #f3f4f6; text-align: center; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;'>
                        {otp}
                    </div>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            ";

            await _emailService.SendEmailAsync(request.Email, subject, body, true);

            return Ok(new { message = "OTP sent to email." });
        }

        [HttpPost("verify-and-submit")]
        public async Task<IActionResult> VerifyAndSubmit([FromBody] VerifyCustomBuildDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var cacheKey = $"OTP_{request.Email.ToLower()}";
            if (!_cache.TryGetValue(cacheKey, out string? expectedOtp) || expectedOtp != request.OtpCode)
            {
                return BadRequest(new { error = "Invalid or expired verification code." });
            }

            // OTP matches! Clear it from cache so it can't be reused
            _cache.Remove(cacheKey);

            var data = request.RequestData;

            // Now send the lead to Mark
            var markSubject = $"🔥 NEW CUSTOM ERP LEAD: {data.CompanyName}";
            var markBody = $@"
                <h2 style='color: #10b981;'>New Verified Lead Request</h2>
                <table style='width: 100%; border-collapse: collapse; font-family: Arial;'>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Company:</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>{data.CompanyName}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Contact Person:</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>{data.ContactPerson}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Email (Verified):</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>{data.Email}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Phone:</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>{data.PhoneNumber}</td></tr>
                    <tr><td style='padding: 8px; border-bottom: 1px solid #ddd;'><strong>Users:</strong></td><td style='padding: 8px; border-bottom: 1px solid #ddd;'>{data.NumberOfUsers}</td></tr>
                </table>
                <h3>Requirements / Details:</h3>
                <div style='padding: 15px; background: #f9f9f9; border-left: 4px solid #2563eb;'>
                    {data.Details.Replace(Environment.NewLine, "<br/>")}
                </div>
            ";

            await _emailService.SendEmailAsync("fieldzenpro@gmail.com", markSubject, markBody, true);

            // Also send a nice confirmation email to the user
            var userSubject = "Request Received - FieldZenPro";
            var userBody = $@"
                <div style='font-family: Arial, sans-serif;'>
                    <h2 style='color: #2563eb;'>Thank you, {data.ContactPerson}!</h2>
                    <p>Your request has been successfully verified and sent directly to our engineering team.</p>
                    <p>We are reviewing your requirements for <strong>{data.CompanyName}</strong> and will reach out to you at <strong>{data.PhoneNumber}</strong> or via email as quickly as possible to discuss your customized ERP solution.</p>
                    <p>Remember: You don't pay anything upfront, and you only pay when you are completely satisfied with the product!</p>
                    <br/>
                    <p>Best regards,<br/>The FieldZenPro Team</p>
                </div>
            ";
            await _emailService.SendEmailAsync(data.Email, userSubject, userBody, true);

            return Ok(new { message = "Lead successfully submitted." });
        }
    }
}
