using System.ComponentModel.DataAnnotations;

namespace MytechERP.Application.DTOs.Leads
{
    public class CustomBuildRequestDto
    {
        [Required, MaxLength(150)]
        public string CompanyName { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string ContactPerson { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string NumberOfUsers { get; set; } = string.Empty;

        [Required]
        public string Details { get; set; } = string.Empty;
    }

    public class VerifyCustomBuildDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string OtpCode { get; set; } = string.Empty;

        [Required]
        public CustomBuildRequestDto RequestData { get; set; } = new();
    }
}
