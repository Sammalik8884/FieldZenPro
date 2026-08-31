using Microsoft.EntityFrameworkCore;
using MytechERP.Application.Interfaces;
using MytechERP.domain.Entities.Finance;
using MytechERP.domain.Enums;
using MytechERP.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MytechERP.Application.DTOs.Finance;

namespace MyTechERP.Infrastructure.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ITimeTrackingService _timeService; 
        private readonly IEmailService _emailService;
        private readonly IPdfService _pdfService;

        public InvoiceService(ApplicationDbContext context, ITimeTrackingService timeTrackingService, IEmailService emailService, IPdfService pdfService)
        {
            _timeService = timeTrackingService;
            _context = context;
            _emailService = emailService;
            _pdfService = pdfService;
        }

        public async Task<Invoice> CreateFromQuotationAsync(int quotationId)
        {
            var quote = await _context.Quotations
                .Include(q => q.Items)
                .Include(q => q.Customer)
                .FirstOrDefaultAsync(q => q.Id == quotationId);

            if (quote == null) throw new KeyNotFoundException("Quotation not found");

            if (quote.Status != QuotationStatus.Approved && quote.Status != QuotationStatus.SentToCustomer && quote.Status != QuotationStatus.Converted)
                throw new InvalidOperationException("Cannot invoice a quotation that is not Approved or SentToCustomer.");

            var invoice = new Invoice
            {
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMM}-{quote.Id}",
                CustomerId = quote.CustomerId,
                QuotationId = quote.Id,
                IssueDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(30),
                SubTotal = quote.SubTotal,
                TaxAmount = quote.GSTAmount + quote.IncomeTaxAmount,
                TotalAmount = quote.GrandTotal,
                Status = InvoiceStatus.Draft,
                TenantId = quote.TenantId 
            };

            
            foreach (var item in quote.Items)
            {
                invoice.Items.Add(new InvoiceItem
                {
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice,

                    TenantId = quote.TenantId
                });
            }

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();
            return invoice;
        }
        public async Task<InvoiceDto> CreateCustomInvoiceAsync(CreateInvoiceDto dto, string tenantId)
        {
            int tId = int.Parse(tenantId);
            var invoice = new Invoice
            {
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}",
                CustomerId = dto.CustomerId,
                QuotationId = dto.QuotationId,
                WorkOrderId = dto.WorkOrderId,
                IssueDate = dto.IssueDate,
                DueDate = dto.DueDate,
                SubTotal = dto.SubTotal,
                TaxAmount = dto.TaxAmount,
                TotalAmount = dto.TotalAmount,
                Status = (InvoiceStatus)dto.Status,
                TenantId = tId
            };

            foreach (var item in dto.Items)
            {
                invoice.Items.Add(new InvoiceItem
                {
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.Quantity * item.UnitPrice,
                    ItemCategory = item.ItemCategory,
                    TenantId = tId
                });
            }

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(invoice.Id, tenantId);
        }

        public async Task<int> GenerateInvoiceFromJobAsync(int workOrderId)
        {
            var job = await _context.WorkOrders.FindAsync(workOrderId);
            if (job == null) throw new Exception("Work Order not found.");

            decimal laborCost = await _timeService.CalculateJobLaborCostAsync(workOrderId, 85.00m);

            var invoice = new Invoice
            {
                CustomerId = job.CustomerId,
                WorkOrderId = workOrderId,
                InvoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}",
                IssueDate = DateTime.UtcNow,
                DueDate = DateTime.UtcNow.AddDays(30),
                Status = InvoiceStatus.Issued, 
                AmountPaid = 0
            };

            decimal runningSubTotal = 0;

            if (laborCost > 0)
            {
                invoice.Items.Add(new InvoiceItem
                {
                    Description = "Technician Labor (Time tracked)",
                    Quantity = 1,
                    UnitPrice = laborCost,
                    TotalPrice = laborCost 
                });

                runningSubTotal += laborCost;
            }

            
            invoice.SubTotal = runningSubTotal;
            invoice.TaxAmount = runningSubTotal * 0.10m;

            invoice.TotalAmount = invoice.SubTotal + invoice.TaxAmount;

            _context.Invoices.Add(invoice);

            job.Status = WorkOrderStatus.Completed;

            await _context.SaveChangesAsync();
            return invoice.Id;
        }

        public async Task<IEnumerable<InvoiceDto>> GetAllAsync(string tenantId)
        {
            int tId = int.Parse(tenantId);
            var invoices = await _context.Invoices
                .Include(i => i.Customer)
                .Where(i => i.TenantId == tId)
                .OrderByDescending(i => i.Id)
                .ToListAsync();

            return invoices.Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                CustomerId = i.CustomerId,
                CustomerName = i.Customer != null ? i.Customer.Name : "Unknown",
                QuotationId = i.QuotationId,
                WorkOrderId = i.WorkOrderId,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                SubTotal = i.SubTotal,
                TaxAmount = i.TaxAmount,
                TotalAmount = i.TotalAmount,
                AmountPaid = i.AmountPaid,
                Status = (int)i.Status,
                StatusString = i.Status.ToString()
            });
        }

        public async Task<InvoiceDto> GetByIdAsync(int id, string tenantId)
        {
            int tId = int.Parse(tenantId);
            var i = await _context.Invoices
                .Include(invoice => invoice.Customer)
                .Include(invoice => invoice.Items)
                .FirstOrDefaultAsync(invoice => invoice.Id == id && invoice.TenantId == tId);

            if (i == null) throw new KeyNotFoundException("Invoice not found");

            return new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                CustomerId = i.CustomerId,
                CustomerName = i.Customer != null ? i.Customer.Name : "Unknown",
                QuotationId = i.QuotationId,
                WorkOrderId = i.WorkOrderId,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                SubTotal = i.SubTotal,
                TaxAmount = i.TaxAmount,
                TotalAmount = i.TotalAmount,
                AmountPaid = i.AmountPaid,
                Status = (int)i.Status,
                StatusString = i.Status.ToString(),
                Items = i.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice > 0 ? item.TotalPrice : (item.Quantity * item.UnitPrice)
                }).ToList()
            };
        }

        public async Task<bool> UpdateStatusAsync(int id, int status, string tenantId)
        {
            int tId = int.Parse(tenantId);
            var invoice = await _context.Invoices.FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tId);
            if (invoice == null) return false;

            invoice.Status = (InvoiceStatus)status;
            if (invoice.Status == InvoiceStatus.Paid) { invoice.AmountPaid = invoice.TotalAmount; }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<InvoiceDto>> GetByCustomerEmailAsync(string email)
        {
            // Find the customer whose email matches the logged-in user
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.Email.ToLower() == email.ToLower());

            if (customer == null) return Enumerable.Empty<InvoiceDto>();

            var invoices = await _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.Items)
                .Where(i => i.CustomerId == customer.Id)
                .OrderByDescending(i => i.Id)
                .ToListAsync();

            return invoices.Select(i => new InvoiceDto
            {
                Id = i.Id,
                InvoiceNumber = i.InvoiceNumber,
                CustomerId = i.CustomerId,
                CustomerName = i.Customer != null ? i.Customer.Name : "Unknown",
                QuotationId = i.QuotationId,
                WorkOrderId = i.WorkOrderId,
                IssueDate = i.IssueDate,
                DueDate = i.DueDate,
                SubTotal = i.SubTotal,
                TaxAmount = i.TaxAmount,
                TotalAmount = i.TotalAmount,
                AmountPaid = i.AmountPaid,
                Status = (int)i.Status,
                StatusString = i.Status.ToString(),
                Items = i.Items.Select(item => new InvoiceItemDto
                {
                    Id = item.Id,
                    Description = item.Description,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice > 0 ? item.TotalPrice : (item.Quantity * item.UnitPrice)
                }).ToList()
            });
        }
    
        public async Task<WeeklyAccountingReportDto> GetWeeklyAccountingReportAsync(string tenantId, DateTime weekStart, DateTime weekEnd)
        {
            var tId = int.Parse(tenantId);
            
            var paidInvoices = await _context.Invoices
                .IgnoreQueryFilters()
                .Include(i => i.Items)
                .Include(i => i.Customer)
                .Where(i => i.TenantId == tId && 
                            i.Status == MytechERP.domain.Entities.Finance.InvoiceStatus.Paid &&
                            i.IssueDate.Date >= weekStart.Date && 
                            i.IssueDate.Date <= weekEnd.Date)
                .ToListAsync();

            var report = new WeeklyAccountingReportDto
            {
                DateFrom = weekStart,
                DateTo = weekEnd,
                PaidInvoiceCount = paidInvoices.Count,
                MaterialsBreakdown = new List<ReportLineItemDto>(),
                LaborServicesBreakdown = new List<ReportLineItemDto>()
            };

            foreach (var inv in paidInvoices)
            {
                foreach (var item in inv.Items)
                {
                    var line = new ReportLineItemDto
                    {
                        InvoiceNumber = inv.InvoiceNumber,
                        CustomerName = inv.Customer?.Name ?? "",
                        Description = item.Description ?? "",
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        LineTotal = item.TotalPrice,
                        InvoiceDate = inv.IssueDate
                    };

                    if (item.ItemCategory == MytechERP.domain.Enums.ItemCategory.Material)
                    {
                        report.MaterialsBreakdown.Add(line);
                        report.MaterialsSalesTotal += line.LineTotal;
                    }
                    else
                    {
                        report.LaborServicesBreakdown.Add(line);
                        report.LaborServicesSalesTotal += line.LineTotal;
                    }
                }
            }

            return report;
        }

                public async Task SendInvoiceEmailAsync(int id, string tenantId, string recipientEmail)
        {
            int tId = int.Parse(tenantId);
            var invoice = await _context.Invoices.Include(i => i.Customer).FirstOrDefaultAsync(i => i.Id == id && i.TenantId == tId);
            if (invoice == null) throw new Exception("Invoice not found.");

            string subject = $"Invoice {invoice.InvoiceNumber} from FieldZenPro";
            string body = $@"
                <h2>Hello {invoice.Customer?.Name},</h2>
                <p>Your invoice <strong>{invoice.InvoiceNumber}</strong> has been issued.</p>
                <p><strong>Total Amount:</strong> ${invoice.TotalAmount:F2}</p>
                <p><strong>Due Date:</strong> {invoice.DueDate:yyyy-MM-dd}</p>
                <p>Please find the PDF copy of your invoice attached to this email.</p>
                <p>Thank you for your business!</p>
            ";

            var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(id);
            await _emailService.SendEmailWithAttachmentAsync(recipientEmail, subject, body, pdfBytes, $"Invoice_{invoice.InvoiceNumber}.pdf");
        }

        public async Task SendWeeklyReportEmailAsync(string tenantId, DateTime weekStart, DateTime weekEnd, string recipientEmail)
        {
            var report = await GetWeeklyAccountingReportAsync(tenantId, weekStart, weekEnd);

            var csv = new StringBuilder();
            csv.AppendLine("Category,Invoice Number,Date,Customer,Description,Quantity,Unit Price,Total");
            
            foreach(var m in report.MaterialsBreakdown)
                csv.AppendLine($"Material,{m.InvoiceNumber},{m.InvoiceDate:yyyy-MM-dd},\"{m.CustomerName.Replace("\"", "\"\"")}\",\"{m.Description.Replace("\"", "\"\"")}\",{m.Quantity},{m.UnitPrice},{m.LineTotal}");
            
            foreach(var l in report.LaborServicesBreakdown)
                csv.AppendLine($"Labor/Service,{l.InvoiceNumber},{l.InvoiceDate:yyyy-MM-dd},\"{l.CustomerName.Replace("\"", "\"\"")}\",\"{l.Description.Replace("\"", "\"\"")}\",{l.Quantity},{l.UnitPrice},{l.LineTotal}");
            
            csv.AppendLine($"SUMMARY,,,,,,Total Material,{report.MaterialsSalesTotal}");
            csv.AppendLine($"SUMMARY,,,,,,Total Labor,{report.LaborServicesSalesTotal}");
            csv.AppendLine($"SUMMARY,,,,,,TOTAL,{report.GrandTotal}");

            byte[] fileBytes = Encoding.UTF8.GetBytes(csv.ToString());

            string body = $@"
                <h2>Weekly Accounting Report</h2>
                <p>Week: {weekStart:MMM dd, yyyy} - {weekEnd:MMM dd, yyyy}</p>
                <p>Total Material Revenue: {report.MaterialsSalesTotal:C}</p>
                <p>Total Labor/Service Revenue: {report.LaborServicesSalesTotal:C}</p>
                <h3>Total Revenue: {report.GrandTotal:C}</h3>
                <p>Please find the detailed breakdown attached as a CSV.</p>
            ";

            await _emailService.SendEmailWithAttachmentAsync(
                recipientEmail, 
                $"Weekly Accounting Report ({weekStart:MMM dd} - {weekEnd:MMM dd})", 
                body, 
                fileBytes, 
                $"WeeklyReport_{weekStart:yyyyMMdd}.csv"
            );
        }
    }
}
