using System;
using System.Collections.Generic;

namespace MytechERP.Application.DTOs.Finance
{
    public class CreateInvoiceDto
    {
        public int CustomerId { get; set; }
        public int? QuotationId { get; set; }
        public int? WorkOrderId { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int Status { get; set; }
        public string? TechnicianNotes { get; set; }

        public List<CreateInvoiceItemDto> Items { get; set; } = new List<CreateInvoiceItemDto>();
    }

    public class CreateInvoiceItemDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public bool IsTaxable { get; set; }
        public MytechERP.domain.Enums.ItemCategory ItemCategory { get; set; }
    }
}
