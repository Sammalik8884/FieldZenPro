import { useState, useEffect, useRef } from "react";
import { Loader2, Wrench, MapPin, CalendarClock, ChevronRight, Calendar, List, ChevronLeft } from "lucide-react";
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

 const fetchJobs = async () => {
  try {
   setLoading(true);
   const data = await workOrderService.getMyJobs();
   setJobs(data);
  } catch (error) {
   toast.error("Failed to load your assigned jobs.");
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchJobs();
 }, []);

 // Scroll selected day into view on mobile
 useEffect(() => {
  if (dayStripRef.current) {
   const el = dayStripRef.current.querySelector('[data-selected="true"]');
   if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
 }, [selectedDay]);

 const handleCheckIn = async (e: React.MouseEvent, workOrderId: number) => {
  e.stopPropagation();
  if (!navigator.geolocation) {
   toast.error("Geolocation is not supported by your browser.");
   return;
  }

  setCheckInLoadingId(workOrderId);
  navigator.geolocation.getCurrentPosition(
   async (pos) => {
    try {
     await timeTrackingService.checkIn({
      workOrderId,
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude
     });
     toast.success("Checked in successfully!");
     navigate(`/job/${workOrderId}`);
    } catch (error: any) {
     toast.error(error.response?.data?.message || "Failed to check in.");
    } finally {
     setCheckInLoadingId(null);
    }
   },
   (err) => {
    toast.error("Failed to acquire GPS location: " + err.message);
    setCheckInLoadingId(null);
   },
   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
 };

 const weekEnd = addDays(currentWeekStart, 7);
 const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

 const getJobsForDay = (day: Date) => jobs.filter(wo =>
  wo.scheduledDate && isSameDay(new Date(wo.scheduledDate), day)
 );

 const selectedDayJobs = getJobsForDay(selectedDay);
 const activeJobs = jobs.filter(j =>
  j.status !== 'Completed' &&
  j.status !== 'Approved' &&
  j.scheduledDate &&
  new Date(j.scheduledDate) >= currentWeekStart &&
  new Date(j.scheduledDate) < weekEnd
 );
 const pastJobs = jobs.filter(j =>
  (j.status === 'Completed' || j.status === 'Approved') &&
  j.scheduledDate &&
  new Date(j.scheduledDate) >= currentWeekStart &&
  new Date(j.scheduledDate) < weekEnd
 );

 const statusColor = (status: string) => {
  if (status === 'Completed' || status === 'Approved') return 'text-green-500 bg-green-500/10 border-green-500/20';
  if (status === 'InProgress') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  if (status === 'WaitingForParts') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
  if (status === 'PendingQuote') return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
  return 'text-primary bg-primary/10 border-primary/20';
 };

 return (
  <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
   {/* Header */}
   <div className="flex items-center justify-between mb-4">
    <div>
     <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
      <Wrench className="h-6 w-6 text-primary" />
      My Jobs
     </h1>
     <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">
      Week of {format(currentWeekStart, "MMM d, yyyy")}
     </p>
    </div>

    {/* View Toggle */}
    <div className="flex bg-muted/30 p-1 rounded-xl border border-border">
     <button
      onClick={() => setViewMode("list")}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
     >
      <List className="h-4 w-4" />
      <span className="hidden sm:inline">List</span>
     </button>
     <button
      onClick={() => setViewMode("calendar")}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
     >
      <Calendar className="h-4 w-4" />
      <span className="hidden sm:inline">Calendar</span>
     </button>
    </div>
   </div>

   {loading ? (
    <div className="flex justify-center p-16">
     <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
   ) : viewMode === "calendar" ? (
    <div className="space-y-4">
     {/* Week Navigation */}
     <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3">
      <button
       onClick={() => {
        const prev = addDays(currentWeekStart, -7);
        setCurrentWeekStart(prev);
        setSelectedDay(prev);
       }}
       className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
       <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold text-foreground">
       {format(currentWeekStart, "MMM d")} – {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
      </span>
      <button
       onClick={() => {
        const next = addDays(currentWeekStart, 7);
        setCurrentWeekStart(next);
        setSelectedDay(next);
       }}
       className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
       <ChevronRight className="h-5 w-5" />
      </button>
     </div>

     {/* Day Strip — horizontal scroll on mobile, full grid on desktop */}
     <div ref={dayStripRef} className="flex md:grid md:grid-cols-7 gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
      {weekDays.map((day, i) => {
       const dayJobs = getJobsForDay(day);
       const sel = isSameDay(day, selectedDay);
       const today = isToday(day);
       return (
        <button
         key={i}
         data-selected={sel}
         onClick={() => setSelectedDay(day)}
         className={`flex-shrink-0 md:flex-shrink flex flex-col items-center rounded-2xl py-3 px-3 md:px-2 min-w-[64px] md:min-w-0 snap-center transition-all active:scale-95 border ${sel
          ? 'bg-primary text-primary-foreground border-primary shadow-lg'
          : today
           ? 'bg-primary/10 text-primary border-primary/30'
           : 'bg-card text-foreground border-border hover:bg-muted'
          }`}
        >
         <span className={`text-[10px] font-bold uppercase tracking-wider ${sel ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {format(day, "EEE")}
         </span>
         <span className="text-xl font-bold mt-0.5">{format(day, "d")}</span>
         {dayJobs.length > 0 && (
          <div className={`mt-1.5 flex gap-0.5 flex-wrap justify-center`}>
           {dayJobs.slice(0, 3).map((_, idx) => (
            <div key={idx} className={`h-1.5 w-1.5 rounded-full ${sel ? 'bg-primary-foreground' : 'bg-primary'}`} />
           ))}
          </div>
         )}
        </button>
       );
      })}
     </div>

     {/* Selected Day Jobs */}
     <div>
      <div className="flex items-center justify-between mb-3">
       <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
        {format(selectedDay, "EEEE, MMMM d")}
       </h2>
       <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
        {selectedDayJobs.length} job{selectedDayJobs.length !== 1 ? 's' : ''}
       </span>
      </div>

      {selectedDayJobs.length === 0 ? (
       <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No jobs scheduled</p>
        <p className="text-sm mt-1">You're free on this day.</p>
       </div>
      ) : (
       <div className="space-y-3">
        {selectedDayJobs.map(job => (
         <div
          key={job.id}
          onClick={() => navigate(`/job/${job.id}`)}
          className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 active:scale-[0.98] cursor-pointer transition-all"
         >
          <div className="flex items-start justify-between gap-3 mb-2">
           <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
             WO-{job.id.toString().padStart(4, '0')}
            </span>
            <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${statusColor(job.status)}`}>
             {job.status}
            </span>
           </div>
           <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          </div>
          <h3 className="font-semibold text-foreground leading-snug mb-2">{job.description}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
           <MapPin className="h-4 w-4 shrink-0" />
           <span className="truncate">{job.customerName}{job.siteName ? ` — ${job.siteName}` : ''}</span>
          </div>
          {job.scheduledDate && (
           <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <CalendarClock className="h-4 w-4 shrink-0" />
            <span>{new Date(job.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
          )}
          <div className="mt-3">
           {job.status === 'Initialized' && !job.checkInTime ? (
            <button
             onClick={(e) => handleCheckIn(e, job.id)}
             disabled={checkInLoadingId === job.id}
             className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
             {checkInLoadingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
             Check In & Start Job
            </button>
           ) : (job.status === 'InProgress' || job.status === 'Initialized') ? (
            <button
             onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`); }}
             className="w-full py-3 border border-primary text-primary rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
             Continue Job
            </button>
           ) : null}
          </div>
         </div>
        ))}
       </div>
      )}
     </div>
    </div>
   ) : (
    /* List View */
    <div className="space-y-6">
     {/* Week nav for list view */}
     <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3">
      <button
       onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
       className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
       <ChevronLeft className="h-5 w-5" />
      </button>
      <span className="text-sm font-semibold text-foreground">
       {format(currentWeekStart, "MMM d")} – {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
      </span>
      <button
       onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
       className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all text-muted-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
       <ChevronRight className="h-5 w-5" />
      </button>
     </div>

     {/* Active Jobs */}
     <div>
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">Action Required</h2>
      {activeJobs.length === 0 ? (
       <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
        No active jobs this week. Enjoy your time!
       </div>
      ) : (
       <div className="space-y-3">
        {activeJobs.map(job => (
         <div
          key={job.id}
          onClick={() => navigate(`/job/${job.id}`)}
          className="bg-card border border-primary/20 hover:border-primary/50 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group active:scale-[0.98]"
         >
          <div className="flex justify-between items-start mb-3">
           <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
             WO-{job.id.toString().padStart(4, '0')}
            </span>
            <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${statusColor(job.status)}`}>
             {job.status}
            </span>
           </div>
           <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold text-lg text-foreground mb-1 leading-tight">{job.description}</h3>
          <div className="space-y-1.5 text-sm text-muted-foreground mt-2">
           <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{job.customerName} — {job.siteName}</span>
           </div>
           <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0" />
            <span>{job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) : 'Unscheduled'}</span>
           </div>
          </div>
          <div className="mt-4">
           {job.status === 'Initialized' && !job.checkInTime ? (
            <button
             onClick={(e) => handleCheckIn(e, job.id)}
             disabled={checkInLoadingId === job.id}
             className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
             {checkInLoadingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
             Check In & Start Job
            </button>
           ) : (job.status === 'InProgress' || job.status === 'Initialized') ? (
            <button
             onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`); }}
             className="w-full py-3 border border-primary text-primary rounded-xl text-sm font-semibold active:scale-95 transition-all"
            >
             Continue Job
            </button>
           ) : null}
          </div>
         </div>
        ))}
       </div>
      )}
     </div>

     {/* Past Jobs */}
     {pastJobs.length > 0 && (
      <div>
       <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">Completed This Week</h2>
       <div className="space-y-2">
        {pastJobs.map(job => (
         <div
          key={job.id}
          onClick={() => navigate(`/job/${job.id}`)}
          className="bg-card border border-border rounded-xl p-4 shadow-sm cursor-pointer hover:border-border active:scale-[0.99] transition-all"
         >
          <div className="flex justify-between items-center">
           <div>
            <h3 className="font-medium text-foreground text-sm line-clamp-1">{job.description}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{job.customerName}</p>
           </div>
           <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
            {job.status}
           </span>
          </div>
         </div>
        ))}
       </div>
      </div>
     )}
    </div>
   )}
  </div>
 );
};
