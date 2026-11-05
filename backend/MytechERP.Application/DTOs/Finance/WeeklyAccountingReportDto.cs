using System;
using System.Collections.Generic;

namespace MytechERP.Application.DTOs.Finance
{
    /// <summary>
    /// Returned by GET /api/invoice/weekly-report
    /// Gives Mark the two dollar totals he needs for his books every week.
    /// </summary>
    public class WeeklyAccountingReportDto
    {
        public DateTime DateFrom { get; set; }
        public DateTime DateTo   { get; set; }

        /// <summary>Total dollar value of all Material line items on paid invoices this week.</summary>
        public decimal MaterialsSalesTotal       { get; set; }

        /// <summary>Total dollar value of all Labor/Service line items on paid invoices this week.</summary>
        public decimal LaborServicesSalesTotal   { get; set; }

        /// <summary>Grand total of both categories combined.</summary>
        public decimal GrandTotal => MaterialsSalesTotal + LaborServicesSalesTotal;

        /// <summary>How many distinct paid invoices contributed to these totals.</summary>
        public int PaidInvoiceCount { get; set; }

        /// <summary>Line-by-line breakdown — materials only.</summary>
        public List<ReportLineItemDto> MaterialsBreakdown      { get; set; } = new();

        /// <summary>Line-by-line breakdown — labor & services only.</summary>
        public List<ReportLineItemDto> LaborServicesBreakdown  { get; set; } = new();
    }

    /// <summary>One row in the report breakdown.</summary>
    public class ReportLineItemDto
    {
        public string InvoiceNumber  { get; set; } = string.Empty;
        public string CustomerName   { get; set; } = string.Empty;
        public string Description    { get; set; } = string.Empty;
        public decimal Quantity      { get; set; }
        public decimal UnitPrice     { get; set; }
        public decimal LineTotal     { get; set; }
        public DateTime InvoiceDate  { get; set; }
    }
}
