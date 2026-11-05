using System;
using System.Collections.Generic;

namespace MytechERP.Application.DTOs.Dashboard
{
    public class AdminDashboardMetricsDto
    {
        public int JobsScheduledThisWeek { get; set; }
        public int JobsCompletedThisWeek { get; set; }
        public int JobsWaitingForParts { get; set; }
        public int JobsWaitingForQuote { get; set; }
        public int UnscheduledJobs { get; set; }
        public decimal OutstandingInvoicesAmountThisWeek { get; set; }
        public int OutstandingInvoicesCountThisWeek { get; set; }
        public List<ChartDataPoint> WeeklyJobsBreakdown { get; set; } = new();
    }

    public class TechnicianDashboardMetricsDto
    {
        public int JobsAssignedToday { get; set; }
        public int JobsCompletedToday { get; set; }
        public int JobsInProgress { get; set; }
        public List<ChartDataPoint> MyJobsBreakdown { get; set; } = new();
    }
}
