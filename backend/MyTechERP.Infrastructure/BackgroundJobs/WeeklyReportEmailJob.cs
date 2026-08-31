using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MytechERP.Application.Interfaces;
using MytechERP.Infrastructure.Persistance;
using System;
using System.Threading.Tasks;

namespace MyTechERP.Infrastructure.BackgroundJobs
{
    /// <summary>
    /// Hangfire recurring job — fires every Monday at 06:00 UTC.
    /// For each tenant that has WeeklyReportEmail configured it:
    ///   1. Calculates the previous week (Mon-Sun)
    ///   2. Calls InvoiceService.SendWeeklyReportEmailAsync
    ///
    /// Registered in Program.cs:
    ///   RecurringJob.AddOrUpdate<WeeklyReportEmailJob>(
    ///       "weekly-accounting-report",
    ///       job => job.RunAsync(),
    ///       "0 6 * * 1");
    /// </summary>
    public class WeeklyReportEmailJob
    {
        private readonly IInvoiceService _invoiceService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WeeklyReportEmailJob> _logger;

        public WeeklyReportEmailJob(
            IInvoiceService invoiceService,
            ApplicationDbContext context,
            ILogger<WeeklyReportEmailJob> logger)
        {
            _invoiceService = invoiceService;
            _context = context;
            _logger = logger;
        }

        public async Task RunAsync()
        {
            // Previous Monday -> previous Sunday
            var today     = DateTime.UtcNow.Date;
            var weekEnd   = today.AddDays(-(int)today.DayOfWeek);   // Last Sunday
            var weekStart = weekEnd.AddDays(-6);                     // Last Monday

            _logger.LogInformation(
                "WeeklyReportEmailJob: generating reports for {Start:yyyy-MM-dd} to {End:yyyy-MM-dd}",
                weekStart, weekEnd);

            // Load all tenants that have a report email configured
            var tenants = await _context.Tenants
                .AsNoTracking()
                .Where(t => t.IsActive && t.WeeklyReportEmail != null && t.WeeklyReportEmail != "")
                .ToListAsync();

            _logger.LogInformation(
                "WeeklyReportEmailJob: found {Count} tenant(s) with report emails.", tenants.Count);

            foreach (var tenant in tenants)
            {
                try
                {
                    await _invoiceService.SendWeeklyReportEmailAsync(
                        tenant.Id.ToString(),
                        weekStart,
                        weekEnd,
                        tenant.WeeklyReportEmail!);

                    _logger.LogInformation(
                        "WeeklyReportEmailJob: report sent for TenantId={TenantId} to {Email}",
                        tenant.Id, tenant.WeeklyReportEmail);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "WeeklyReportEmailJob: failed for TenantId={TenantId}. Error: {Message}",
                        tenant.Id, ex.Message);
                    // Continue to next tenant; one failure does not block others
                }
            }
        }
    }
}
