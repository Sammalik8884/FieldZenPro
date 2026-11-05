using MytechERP.domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace MytechERP.domain.Entities.Finance
{
    public class WorkOrderItem : BaseEntity
    {
        public int WorkOrderId { get; set; }

        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        public bool IsTaxable { get; set; }

        public int TenantId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
