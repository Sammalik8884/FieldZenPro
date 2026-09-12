import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { PremiumChart } from '../components/dashboard/PremiumChart';
import { SystemSetupGuide } from '../components/SystemSetupGuide';
import { apiClient } from '../services/apiClient';
import {
 AlertTriangle, AlertCircle, RefreshCw, Calendar, Zap, Briefcase, CheckCircle, Clock, FileText, Wrench, ArrowRight
} from 'lucide-react';
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Link } from 'react-router-dom';

interface ChartDataPoint { name: string; value: number; secondaryValue?: number }
interface DashboardMetrics {
 totalQuotations: number;
 totalQuotationValue: number;
 pendingQuotations: number;
 revenueOverTime: ChartDataPoint[];
 workOrdersByStatus: ChartDataPoint[];
 quotationsByStatus: ChartDataPoint[];
 topCustomersByRevenue: ChartDataPoint[];
 jobsCompletedOverTime: ChartDataPoint[];
 invoiceStatusBreakdown: ChartDataPoint[];
}

interface AdminMetrics {
 jobsScheduledThisWeek: number;
 jobsCompletedThisWeek: number;
 jobsWaitingForParts: number;
 jobsWaitingForQuote: number;
 unscheduledJobs: number;
 outstandingInvoicesAmountThisWeek: number;
 outstandingInvoicesCountThisWeek: number;
 weeklyJobsBreakdown: ChartDataPoint[];
}

interface TechnicianMetrics {
 jobsAssignedToday: number;
 jobsCompletedToday: number;
 jobsInProgress: number;
 myJobsBreakdown: ChartDataPoint[];
}

const fmt = (n: number) => 
 new Intl.NumberFormat('en-US', { 
 style: 'currency', 
 currency: 'USD',
 minimumFractionDigits: 0,
 maximumFractionDigits: 0
 }).format(n);

const CustomizationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
 if (!isOpen) return null;
 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
 <div className="bg-card w-full max-w-lg rounded-3xl p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative border border-border">
 <div className="mb-6 text-center">
 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
 <Zap className="h-8 w-8" />
 </div>
 <h2 className="text-2xl font-bold">Custom ERP Setup Available!</h2>
 </div>
 <div className="text-center text-muted-foreground mb-8 space-y-4 leading-relaxed">
 <p>
 We know every business is unique. That's why we offer <strong>Customization tailored to your exact workflow</strong>. 
 </p>
 <p>
 Whether you need specific modules, custom fields, specialized forms, or unique integrations, we can build the ERP system exactly according to your needs.
 </p>
 <p className="font-semibold text-foreground text-base">
 Contact us at <a href="mailto:fieldzenpro@gmail.com" className="text-primary hover:underline font-bold">fieldzenpro@gmail.com</a> for any type of customization!
 </p>
 </div>
 <button
 onClick={onClose}
 className="w-full rounded-xl bg-primary px-4 py-3.5 font-bold text-white transition-all hover:bg-primary/90"
 >
 I Understand
 </button>
 </div>
 </div>
 );
};

// Sub-component for simple KPI Cards
const KPICard = ({ title, value, icon, subtext, colorClass }: any) => (
  <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className={`p-2 rounded-lg ${colorClass}`}>
        {icon}
      </div>
    </div>
    <div>
      <p className="text-3xl font-black text-foreground">{value}</p>
      {subtext && <p className="text-xs text-muted-foreground mt-1 font-medium">{subtext}</p>}
    </div>
  </div>
);

