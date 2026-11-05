namespace MytechERP.Application.DTOs.CRM
{
    public class AddJobItemDto
    {
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; } = 0;
        public bool IsTaxable { get; set; }
    }

    public class WorkOrderItemDto
    {
        public int Id { get; set; }
        public int WorkOrderId { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public bool IsTaxable { get; set; }
        public decimal Total { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
