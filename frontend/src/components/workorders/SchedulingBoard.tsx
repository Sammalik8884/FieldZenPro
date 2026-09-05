import React, { useState } from 'react';
import { WorkOrderDto } from '../../types/field';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getNYDate } from '../../utils/dateUtils';

interface SchedulingBoardProps {
    workOrders: WorkOrderDto[];
    onUpdateJob: (id: number, updates: { scheduledDate?: string | null; clearScheduledDate?: boolean; status?: string; sequenceOrder?: number }) => Promise<void>;
}

export const SchedulingBoard: React.FC<SchedulingBoardProps> = ({ workOrders, onUpdateJob }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(getNYDate(), { weekStartsOn: 1 }));
    const [loading, setLoading] = useState(false);
    const [expandedAddresses, setExpandedAddresses] = useState<Record<number, boolean>>({});


    const toggleAddress = (id: number) => {
        setExpandedAddresses(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Unscheduled: null date OR Unscheduled status
    const unscheduledJobs = workOrders
        .filter(wo => !wo.scheduledDate || wo.status === 'Unscheduled')
        .sort((a, b) => a.id - b.id); // Oldest first (by ID)

    const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
    const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
    const currentWeek = () => setCurrentWeekStart(startOfWeek(getNYDate(), { weekStartsOn: 1 }));

    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

    const handleAssignToDate = async (jobId: number, dateStr: string) => {
        setLoading(true);
        try {
            // Find max sequence order for the target date
            const targetDateJobs = workOrders.filter(w => w.scheduledDate && w.scheduledDate.substring(0, 10) === dateStr);
            const maxOrder = targetDateJobs.length > 0 ? Math.max(...targetDateJobs.map(j => j.sequenceOrder || 0)) : 0;
            
            const job = workOrders.find(w => w.id === jobId);
            let newStatus = job?.status;
            if (newStatus === 'Unscheduled') {
                newStatus = job?.technicianId ? 'Assigned' : 'Created';
            }

            await onUpdateJob(jobId, { 
                scheduledDate: dateStr + "T00:00:00", 
                ...(newStatus && newStatus !== job?.status ? { status: newStatus } : {}),
                sequenceOrder: maxOrder + 1 
            });
            toast.success("Job scheduled.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnschedule = async (jobId: number) => {
        setLoading(true);
        try {
            const job = workOrders.find(w => w.id === jobId);
            let newStatus = job?.status;
            if (newStatus !== 'WaitingForParts') {
                newStatus = 'Unscheduled';
            }
            await onUpdateJob(jobId, { 
                clearScheduledDate: true,
                ...(newStatus && newStatus !== job?.status ? { status: newStatus } : {}),
                sequenceOrder: 0 
            });
            toast.success("Job unscheduled.");
        } finally {
            setLoading(false);
        }
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

            let targetOrder = targetJob.sequenceOrder || 0;
            let currentOrderVal = currentOrder || 0;

            if (targetOrder === currentOrderVal) {
                const newOrder = direction === 'up' ? targetOrder - 1 : targetOrder + 1;
                await onUpdateJob(jobId, { sequenceOrder: newOrder });
            } else {
                await onUpdateJob(jobId, { sequenceOrder: targetOrder });
                await onUpdateJob(targetJob.id, { sequenceOrder: currentOrderVal });
            }
        } finally {
            setLoading(false);
        }
    };

    const [expandedNotes, setExpandedNotes] = useState<number[]>([]);

    const toggleNotes = (id: number) => {
        setExpandedNotes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[75vh]">
            {/* Unscheduled Queue */}
            <div className="w-full lg:w-1/4 bg-muted/30 border border-border rounded-xl flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-border bg-card">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                        Unscheduled Queue <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{unscheduledJobs.length}</span>
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
                                 {job.status === 'WaitingForParts' && (
                                     <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20">Parts</span>
                                 )}
                                 {job.status === 'PendingQuote' && (
                                     <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">Quote</span>
                                 )}
                             </div>
                            <p className="text-sm font-medium leading-tight mb-1">{job.customerName}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                            
                            {job.technicianNotes && (
                                <div className="mb-3">
                                    <button 
                                        onClick={() => toggleNotes(job.id)}
                                        className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1"
                                    >
                                        {expandedNotes.includes(job.id) ? "Hide Notes" : "View Technician Notes"}
                                    </button>
                                    {expandedNotes.includes(job.id) && (
                                        <div className="mt-1 p-2 bg-muted/50 rounded border border-border text-xs whitespace-pre-wrap text-foreground">
                                            {job.technicianNotes}
                                        </div>
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
            <div className="w-full lg:w-3/4 flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
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
                        
                        const isToday = isSameDay(day, getNYDate());

                        return (
                            <div key={day.toISOString()} className={`flex-1 min-w-[200px] flex flex-col ${isToday ? 'bg-primary/5' : ''}`}>
                                <div className={`p-2 text-center border-b border-border ${isToday ? 'bg-primary/10 text-primary font-bold' : 'bg-muted text-muted-foreground font-medium'}`}>
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
                                            <p className="font-semibold text-xs truncate" title={job.customerName}>{job.customerName}</p>
                                            <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5" title={job.description}>{job.description}</p>
                                            <p 
                                                className={`text-[10px] text-muted-foreground cursor-pointer mt-0.5 ${expandedAddresses[job.id] ? '' : 'truncate'}`} 
                                                title={job.customerAddress || job.siteName}
                                                onClick={() => toggleAddress(job.id)}
                                            >
                                                {job.customerAddress || job.siteName}
                                            </p>
                                            {job.customerPhone && (
                                                <p className="text-[10px] text-primary truncate">📞 {job.customerPhone}</p>
                                            )}
                                            {job.customerAltPhone && (
                                                <p className="text-[10px] text-primary truncate">📞 {job.customerAltPhone}</p>
                                            )}
                                            {job.status === 'WaitingForParts' && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 mt-1 inline-block">Parts</span>
                                            )}
                                            {job.status === 'PendingQuote' && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20 mt-1 inline-block">Quote</span>
                                            )}

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
    );
};

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