export const DashboardPage: React.FC = () => {
 const { user } = useAuth();
 const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
 const [adminMetrics, setAdminMetrics] = useState<AdminMetrics | null>(null);
 const [techMetrics, setTechMetrics] = useState<TechnicianMetrics | null>(null);
 const [loading, setLoading] = useState(true);
 const [lastRefresh, setLastRefresh] = useState(new Date());

 // Date Filtering State
 const [dateRange, setDateRange] = useState<'30days' | '6months' | '1year' | 'all' | 'custom'>('6months');
 const [customStartDate, setCustomStartDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
 const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
 const [showCustomizationModal, setShowCustomizationModal] = useState(false);

 const isAdmin = user?.roles?.includes('Admin');
 const isTechnician = user?.roles?.includes('Technician') || user?.roles?.includes('Staff');

 useEffect(() => {
 if (user?.id) {
 const hasSeen = localStorage.getItem(`hasSeenCustomizationPopup_${user.id}`);
 if (!hasSeen) {
 setShowCustomizationModal(true);
 }
 }
 }, [user?.id]);

 const closeCustomizationModal = () => {
 if (user?.id) {
 localStorage.setItem(`hasSeenCustomizationPopup_${user.id}`, 'true');
 }
 setShowCustomizationModal(false);
 };

 const fetchMetrics = async () => {
 try {
 setLoading(true);
 let startDate = '';
 let endDate = '';
 const today = new Date();

 if (dateRange === '30days') {
 startDate = format(subDays(today, 30), 'yyyy-MM-dd');
 endDate = format(today, 'yyyy-MM-dd');
 } else if (dateRange === '6months') {
 startDate = format(subMonths(today, 6), 'yyyy-MM-dd');
 endDate = format(today, 'yyyy-MM-dd');
 } else if (dateRange === '1year') {
 startDate = format(subYears(today, 1), 'yyyy-MM-dd');
 endDate = format(today, 'yyyy-MM-dd');
 } else if (dateRange === 'custom') {
 startDate = customStartDate;
 endDate = customEndDate;
 } else if (dateRange === 'all') {
 startDate = '2000-01-01';
 endDate = '2100-01-01';
 }

 if (isAdmin) {
   const [execData, adminData] = await Promise.all([
     apiClient.get('/Dashboard/metrics', { params: { startDate, endDate } }),
     apiClient.get('/Dashboard/admin-metrics')
   ]);
   setMetrics(execData.data);
   setAdminMetrics(adminData.data);
 } else if (isTechnician) {
   const techData = await apiClient.get('/Dashboard/technician-metrics');
   setTechMetrics(techData.data);
 }
 
 setLastRefresh(new Date());
 } catch (e) {
 console.error('Dashboard fetch failed', e);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (user) {
 fetchMetrics();
 }
 }, [dateRange, user]);

 const hour = new Date().getHours();
 const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

 if (!isAdmin) {
 return (
  <div className="animate-in fade-in duration-500 relative max-w-5xl mx-auto space-y-6">
   <CustomizationModal isOpen={showCustomizationModal} onClose={closeCustomizationModal} />
   
   <div className="flex items-center justify-between">
     <div>
       <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
        {greeting},&nbsp;<span className="text-primary">{user?.fullName?.split(' ')[0] ?? 'Technician'}</span>
       </h1>
       <p className="text-muted-foreground mt-2 text-sm">Here is your schedule for today.</p>
     </div>
     <button onClick={fetchMetrics} className="p-2 rounded-xl border border-border hover:bg-muted transition-all">
       <RefreshCw size={16} className={loading ? 'animate-spin text-primary' : 'text-muted-foreground'} />
     </button>
   </div>

   {loading ? (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <div className="h-32 rounded-2xl bg-muted animate-pulse" />
       <div className="h-32 rounded-2xl bg-muted animate-pulse" />
       <div className="h-32 rounded-2xl bg-muted animate-pulse" />
     </div>
   ) : techMetrics ? (
     <div className="space-y-8">
       {/* Technician KPI Row */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <KPICard 
           title="Jobs Assigned Today" 
           value={techMetrics.jobsAssignedToday} 
           icon={<Briefcase size={20} />} 
           colorClass="bg-blue-500/10 text-blue-500" 
         />
         <KPICard 
           title="In Progress" 
           value={techMetrics.jobsInProgress} 
           icon={<Clock size={20} />} 
           colorClass="bg-orange-500/10 text-orange-500" 
         />
         <KPICard 
           title="Completed Today" 
           value={techMetrics.jobsCompletedToday} 
           icon={<CheckCircle size={20} />} 
           colorClass="bg-green-500/10 text-green-500" 
         />
       </div>

       {/* Quick Access */}
       <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold">Quick Actions</h2>
         </div>
         <div className="flex flex-col sm:flex-row gap-4">
           <Link to="/work-orders" className="flex-1 flex items-center justify-between p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold">
             <div className="flex items-center gap-3">
               <Wrench size={24} />
               <span>View My Work Orders</span>
             </div>
             <ArrowRight size={20} />
           </Link>
         </div>
       </div>

       {techMetrics.myJobsBreakdown && techMetrics.myJobsBreakdown.length > 0 && (
         <PremiumChart
           title="My Jobs Overview"
           subtitle="Status of your currently assigned jobs"
           data={techMetrics.myJobsBreakdown}
           defaultType="pie"
           color="#10b981"
           allowedTypes={['pie', 'bar']}
           height={280}
         />
       )}
     </div>
   ) : null}

   <div className="mt-6">
    <SystemSetupGuide />
   </div>
  </div>
 );
 }

 return (
 <div className="pb-20 md:pb-0 space-y-6 animate-in fade-in duration-500 relative">
 <CustomizationModal isOpen={showCustomizationModal} onClose={closeCustomizationModal} />

 {/* Header */}
 <div className="flex items-start justify-between gap-3">
  <div className="min-w-0">
   <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground leading-tight">
    {greeting},&nbsp;
    <span className="text-primary">
     {user?.fullName?.split(' ')[0] ?? 'Admin'}
    </span>
   </h1>
   <p className="text-muted-foreground mt-0.5 text-sm hidden sm:block">
    Global Analytics Command Center
   </p>
  </div>
  <div className="flex items-center gap-2 shrink-0">
   {/* Date Range */}
   <div className="flex items-center gap-1.5 bg-muted border border-border rounded-xl p-1 pl-2">
    <Calendar size={13} className="text-muted-foreground shrink-0" />
    <select
     value={dateRange}
     onChange={(e) => setDateRange(e.target.value as any)}
     className="bg-transparent text-foreground text-xs font-medium border-none focus:outline-none cursor-pointer py-1 pr-5 max-w-[100px] md:max-w-none"
    >
     <option value="30days">30 Days</option>
     <option value="6months">6 Months</option>
     <option value="1year">1 Year</option>
     <option value="all">All Time</option>
     <option value="custom">Custom</option>
    </select>
   </div>
   <button
    onClick={fetchMetrics}
    className="p-2 rounded-xl border border-border hover:bg-muted transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
    title={`Refreshed ${lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
   >
    <RefreshCw size={14} className={loading ? 'animate-spin text-primary' : 'text-muted-foreground'} />
   </button>
  </div>
 </div>

 {/* Custom date range shown below header on mobile */}
 {dateRange === 'custom' && (
  <div className="flex flex-wrap items-center gap-2 bg-card border border-border rounded-2xl p-3 animate-in fade-in slide-in-from-top-2">
   <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)}
    className="bg-background border border-border text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary flex-1 min-w-[130px] min-h-[40px]" />
   <span className="text-muted-foreground text-sm">to</span>
   <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)}
    className="bg-background border border-border text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary flex-1 min-w-[130px] min-h-[40px]" />
   <button onClick={fetchMetrics} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all min-h-[40px]">Apply</button>
  </div>
 )}

 {loading ? (
 /* Skeleton */
 <div className="grid gap-6">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
   <div className="h-32 rounded-2xl bg-muted animate-pulse" />
   <div className="h-32 rounded-2xl bg-muted animate-pulse" />
   <div className="h-32 rounded-2xl bg-muted animate-pulse" />
   <div className="h-32 rounded-2xl bg-muted animate-pulse" />
 </div>
 <div className="h-80 rounded-2xl bg-muted animate-pulse" />
 </div>
 ) : (
 <div className="space-y-6">
 
 {/* ADMIN METRICS ROW */}
 {adminMetrics && (
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
     <KPICard 
       title="Jobs Scheduled (This Week)" 
       value={adminMetrics.jobsScheduledThisWeek} 
       icon={<Briefcase size={20} />} 
       colorClass="bg-blue-500/10 text-blue-500" 
       subtext={`${adminMetrics.jobsCompletedThisWeek} completed`}
     />
     <KPICard 
       title="Waiting For Parts / Quote" 
       value={adminMetrics.jobsWaitingForParts + adminMetrics.jobsWaitingForQuote} 
       icon={<Clock size={20} />} 
       colorClass="bg-orange-500/10 text-orange-500"
       subtext={`${adminMetrics.jobsWaitingForParts} parts, ${adminMetrics.jobsWaitingForQuote} quotes`}
     />
     <KPICard 
       title="Unscheduled Queue" 
       value={adminMetrics.unscheduledJobs} 
       icon={<AlertCircle size={20} />} 
       colorClass="bg-red-500/10 text-red-500" 
       subtext="Needs assignment"
     />
     <KPICard 
       title="Outstanding Invoices" 
       value={fmt(adminMetrics.outstandingInvoicesAmountThisWeek)} 
       icon={<FileText size={20} />} 
       colorClass="bg-green-500/10 text-green-500" 
       subtext={`${adminMetrics.outstandingInvoicesCountThisWeek} invoices pending`}
     />
   </div>
 )}

 <SystemSetupGuide />

 {metrics ? (
   <>
    {/* Top Focus: Financial Trajectory */}
    <div className="w-full">
    <PremiumChart
    title="Revenue Growth & Financial Trajectory"
    subtitle={`Historical analysis of paid invoices for selected period`}
    data={metrics.revenueOverTime}
    defaultType="area"
    color="#10b981"
    allowedTypes={['area', 'bar', 'line']}
    valuePrefix="$"
    height={320}
    />
    </div>

    {/* Split Level: Pipeline & Customers */}
    <div className="grid gap-6 lg:grid-cols-2">
    <PremiumChart
    title="Customer Value Distribution"
    subtitle="Top 5 highest paying customers (cumulative revenue)"
    data={metrics.topCustomersByRevenue}
    defaultType="bar"
    color="#6366f1"
    allowedTypes={['bar', 'line', 'pie']}
    valuePrefix="$"
    height={300}
    />
    <div className="grid gap-6 grid-rows-[2fr_1fr]">
    <PremiumChart
    title="Sales Pipeline & Quotation Status"
    subtitle="Distribution of quotes by stage"
    data={metrics.quotationsByStatus}
    defaultType="bar"
    color="#a855f7"
    allowedTypes={['bar', 'pie', 'line']}
    height={200}
    />
    <div className="bg-card border border-border rounded-xl p-4 md:p-6 flex items-center justify-between shadow-sm gap-4">
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Pipeline</p>
      <p className="text-2xl md:text-4xl font-black text-primary truncate">{fmt(metrics.totalQuotationValue)}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Pending Quotes</p>
      <p className="text-2xl md:text-3xl font-bold text-foreground">{metrics.pendingQuotations}</p>
    </div>
    </div>
    </div>
    </div>

    {/* Lower Split: Operational Status */}
    <div className="grid gap-6 lg:grid-cols-3">
    <PremiumChart
    title="Operational Throughput"
    subtitle="Jobs completed over the selected period"
    data={metrics.jobsCompletedOverTime}
    defaultType="area"
    color="#22d3ee"
    allowedTypes={['area', 'bar', 'line']}
    height={260}
    />
    <PremiumChart
    title="Work Order Bottlenecks"
    subtitle="Current job distribution by status"
    data={metrics.workOrdersByStatus}
    defaultType="pie"
    color="#f59e0b"
    allowedTypes={['pie', 'bar']}
    height={260}
    />
    <PremiumChart
    title="Accounts Receivable Health"
    subtitle="Paid vs Issued vs Overdue invoices"
    data={metrics.invoiceStatusBreakdown}
    defaultType="pie"
    color="#f43f5e"
    allowedTypes={['pie', 'bar']}
    height={260}
    />
    </div>
   </>
 ) : (
  <div className="flex flex-col items-center justify-center bg-card border border-border rounded-xl p-12 text-center h-96 relative overflow-hidden mt-6">
  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
  <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-inner pointer-events-none">
  <AlertTriangle size={32} className="text-primary" />
  </div>
  <h3 className="text-2xl font-bold tracking-tight mb-3">Advanced Analytics Locked</h3>
  <p className="text-muted-foreground max-w-md mx-auto mb-8">
  Get in-depth insights into your financial trajectory, customer value distribution, and operational bottlenecks by upgrading to the Pro plan.
  </p>
  <a href="/subscription/plans" className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2">
  <Zap size={18} />
  Upgrade to Pro
  </a>
  </div>
 )}
 </div>
 )}
 </div>
 );
};
