using System;

namespace MytechERP.Application.DTOs.CRM
{
    public class UpdateUserRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}