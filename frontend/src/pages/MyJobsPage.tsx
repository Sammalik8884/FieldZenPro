import { useState, useEffect } from "react";
import { Loader2, Wrench, MapPin, CalendarClock, ChevronRight, Calendar, List } from "lucide-react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
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
 const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
 const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(getNYDate(), { weekStartsOn: 1 }));

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

 const activeJobs = jobs.filter(j => j.status !== 'Completed' && j.status !== 'Approved');
 const pastJobs = jobs.filter(j => j.status === 'Completed' || j.status === 'Approved');

 return (
 <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
 <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            My Jobs
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Your field service schedule.</p>
    </div>
    <div className="flex bg-muted/30 p-1 rounded-lg border border-border w-fit">
        <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
            <List className="h-4 w-4" /> List
        </button>
        <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
            <Calendar className="h-4 w-4" /> Calendar
        </button>
    </div>
 </div>

 {loading ? (
 <div className="flex justify-center p-12">
 <Loader2 className="h-8 w-8 animate-spin text-primary" />
 </div>
 ) : (
 <>
 {viewMode === "list" ? (
 <div className="space-y-8">
 {/* Active Jobs */}
 <div>
 <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Action Required</h2>
 {activeJobs.length === 0 ? (
 <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
 No active jobs assigned. Enjoy your day!
 </div>
 ) : (
 <div className="grid gap-4">
 {activeJobs.map(job => (
 <div
 key={job.id}
 onClick={() => navigate(`/job/${job.id}`)}
 className="bg-card border border-primary/20 hover:border-primary/50 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group active:scale-[0.98]"
 >
 <div className="flex justify-between items-start mb-3">
 <div className="flex items-center gap-2">
 <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">
 WO-{job.id.toString().padStart(4, '0')}
 </span>
 <span className="text-xs font-medium text-primary">
 {job.status}
 </span>
 </div>
 <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
 </div>

 <h3 className="font-semibold text-lg text-foreground mb-1 leading-tight">{job.description}</h3>

 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-3">
 <div className="space-y-2 text-sm text-muted-foreground flex-1">
 <div className="flex items-center gap-2">
 <MapPin className="h-4 w-4 shrink-0" />
 <span className="truncate">{job.customerName} - {job.siteName}</span>
 </div>
 <div className="flex items-center gap-2">
 <CalendarClock className="h-4 w-4 shrink-0" />
 <span>{job.scheduledDate ? new Date(job.scheduledDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Unscheduled'}</span>
 </div>
 </div>

 {job.status === 'Initialized' && !job.checkInTime ? (
 <button
 onClick={(e) => handleCheckIn(e, job.id)}
 disabled={checkInLoadingId === job.id}
 className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
 >
 {checkInLoadingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
 Check In & Start Job
 </button>
 ) : (job.status === 'InProgress' || job.status === 'Initialized') ? (
 <button
 onClick={(e) => { e.stopPropagation(); navigate(`/job/${job.id}`); }}
 className="w-full sm:w-auto px-4 py-2 border border-primary text-primary hover:bg-primary/10 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
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
 <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2">Completed</h2>
 <div className="grid gap-3 opacity-75">
 {pastJobs.map(job => (
 <div
 key={job.id}
 onClick={() => navigate(`/job/${job.id}`)}
 className="bg-card border border-border rounded-xl p-4 shadow-sm cursor-pointer hover:bg-card transition-colors"
 >
 <div className="flex justify-between items-center">
 <div>
 <h3 className="font-medium text-foreground text-sm line-clamp-1">{job.description}</h3>
 <p className="text-xs text-muted-foreground mt-0.5">{job.customerName}</p>
 </div>
 <div className="text-right">
 <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded flex items-center gap-1">
 {job.status}
 </span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 ) : (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
            <h2 className="text-lg font-bold text-foreground">
                Week of {format(currentWeekStart, "MMM d, yyyy")}
            </h2>
            <div className="flex gap-2">
                <button
                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
                    className="p-2 border border-border rounded hover:bg-muted text-muted-foreground"
                >
                    &lt; Prev
                </button>
                <button
                    onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                    className="p-2 border border-border rounded hover:bg-muted text-muted-foreground"
                >
                    Next &gt;
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => {
                const day = addDays(currentWeekStart, i);
                const dayJobs = jobs.filter(wo =>
                    wo.scheduledDate && isSameDay(getNYDate(wo.scheduledDate), day)
                );
                
                return (
                    <div key={i} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[200px]">
                        <div className="bg-muted px-4 py-2 border-b border-border text-center">
                            <div className="text-xs font-semibold uppercase text-muted-foreground">{format(day, "EEE")}</div>
                            <div className="text-lg font-bold text-foreground">{format(day, "d")}</div>
                        </div>
                        <div className="p-2 flex-1 flex flex-col gap-2 bg-background/50">
                            {dayJobs.length === 0 ? (
                                <div className="text-center text-xs text-muted-foreground py-4">No jobs</div>
                            ) : (
                                dayJobs.map(job => (
                                    <div
                                        key={job.id}
                                        onClick={() => navigate(`/job/${job.id}`)}
                                        className="bg-card border border-border p-3 rounded-lg text-xs shadow-sm hover:border-primary/50 cursor-pointer transition-colors relative group"
                                    >
                                        <div className="font-semibold text-foreground mb-1">#{job.id} - {job.customerName}</div>
                                        <div className="text-muted-foreground line-clamp-2 mb-2">{job.description}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                                {job.status}
                                            </span>
                                            <button 
                                                className="opacity-0 group-hover:opacity-100 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/job/${job.id}`);
                                                }}
                                            >
                                                Start
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
 )}
 </>
 )}
 </div>
 );
};
