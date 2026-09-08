import React, { useState, useRef, useEffect } from 'react';
import { WorkOrderDto } from '../../types/field';
import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getNYDate } from '../../utils/dateUtils';

interface SchedulingBoardProps {
    workOrders: WorkOrderDto[];
    onUpdateJob: (id: number, updates: { scheduledDate?: string | null; clearScheduledDate?: boolean; status?: string; sequenceOrder?: number }) => Promise<void>;
}

const woStatusIcon = (status: string) => {
    switch (status) {
        case 'Completed': return '✅';
        case 'InProgress': return '🔨';
        case 'PendingApproval': return '⏳';
        case 'Unscheduled': return '📅';
        case 'WaitingForParts': return '📦';
        case 'PendingQuote': return '📝';
        default: return '🔹';
    }
};

export const SchedulingBoard: React.FC<SchedulingBoardProps> = ({ workOrders, onUpdateJob }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(getNYDate(), { weekStartsOn: 1 }));
    const [loading, setLoading] = useState(false);
    const [expandedAddresses, setExpandedAddresses] = useState<Record<number, boolean>>({});
    const [expandedNotes, setExpandedNotes] = useState<number[]>([]);
    const [selectedDay, setSelectedDay] = useState<Date>(getNYDate());
    const [queueOpen, setQueueOpen] = useState(true);
    const dayStripRef = useRef<HTMLDivElement>(null);

    const toggleAddress = (id: number) => setExpandedAddresses(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleNotes = (id: number) => setExpandedNotes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    // Scroll selected day chip into view
    useEffect(() => {
        if (dayStripRef.current) {
            const el = dayStripRef.current.querySelector('[data-selected="true"]');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [selectedDay]);

    const unscheduledJobs = workOrders
        .filter(wo => !wo.scheduledDate || wo.status === 'Unscheduled')
        .sort((a, b) => {
            const aPriority = (a.status !== 'Unscheduled' && a.status !== 'Created') ? 1 : 0;
            const bPriority = (b.status !== 'Unscheduled' && b.status !== 'Created') ? 1 : 0;
            if (aPriority !== bPriority) return bPriority - aPriority;
            return a.id - b.id;
        });

    const nextWeek = () => { const n = addDays(currentWeekStart, 7); setCurrentWeekStart(n); setSelectedDay(n); };
    const prevWeek = () => { const p = addDays(currentWeekStart, -7); setCurrentWeekStart(p); setSelectedDay(p); };
    const currentWeek = () => { const t = startOfWeek(getNYDate(), { weekStartsOn: 1 }); setCurrentWeekStart(t); setSelectedDay(getNYDate()); };

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

    const handleAssignToDate = async (jobId: number, dateStr: string) => {
        setLoading(true);
        try {
            const targetDateJobs = workOrders.filter(w => w.scheduledDate && w.scheduledDate.substring(0, 10) === dateStr);
            const maxOrder = targetDateJobs.length > 0 ? Math.max(...targetDateJobs.map(j => j.sequenceOrder || 0)) : 0;
            const job = workOrders.find(w => w.id === jobId);
            let newStatus = job?.status;
            if (newStatus === 'Unscheduled') newStatus = job?.technicianId ? 'Assigned' : 'Created';
            await onUpdateJob(jobId, {
                scheduledDate: dateStr + "T00:00:00",
                ...(newStatus && newStatus !== job?.status ? { status: newStatus } : {}),
                sequenceOrder: maxOrder + 1
            });
            toast.success("Job scheduled.");
        } finally { setLoading(false); }
    };

    const handleUnschedule = async (jobId: number) => {
        setLoading(true);
        try {
            const job = workOrders.find(w => w.id === jobId);
            let newStatus = job?.status;
            if (newStatus !== 'WaitingForParts') newStatus = 'Unscheduled';
            await onUpdateJob(jobId, {
                clearScheduledDate: true,
                ...(newStatus && newStatus !== job?.status ? { status: newStatus } : {}),
                sequenceOrder: 0
            });
            toast.success("Job unscheduled.");
        } finally { setLoading(false); }
    };

    const handleMoveOrder = async (jobId: number, dateStr: string, currentOrder: number, direction: 'up' | 'down') => {
        const dayJobs = workOrders
            .filter(w => w.scheduledDate && w.scheduledDate.substring(0, 10) === dateStr)
            .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
        const currentIndex = dayJobs.findIndex(j => j.id === jobId);
        if (currentIndex === -1) return;
        if (direction === 'up' && currentIndex === 0) return;
        if (direction === 'down' && currentIndex === dayJobs.length - 1) return;
        setLoading(true);
        try {
            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            const targetJob = dayJobs[targetIndex];
            const targetOrder = targetJob.sequenceOrder || 0;
            const currentOrderVal = currentOrder || 0;
            if (targetOrder === currentOrderVal) {
                await onUpdateJob(jobId, { sequenceOrder: direction === 'up' ? targetOrder - 1 : targetOrder + 1 });
            } else {
                await onUpdateJob(jobId, { sequenceOrder: targetOrder });
                await onUpdateJob(targetJob.id, { sequenceOrder: currentOrderVal });
            }
        } finally { setLoading(false); }
    };

    // Job card used in both mobile and desktop
    const JobCard = ({ job, idx, dateStr, showMoveButtons = true }: { job: WorkOrderDto; idx: number; dateStr: string; showMoveButtons?: boolean }) => {
        const dayJobs = workOrders
            .filter(w => w.scheduledDate && w.scheduledDate.substring(0, 10) === dateStr)
            .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
        return (
            <div className="bg-background border border-border rounded-xl p-3 shadow-sm relative group">
                <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded">#{idx + 1}</span>
                        <span className="text-[10px] font-bold text-primary">WO-{job.id.toString().padStart(4, '0')}</span>
                    </div>
                    <button
                        onClick={() => handleUnschedule(job.id)}
                        disabled={loading}
                        className="text-[10px] font-medium text-muted-foreground hover:text-destructive transition-colors px-1.5 py-0.5 rounded hover:bg-destructive/10 min-h-[28px]"
                    >
                        Remove
                    </button>
                </div>
                <p className="font-semibold text-xs text-foreground truncate">{job.customerName}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{job.description}</p>
                <p
                    className={`text-[10px] text-muted-foreground cursor-pointer mt-0.5 ${expandedAddresses[job.id] ? '' : 'truncate'}`}
                    onClick={() => toggleAddress(job.id)}
                >
                    {job.customerAddress || job.siteName}
                </p>
                {job.customerPhone && <p className="text-[10px] text-primary truncate mt-0.5">📞 {job.customerPhone}</p>}
                {job.customerAltPhone && <p className="text-[10px] text-primary truncate">📞 {job.customerAltPhone}</p>}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {job.status === 'WaitingForParts' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">Parts</span>}
                    {job.status === 'PendingQuote' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">Quote</span>}
                    <span className="text-[10px] text-muted-foreground">{woStatusIcon(job.status)} {job.status}</span>
                </div>
                {showMoveButtons && (
                    <div className="flex gap-1 mt-2 border-t border-border/50 pt-2">
                        <button
                            disabled={idx === 0 || loading}
                            onClick={() => handleMoveOrder(job.id, dateStr, job.sequenceOrder, 'up')}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border hover:bg-muted text-xs text-muted-foreground disabled:opacity-30 min-h-[32px]"
                        >
                            <ArrowUp className="h-3 w-3" /> Up
                        </button>
                        <button
                            disabled={idx === dayJobs.length - 1 || loading}
                            onClick={() => handleMoveOrder(job.id, dateStr, job.sequenceOrder, 'down')}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-border hover:bg-muted text-xs text-muted-foreground disabled:opacity-30 min-h-[32px]"
                        >
                            <ArrowDown className="h-3 w-3" /> Down
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const selectedDateStr = format(selectedDay, 'yyyy-MM-dd');
    const selectedDayJobs = workOrders
        .filter(w => w.scheduledDate && w.scheduledDate.substring(0, 10) === selectedDateStr)
        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

    return (
        <>
            {/* ── MOBILE LAYOUT (hidden on lg+) ── */}
            <div className="block lg:hidden space-y-4">

                {/* Week Nav */}
                <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3">
                    <button onClick={prevWeek} className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="text-center">
                        <p className="text-sm font-semibold">{format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}</p>
                        <button onClick={currentWeek} className="text-xs text-primary font-medium hover:underline mt-0.5">Today</button>
                    </div>
                    <button onClick={nextWeek} className="p-2 rounded-xl hover:bg-muted active:scale-90 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Day Strip */}
                <div ref={dayStripRef} className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-1 px-1">
                    {weekDays.map((day, i) => {
                        const dStr = format(day, 'yyyy-MM-dd');
                        const count = workOrders.filter(w => w.scheduledDate && w.scheduledDate.substring(0, 10) === dStr).length;
                        const sel = isSameDay(day, selectedDay);
                        const tod = isToday(day);
                        return (
                            <button
                                key={i}
                                data-selected={sel}
                                onClick={() => setSelectedDay(day)}
                                className={`flex-shrink-0 flex flex-col items-center rounded-2xl py-3 px-3 min-w-[60px] snap-center transition-all active:scale-95 border ${
                                    sel ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                                    : tod ? 'bg-primary/10 text-primary border-primary/30'
                                    : 'bg-card text-foreground border-border hover:bg-muted'
                                }`}
                            >
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${sel ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    {format(day, 'EEE')}
                                </span>
                                <span className="text-xl font-bold mt-0.5">{format(day, 'd')}</span>
                                {count > 0 && (
                                    <div className="mt-1.5 flex gap-0.5 flex-wrap justify-center">
                                        {Array.from({ length: Math.min(count, 3) }).map((_, idx) => (
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
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            {format(selectedDay, 'EEEE, MMM d')}
                        </h3>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            {selectedDayJobs.length} job{selectedDayJobs.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {selectedDayJobs.length === 0 ? (
                        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
                            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p className="font-medium text-sm">No jobs scheduled</p>
                            <p className="text-xs mt-1">Assign from the queue below.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDayJobs.map((job, idx) => (
                                <JobCard key={job.id} job={job} idx={idx} dateStr={selectedDateStr} showMoveButtons={true} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Unscheduled Queue — collapsible */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <button
                        onClick={() => setQueueOpen(o => !o)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                            Unscheduled Queue
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{unscheduledJobs.length}</span>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${queueOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {queueOpen && (
                        <div className="border-t border-border divide-y divide-border/50">
                            {unscheduledJobs.length === 0 ? (
                                <p className="p-6 text-sm text-muted-foreground text-center">All jobs are scheduled! 🎉</p>
                            ) : (
                                unscheduledJobs.map(job => (
                                    <div key={job.id} className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className="text-xs font-bold text-primary">WO-{job.id.toString().padStart(4, '0')}</span>
                                                <p className="text-sm font-semibold text-foreground mt-0.5">{job.customerName}</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{job.description}</p>
                                            </div>
                                            <div className="flex flex-col gap-1 ml-2 shrink-0">
                                                {job.status === 'WaitingForParts' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">Parts</span>}
                                                {job.status === 'PendingQuote' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">Quote</span>}
                                            </div>
                                        </div>
                                        {job.technicianNotes && (
                                            <div className="mb-2">
                                                <button onClick={() => toggleNotes(job.id)} className="text-[10px] font-semibold text-primary hover:underline">
                                                    {expandedNotes.includes(job.id) ? "Hide Notes" : "View Tech Notes"}
                                                </button>
                                                {expandedNotes.includes(job.id) && (
                                                    <div className="mt-1 p-2 bg-muted/50 rounded border border-border text-xs whitespace-pre-wrap">{job.technicianNotes}</div>
                                                )}
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Assign to date:</label>
                                            <input
                                                type="date"
                                                disabled={loading}
                                                min={format(getNYDate(), 'yyyy-MM-dd')}
                                                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleAssignToDate(job.id, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── DESKTOP LAYOUT (hidden on mobile, shown lg+) ── */}
            <div className="hidden lg:flex gap-6 h-[75vh]">
                {/* Unscheduled Queue */}
                <div className="w-1/4 bg-muted/30 border border-border rounded-xl flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-border bg-card">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            Unscheduled Queue
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{unscheduledJobs.length}</span>
                        </h3>
                    </div>
                    <div className="p-3 overflow-y-auto flex-1 space-y-3">
                        {unscheduledJobs.length === 0 && (
                            <div className="text-sm text-muted-foreground text-center mt-10">No unscheduled jobs.</div>
                        )}
                        {unscheduledJobs.map(job => (
                            <div key={job.id} className="bg-card border border-border p-3 rounded-lg shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-primary">WO-{job.id.toString().padStart(4, '0')}</span>
                                    <div className="flex gap-1">
                                        {job.status === 'WaitingForParts' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">Parts</span>}
                                        {job.status === 'PendingQuote' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">Quote</span>}
                                    </div>
                                </div>
                                <p className="text-sm font-medium leading-tight mb-1">{job.customerName}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                                {job.technicianNotes && (
                                    <div className="mb-3">
                                        <button onClick={() => toggleNotes(job.id)} className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1">
                                            {expandedNotes.includes(job.id) ? "Hide Notes" : "View Technician Notes"}
                                        </button>
                                        {expandedNotes.includes(job.id) && (
                                            <div className="mt-1 p-2 bg-muted/50 rounded border border-border text-xs whitespace-pre-wrap">{job.technicianNotes}</div>
                                        )}
                                    </div>
                                )}
                                <div className="mt-2 pt-2 border-t border-border">
                                    <label className="text-xs text-muted-foreground mb-1 block">Assign to Date:</label>
                                    <input
                                        type="date"
                                        disabled={loading}
                                        min={format(getNYDate(), 'yyyy-MM-dd')}
                                        className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary disabled:opacity-50"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleAssignToDate(job.id, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Schedule */}
                <div className="w-3/4 flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Weekly Schedule</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">
                                {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={prevWeek} className="p-1.5 hover:bg-muted rounded border border-transparent hover:border-border"><ChevronLeft className="h-4 w-4" /></button>
                                <button onClick={currentWeek} className="px-3 py-1 text-xs hover:bg-muted rounded border border-transparent hover:border-border font-medium">Today</button>
                                <button onClick={nextWeek} className="p-1.5 hover:bg-muted rounded border border-transparent hover:border-border"><ChevronRight className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-1 overflow-x-auto divide-x divide-border">
                        {weekDays.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const dayJobs = workOrders
                                .filter(w => w.scheduledDate && w.scheduledDate.substring(0, 10) === dateStr)
                                .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
                            const todayDay = isSameDay(day, getNYDate());
                            return (
                                <div key={day.toISOString()} className={`flex-1 min-w-[200px] flex flex-col ${todayDay ? 'bg-primary/5' : ''}`}>
                                    <div className={`p-2 text-center border-b border-border ${todayDay ? 'bg-primary/10 text-primary font-bold' : 'bg-muted text-muted-foreground font-medium'}`}>
                                        <div className="text-xs uppercase">{format(day, 'EEE')}</div>
                                        <div className="text-lg">{format(day, 'd')}</div>
                                    </div>
                                    <div className="p-2 flex-1 overflow-y-auto space-y-2">
                                        {dayJobs.map((job, idx) => (
                                            <div key={job.id} className="bg-background border border-border p-2 rounded shadow-sm text-sm relative group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 rounded">#{idx + 1}</span>
                                                    <button onClick={() => handleUnschedule(job.id)} title="Return to Queue" disabled={loading} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] uppercase">Remove</span>
                                                    </button>
                                                </div>
                                                <p className="font-semibold text-xs truncate">{job.customerName}</p>
                                                <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{job.description}</p>
                                                <p className={`text-[10px] text-muted-foreground cursor-pointer mt-0.5 ${expandedAddresses[job.id] ? '' : 'truncate'}`} onClick={() => toggleAddress(job.id)}>
                                                    {job.customerAddress || job.siteName}
                                                </p>
                                                {job.customerPhone && <p className="text-[10px] text-primary truncate">📞 {job.customerPhone}</p>}
                                                {job.customerAltPhone && <p className="text-[10px] text-primary truncate">📞 {job.customerAltPhone}</p>}
                                                {job.status === 'WaitingForParts' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 mt-1 inline-block">Parts</span>}
                                                {job.status === 'PendingQuote' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 mt-1 inline-block">Quote</span>}
                                                <p className="text-[10px] text-muted-foreground truncate mt-1">{woStatusIcon(job.status)} {job.status}</p>
                                                <div className="absolute top-1/2 -translate-y-1/2 -right-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {idx > 0 && (
                                                        <button onClick={() => handleMoveOrder(job.id, dateStr, job.sequenceOrder, 'up')} className="bg-background border border-border rounded-full p-0.5 hover:bg-muted shadow-sm">
                                                            <ArrowUp className="h-3 w-3 text-muted-foreground" />
                                                        </button>
                                                    )}
                                                    {idx < dayJobs.length - 1 && (
                                                        <button onClick={() => handleMoveOrder(job.id, dateStr, job.sequenceOrder, 'down')} className="bg-background border border-border rounded-full p-0.5 hover:bg-muted shadow-sm">
                                                            <ArrowDown className="h-3 w-3 text-muted-foreground" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};
