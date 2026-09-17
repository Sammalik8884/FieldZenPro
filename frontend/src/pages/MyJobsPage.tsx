import { useState, useEffect, useRef } from "react";
import { Loader2, Wrench, MapPin, CalendarClock, ChevronRight, Calendar, List, ChevronLeft, Camera } from "lucide-react";
import { startOfWeek, addDays, format, isSameDay, isToday } from "date-fns";
import { getNYDate } from "../utils/dateUtils";
import { workOrderService } from "../services/workOrderService";
import { timeTrackingService } from "../services/timeTrackingService";
import { WorkOrderDto } from "../types/field";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const MyJobsPage = () => {
 const [jobs, setJobs] = useState<WorkOrderDto[]>([]);
 const [loading, setLoading] = useState(true);
 const [checkInLoadingId, setCheckInLoadingId] = useState<number | null>(null);
 const navigate = useNavigate();
 const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");
 const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(getNYDate(), { weekStartsOn: 1 }));
 const [selectedDay, setSelectedDay] = useState<Date>(() => getNYDate());
 const dayStripRef = useRef<HTMLDivElement>(null);
 const [activeTab, setActiveTab] = useState<'active' | 'waiting' | 'completed'>('active');

 const fetchJobs = async () => {
  try {
   setLoading(true);
   const data = await workOrderService.getMyJobs();
   setJobs(data);
  } catch {
   toast.error("Failed to load your assigned jobs.");
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { fetchJobs(); }, []);

 useEffect(() => {
  if (dayStripRef.current) {
   const el = dayStripRef.current.querySelector('[data-selected="true"]');
   if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
 }, [selectedDay]);

 const handleCheckIn = async (e: React.MouseEvent, workOrderId: number) => {
  e.stopPropagation();
  if (!navigator.geolocation) { toast.error("Geolocation not supported."); return; }
  setCheckInLoadingId(workOrderId);
  navigator.geolocation.getCurrentPosition(
   async (pos) => {
    try {
     await timeTrackingService.checkIn({ workOrderId, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
     toast.success("Checked in!");
     navigate(`/job/${workOrderId}`);
    } catch (error: any) {
     toast.error(error.response?.data?.message || "Failed to check in.");
    } finally { setCheckInLoadingId(null); }
   },
   (err) => { toast.error("GPS failed: " + err.message); setCheckInLoadingId(null); },
   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
 };

 const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
 const getJobsForDay = (day: Date) => jobs.filter(wo => wo.scheduledDate && isSameDay(new Date(wo.scheduledDate), day));

 const activeJobs = jobs.filter(j => ['Initialized', 'InProgress'].includes(j.status));
 const waitingJobs = jobs.filter(j => j.status === 'WaitingForParts' || j.status === 'PendingQuote');
 const completedJobs = jobs.filter(j => j.status === 'Completed' || j.status === 'Approved');
 const tabJobs = activeTab === 'active' ? activeJobs : activeTab === 'waiting' ? waitingJobs : completedJobs;

 const selectedDayJobs = getJobsForDay(selectedDay).filter(j => {
  if (activeTab === 'active') return !['Completed', 'Approved', 'WaitingForParts', 'PendingQuote'].includes(j.status);
  if (activeTab === 'waiting') return j.status === 'WaitingForParts' || j.status === 'PendingQuote';
  return j.status === 'Completed' || j.status === 'Approved';
 });

 const statusColor = (status: string) => {
  if (status === 'Completed' || status === 'Approved') return 'text-green-500 bg-green-500/10 border-green-500/20';
  if (status === 'InProgress') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  if (status === 'WaitingForParts') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
  if (status === 'PendingQuote') return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
  return 'text-primary bg-primary/10 border-primary/20';
 };

 // Returns the dot color for a job based on its status
 const dotColor = (job: WorkOrderDto, selected: boolean) => {
  if (selected) return 'bg-primary-foreground';
  if (job.status === 'Completed' || job.status === 'Approved') return 'bg-green-500';
  if (job.status === 'WaitingForParts' || job.status === 'PendingQuote') return 'bg-orange-500';
  return 'bg-primary';
 };

 // Chromebook-optimized job card
 const JobCard = ({ job }: { job: WorkOrderDto }) => (
  <div
   onClick={() => navigate(`/job/${job.id}`)}
   className="bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-5 lg:p-6 shadow-md cursor-pointer transition-all active:scale-[0.98] group"
  >
   <div className="flex justify-between items-start mb-3">
    <div className="flex items-center gap-2 flex-wrap">
     <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-lg">
      WO-{job.id.toString().padStart(4, '0')}
     </span>
     <span className={`text-sm font-semibold border-2 px-3 py-1 rounded-full ${statusColor(job.status)}`}>
      {job.status === 'WaitingForParts' ? 'Waiting: Parts' : job.status === 'PendingQuote' ? 'Waiting: Quote' : job.status}
     </span>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
   </div>

   <h3 className="font-bold text-lg lg:text-xl text-foreground mb-2 leading-snug">{job.description}</h3>

   <div className="space-y-2 text-base text-muted-foreground">
    <div className="flex items-center gap-2">
     <MapPin className="h-5 w-5 shrink-0 text-primary/60" />
     <span className="font-medium">{job.customerName}{job.siteName ? ` — ${job.siteName}` : ''}</span>
    </div>
    {job.scheduledDate && (
     <div className="flex items-center gap-2">
      <CalendarClock className="h-5 w-5 shrink-0 text-primary/60" />
      <span>{new Date(job.scheduledDate).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
     </div>
    )}
   </div>

   <div className="mt-4 flex gap-3">
    {job.status === 'Initialized' && !job.checkInTime ? (
     <button
      onClick={(e) => handleCheckIn(e, job.id)}
      disabled={checkInLoadingId === job.id}
      className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[56px]"
     >
      {checkInLoadingId === job.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
      Check In & Start Job
     </button>
    ) : (job.status === 'InProgress' || job.status === 'Initialized') ? (
     <button
      onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`); }}
      className="flex-1 py-4 border-2 border-primary text-primary rounded-xl text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[56px]"
     >
      Continue Job
     </button>
    ) : (
     <button
      onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`); }}
      className="flex-1 py-4 border-2 border-border text-foreground rounded-xl text-base font-bold flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[56px]"
     >
      View Job
     </button>
    )}
    <button
     onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}#photos`); }}
     className="py-4 px-5 border-2 border-border text-muted-foreground rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:border-primary/40 hover:text-primary min-h-[56px]"
     title="Add Photos"
    >
     <Camera className="h-5 w-5" />
    </button>
   </div>
  </div>
 );

 return (
  <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pb-24">
   {/* Header */}
   <div className="flex items-center justify-between mb-6">
    <div>
     <h1 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-3">
      <Wrench className="h-8 w-8 text-primary" />
      My Jobs
     </h1>
     <p className="text-sm text-muted-foreground mt-1 font-medium uppercase tracking-wider">
      Week of {format(currentWeekStart, "MMM d, yyyy")}
     </p>
    </div>
    <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border gap-1">
     <button onClick={() => setViewMode("list")} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
      <List className="h-5 w-5" /> List
     </button>
     <button onClick={() => setViewMode("calendar")} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold transition-all ${viewMode === "calendar" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}>
      <Calendar className="h-5 w-5" /> Calendar
     </button>
    </div>
   </div>

   {/* Status Tabs */}
   <div className="flex gap-2 mb-6 bg-muted/30 p-1.5 rounded-2xl border border-border w-fit">
    {([
     { key: 'active', label: 'Active', count: activeJobs.length, active: 'bg-primary text-primary-foreground' },
     { key: 'waiting', label: 'Waiting', count: waitingJobs.length, active: 'bg-orange-500 text-white' },
     { key: 'completed', label: 'Completed', count: completedJobs.length, active: 'bg-green-600 text-white' },
    ] as const).map(tab => (
     <button key={tab.key} onClick={() => setActiveTab(tab.key)}
      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-base font-bold transition-all min-h-[52px] ${activeTab === tab.key ? tab.active + ' shadow' : 'text-muted-foreground hover:text-foreground'}`}>
      {tab.label}
      <span className={`text-sm px-2 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>{tab.count}</span>
     </button>
    ))}
   </div>

   {/* Dot legend */}
   <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground px-1">
    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" /> Active</span>
    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-orange-500 inline-block" /> Waiting</span>
    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" /> Completed</span>
   </div>

   {loading ? (
    <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
   ) : viewMode === "calendar" ? (
    <div className="space-y-5">
     {/* Week Nav */}
     <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4">
      <button onClick={() => { const p = addDays(currentWeekStart, -7); setCurrentWeekStart(p); setSelectedDay(p); }} className="p-3 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[52px] min-h-[52px] flex items-center justify-center">
       <ChevronLeft className="h-6 w-6" />
      </button>
      <span className="text-lg font-bold text-foreground">{format(currentWeekStart, "MMM d")} – {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}</span>
      <button onClick={() => { const n = addDays(currentWeekStart, 7); setCurrentWeekStart(n); setSelectedDay(n); }} className="p-3 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[52px] min-h-[52px] flex items-center justify-center">
       <ChevronRight className="h-6 w-6" />
      </button>
     </div>

     {/* Day Strip — color-coded dots per job status */}
     <div ref={dayStripRef} className="grid grid-cols-7 gap-2">
      {weekDays.map((day, i) => {
       const dayJobs = getJobsForDay(day);
       const sel = isSameDay(day, selectedDay);
       const today = isToday(day);
       return (
        <button key={i} data-selected={sel} onClick={() => setSelectedDay(day)}
         className={`flex flex-col items-center rounded-2xl py-4 px-2 transition-all active:scale-95 border-2 ${sel ? 'bg-primary text-primary-foreground border-primary shadow-lg' : today ? 'bg-primary/10 text-primary border-primary/40' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
         <span className={`text-xs font-bold uppercase tracking-wider ${sel ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{format(day, "EEE")}</span>
         <span className="text-2xl font-bold mt-1">{format(day, "d")}</span>
         {dayJobs.length > 0 && (
          <div className="mt-2 flex gap-1 flex-wrap justify-center">
           {dayJobs.slice(0, 4).map((job, idx) => (
            <div key={idx} className={`h-2.5 w-2.5 rounded-full ${dotColor(job, sel)}`} />
           ))}
          </div>
         )}
        </button>
       );
      })}
     </div>

     {/* Selected Day */}
     <div>
      <div className="flex items-center justify-between mb-4">
       <h2 className="text-lg font-bold text-muted-foreground uppercase tracking-wider">{format(selectedDay, "EEEE, MMMM d")}</h2>
       <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full font-semibold">{selectedDayJobs.length} job{selectedDayJobs.length !== 1 ? 's' : ''}</span>
      </div>
      {selectedDayJobs.length === 0 ? (
       <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-semibold">No jobs scheduled</p>
        <p className="text-base mt-1">You're free on this day.</p>
       </div>
      ) : (
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {selectedDayJobs.map(job => <JobCard key={job.id} job={job} />)}
       </div>
      )}
     </div>
    </div>
   ) : (
    /* List View */
    <div className="space-y-5">
     <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4">
      <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="p-3 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[52px] min-h-[52px] flex items-center justify-center">
       <ChevronLeft className="h-6 w-6" />
      </button>
      <span className="text-lg font-bold text-foreground">{format(currentWeekStart, "MMM d")} – {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}</span>
      <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="p-3 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[52px] min-h-[52px] flex items-center justify-center">
       <ChevronRight className="h-6 w-6" />
      </button>
     </div>
     <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider px-1">
      {activeTab === 'active' ? 'Active Jobs' : activeTab === 'waiting' ? 'Waiting for Parts / Quote' : 'Completed Jobs'}
     </h2>
     {tabJobs.length === 0 ? (
      <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-lg">
       {activeTab === 'active' ? 'No active jobs.' : activeTab === 'waiting' ? 'No jobs waiting.' : 'No completed jobs yet.'}
      </div>
     ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
       {tabJobs.map(job => <JobCard key={job.id} job={job} />)}
      </div>
     )}
    </div>
   )}
  </div>
 );
};
