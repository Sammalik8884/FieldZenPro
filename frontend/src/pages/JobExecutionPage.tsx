import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CalendarClock, Clock, CheckCircle2, Loader2, Navigation, UploadCloud, ClipboardCheck, Satellite, Unlock, Receipt } from "lucide-react";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { workOrderService } from "../services/workOrderService";

const extractApiError = (error: any, fallback: string) => {
 if (!error || !error.response || !error.response.data) {
 return error?.message || fallback;
 }
 const d = error.response.data;
 if (typeof d === 'string') return d;
 return d.error || d.Error || d.message || d.Message || d.detail || d.title || fallback;
};
import { timeTrackingService } from "../services/timeTrackingService";
import { WorkOrderDto, ChecklistResultDto, UpdateChecklistDto } from "../types/field";
import { toast } from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { PlanFeature } from "../types/auth";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
import { invoiceService } from "../services/invoiceService";

export const JobExecutionPage = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { hasFeature } = useAuth();
 const [job, setJob] = useState<WorkOrderDto | null>(null);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);

 // Checklist & Evidence State
 const [checklists, setChecklists] = useState<ChecklistResultDto[]>([]);
 const [checklistAnswers, setChecklistAnswers] = useState<Record<number, string>>({});
    const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

 // GPS / Location State
 const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
 const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'ok' | 'error'>('acquiring');
 const watchIdRef = useRef<number | null>(null);

 // Completion Form State
 const [notes, setNotes] = useState("");
 const [result, setResult] = useState(1); // 1=Pass

  // Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceModalProps, setInvoiceModalProps] = useState<{workOrderId?: number, customerId?: number, laborCost?: number}>({});
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, type: 'info' | 'warning' | 'danger', onConfirm: () => void}>({
 isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {}
 });

 const confirmAction = (title: string, message: string, type: 'info' | 'warning' | 'danger', action: () => Promise<void>) => {
 setConfirmModal({
 isOpen: true, title, message, type,
 onConfirm: async () => {
 setConfirmModal(prev => ({ ...prev, isOpen: false }));
 await action();
 }
 });
 };

     const handleWaitingForParts = async () => {
         try {
             setActionLoading(true);
             await workOrderService.markWaitingForParts(Number(id), notes);
             toast.success("Job marked as Waiting for Parts. It has been unscheduled.");
             fetchJob();
         } catch (error: any) {
             toast.error(extractApiError(error, "Failed to update job."));
         } finally {
             setActionLoading(false);
         }
     };

 const fetchJob = async () => {
 try {
 setLoading(true);
 const data = await workOrderService.getById(Number(id));
 setJob(data);
 setNotes(data.technicianNotes || "");

 // Only fetch checklist if user has the Pro feature
 if (hasFeature(PlanFeature.ChecklistFormBuilder)) {
 try {
 const checklistData = await workOrderService.getChecklist(Number(id));
 setChecklists(checklistData);
 const initialAnswers: Record<number, string> = {};
 checklistData.forEach(c => {
 if (c.selectedValue) initialAnswers[c.id] = c.selectedValue;
 });
 setChecklistAnswers(initialAnswers);
 } catch {
 // Silently ignore checklist load failures for technicians
 }
 }
 } catch (error) {
 toast.error("Failed to load job details.");
 navigate('/my-jobs');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 if (id) fetchJob();
 }, [id]);

 // Auto-acquire GPS on mount, keep watching for updates
 useEffect(() => {
 if (!navigator.geolocation) {
 setGpsStatus('error');
 return;
 }
 setGpsStatus('acquiring');
 watchIdRef.current = navigator.geolocation.watchPosition(
 (pos) => {
 setCurrentLocation({
 lat: pos.coords.latitude,
 lng: pos.coords.longitude,
 accuracy: Math.round(pos.coords.accuracy)
 });
 setGpsStatus('ok');
 },
 () => setGpsStatus('error'),
 { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
 );
 return () => {
 if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
 };
 }, []);

    const handleCheckIn = async () => {
        setActionLoading(true);
        try {
            const loc = currentLocation;
            if (!loc) {
                toast.error("GPS location not yet acquired. Please wait a moment and try again.");
                setActionLoading(false);
                return;
            }
            await timeTrackingService.checkIn({
                workOrderId: Number(id),
                latitude: loc.lat,
                longitude: loc.lng
            });
            toast.success(`Checked in successfully at ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`);
            await fetchJob();
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || "Failed to check in.");
        } finally {
            setActionLoading(false);
        }
    };

 const handleCheckOut = async () => {
 setActionLoading(true);
 try {
 const loc = currentLocation;
 if (!loc) {
 toast.error("GPS location not yet acquired. Please wait a moment and try again.");
 setActionLoading(false);
 return;
 }
 await timeTrackingService.checkOut({
 workOrderId: Number(id),
 latitude: loc.lat,
 longitude: loc.lng
 });
 toast.success(`Checked out at ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`);
 } catch (error: any) {
 toast.error(error.response?.data?.message || error.message || "Failed to check out.");
 } finally {
 setActionLoading(false);
 }
 };

 const handleComplete = async (e: React.FormEvent) => {
 e.preventDefault();
 confirmAction(
 "Complete Job",
 "Are you sure you want to complete this job? You cannot edit it afterwards.",
 "warning",
 async () => {
 setActionLoading(true);
 try {
 // 1. Submit Checklist if there are any
 if (checklists.length > 0) {
 const answers: UpdateChecklistDto[] = checklists.map(c => ({
 resultId: c.id,
 selectedValue: checklistAnswers[c.id] || "",
 comments: null
 }));
 await workOrderService.submitChecklist(Number(id), answers);
 }

            // 2. Upload Evidence if selected
            if (evidenceFiles.length > 0) {
                for (const file of evidenceFiles) {
                    const formData = new FormData();
                    formData.append('File', file);
                    if (currentLocation) {
                        formData.append('Latitude', currentLocation.lat.toString());
                        formData.append('Longitude', currentLocation.lng.toString());
                    }
                    await workOrderService.uploadEvidence(Number(id), formData);
                }
            }

 // 3. Complete Job
 await workOrderService.completeJob(Number(id), { notes, result });
 toast.success("Job completed! You can now generate an invoice.");
 fetchJob();
 } catch (error: any) {
 toast.error(extractApiError(error, "Failed to complete job. Ensure photos are uploaded."));
 } finally {
 setActionLoading(false);
 }
 }
 );
 };

     const handleGenerateInvoice = async () => {
         try {
             setActionLoading(true);
             const preview = await invoiceService.getPreviewFromJob(Number(id));
             setInvoiceModalProps({ workOrderId: Number(id), customerId: preview.customerId, laborCost: preview.laborCost });
             setInvoiceModalOpen(true);
         } catch (error: any) {
             toast.error(extractApiError(error, "Failed to prepare invoice."));
         } finally {
             setActionLoading(false);
         }
     };

    const handleReopen = async () => {
        confirmAction(
            "Re-open Job",
            "This will revert the job status to In Progress. Continue?",
            "info",
            async () => {
                setActionLoading(true);
                try {
                    await workOrderService.reopen(Number(id));
                    toast.success("Job re-opened successfully.");
                    fetchJob();
                } catch (error: any) {
                    toast.error(extractApiError(error, "Failed to re-open job."));
                } finally {
                    setActionLoading(false);
                }
            }
        );
    };

 if (loading) {
 return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
 }

 if (!job) return null;

 const isJobActive = !['Completed', 'PendingApproval', 'Approved'].includes(job.status);

 return (
 <div className="p-4 md:p-8 max-w-3xl mx-auto animate-in fade-in duration-500 pb-24">
 {/* Header */}
 <div className="flex items-center space-x-3 mb-6">
 <button
 onClick={() => navigate('/my-jobs')}
 className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
 >
 <ArrowLeft className="h-5 w-5" />
 </button>
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
 WO-{job.id.toString().padStart(4, '0')}
 </span>
 <span className="text-xs font-medium text-muted-foreground border border-border px-2 py-0.5 rounded">
 {job.status}
 </span>
 </div>
 </div>
 </div>

 <div className="space-y-6">
 {/* Details Card */}
 <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-lg">
 <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Job Description & Scope</h2>
 <h1 className="text-xl md:text-2xl font-bold text-foreground mb-4 leading-snug whitespace-pre-wrap">
 {job.description}
 </h1>

 <div className="space-y-4">
 <div className="flex items-start gap-3">
 <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
 <div>
 <p className="text-sm font-medium text-foreground">{job.customerName}</p>
 <p className="text-sm text-muted-foreground">{job.siteName}</p>
 {/* Launch external maps - assuming siteName can be queried */}
 <a
 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.siteName + ' ' + job.customerName)}`}
 target="_blank" rel="noopener noreferrer"
 className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1 hover:underline"
 >
 <Navigation className="h-3 w-3" /> Get Directions
 </a>
 </div>
 </div>

 <div className="flex items-start gap-3">
 <CalendarClock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
 <div>
  <p className="text-sm font-medium text-foreground">Scheduled For</p>
  <p className="text-sm text-muted-foreground">{job.scheduledDate ? new Date(job.scheduledDate).toLocaleString() : 'Unscheduled'}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Actions (Only if active) */}
 {isJobActive && (
 <div className="space-y-3">
 {/* Live GPS Status Bar */}
 <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium ${gpsStatus === 'ok' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
 gpsStatus === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
 }`}>
 {gpsStatus === 'acquiring' && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
 {gpsStatus === 'ok' && <Satellite className="h-4 w-4 shrink-0" />}
 {gpsStatus === 'error' && <MapPin className="h-4 w-4 shrink-0" />}
 <div className="flex flex-col min-w-0">
 {gpsStatus === 'acquiring' && <span>Acquiring GPS location...</span>}
 {gpsStatus === 'error' && <span>GPS unavailable — enable location permissions</span>}
 {gpsStatus === 'ok' && currentLocation && (
 <>
 <span>📍 {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</span>
 <span className="text-xs opacity-70">Accuracy: ±{currentLocation.accuracy}m</span>
 </>
 )}
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {!job.checkInTime && (
 <button
 onClick={handleCheckIn}
 disabled={actionLoading || gpsStatus === 'error' || gpsStatus === 'acquiring'}
 className="col-span-1 sm:col-span-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-white font-semibold py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary"
 >
 <MapPin className="h-6 w-6" />
 <span>{gpsStatus === 'acquiring' ? 'Acquiring GPS...' : 'Start Timer (Optional)'}</span>
 </button>
 )}

 {job.checkInTime && (
 <div className="bg-muted border border-border rounded-xl p-4 flex flex-col justify-center">
 <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Check In Time</span>
 <div className="flex items-center gap-2 text-foreground font-medium text-lg">
 <Clock className="h-5 w-5 text-primary" />
 {new Date(job.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>
 )}

 {job.checkInTime && !job.checkOutTime && (
 <button
 onClick={handleCheckOut}
 disabled={actionLoading}
 className="bg-muted border border-border hover:border-destructive hover:bg-destructive/5 text-destructive 
 font-semibold py-4 rounded-xl transition-all flex flex-col items-center justify-center gap-2 
 disabled:opacity-50 shadow-sm active:scale-95"
 >
 <Clock className="h-6 w-6" />
 <span>Stop Timer</span>
 </button>
 )}

 {job.checkOutTime && (
 <div className="bg-muted border border-border rounded-xl p-4 flex flex-col justify-center">
 <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Check Out Time</span>
 <div className="flex items-center gap-2 text-foreground font-medium text-lg">
 <Clock className="h-5 w-5 text-destructive" />
 {new Date(job.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Execution Forms Container */}
 <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-lg space-y-8">

 {/* Checklist Section */}
 {checklists.length > 0 && (
 <div>
 <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
 <ClipboardCheck className="h-5 w-5 text-primary" />
 Required Checklist
 </h3>
 <div className="space-y-4">
 {checklists.map(item => (
 <div key={item.id} className="bg-background/50 border border-border rounded-xl p-4 shadow-sm">
 <label className="text-sm font-medium text-foreground mb-2 block">{item.questionText}</label>

 {item.inputType === 'Boolean' && (
 <div className="flex space-x-4 mt-2">
 <label className="flex items-center space-x-2 cursor-pointer">
 <input
 type="radio"
 name={`checklist-${item.id}`}
 value="Yes"
 checked={checklistAnswers[item.id] === "Yes"}
 onChange={(e) => setChecklistAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
 className="text-primary focus:ring-primary"
 disabled={!isJobActive}
 />
 <span className="text-sm">Yes / Pass</span>
 </label>
 <label className="flex items-center space-x-2 cursor-pointer">
 <input
 type="radio"
 name={`checklist-${item.id}`}
 value="No"
 checked={checklistAnswers[item.id] === "No"}
 onChange={(e) => setChecklistAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
 className="text-primary focus:ring-primary"
 disabled={!isJobActive}
 />
 <span className="text-sm">No / Fail</span>
 </label>
 </div>
 )}

 {item.inputType === 'Text' && (
 <input
 type="text"
 value={checklistAnswers[item.id] || ""}
 onChange={(e) => setChecklistAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
 className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
 placeholder="Enter reading or value..."
 disabled={!isJobActive}
 />
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Evidence / Photos */}
 <div>
 <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
 <UploadCloud className="h-5 w-5 text-primary" />
 Job Evidence / Photos
 </h3>
 {isJobActive ? (
 <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted transition-colors">
 <input
 type="file"
 accept="image/*"
 id="evidence-upload"
 multiple
 className="hidden"
 onChange={(e) => {
 if (e.target.files && e.target.files.length > 0) {
 setEvidenceFiles(Array.from(e.target.files));
 }
 }}
 />
 <label htmlFor="evidence-upload" className="cursor-pointer flex flex-col items-center justify-center">
 <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
 <span className="text-sm font-medium text-primary">Click to take photos or upload</span>
 <span className="text-xs text-muted-foreground mt-1">JPEG, PNG, HEIC up to 10MB</span>
 </label>
 {evidenceFiles.length > 0 && (
 <div className="mt-4 space-y-2">
 {evidenceFiles.map((file, i) => (
 <div key={i} className="p-2 bg-primary/10 border border-primary/20 text-primary text-sm rounded-lg flex justify-between items-center">
 <span className="truncate max-w-[200px]">{file.name}</span>
 <button type="button" onClick={() => setEvidenceFiles(prev => prev.filter((_, index) => index !== i))} className="text-xs hover:underline">Remove</button>
 </div>
 ))}
 </div>
 )}
 </div>
 ) : (
 <div className="text-sm text-muted-foreground">Photos cannot be uploaded for completed jobs.</div>
 )}
 </div>

 {/* Completion Form */}
 <div>
 <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Job Sign-Off</h3>

 {isJobActive ? (
 <form onSubmit={handleComplete} className="space-y-4">
 <div>
 <label className="text-sm font-medium text-muted-foreground mb-1 block">Work Performed / Notes *</label>
 <textarea
 required
 rows={4}
 value={notes}
 onChange={e => setNotes(e.target.value)}
 placeholder="Detail the work carried out, parts used, or issues found..."
 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none shadow-inner"
 />
 </div>

 <div>
 <label className="text-sm font-medium text-muted-foreground mb-1 block">Result</label>
 <select
 value={result}
 onChange={e => setResult(Number(e.target.value))}
 className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-inner"
 >
 <option value={1}>✅ Pass — Job Completed</option>
 <option value={2}>❌ Fail — Failed Inspection</option>
 <option value={3}>🔧 Repairs Needed</option>
 <option value={4}>➖ Not Applicable</option>
 </select>
 </div>

 <div className="flex gap-2">
      <button
      type="button"
      onClick={handleWaitingForParts}
      disabled={actionLoading || !notes}
      className="flex-1 bg-orange-500/10 text-orange-500 border border-orange-500/20 font-semibold py-3.5 flex items-center justify-center gap-2 rounded-xl hover:bg-orange-500/20 transition-all shadow-sm disabled:opacity-50"
      >
      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Clock className="h-5 w-5" />}
      <span>Waiting for Parts</span>
      </button>

      <button
      type="submit"
      disabled={actionLoading || !notes}
      className="flex-1 bg-primary text-primary-foreground font-semibold py-3.5 flex items-center justify-center gap-2 rounded-xl hover:-translate-y-0.5 transition-all shadow-sm disabled:opacity-50 disabled:hover:translate-y-0"
      >
      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
      <span>Complete Job</span>
      </button>
  </div>
 </form>
 ) : (
 <div className="space-y-4 text-sm bg-background/50 p-4 rounded-xl border border-border">
 <div>
 <span className="font-semibold text-muted-foreground block mb-1">Result:</span>
 <span className="font-medium">{job.result || "-"}</span>
 </div>
 <div>
 <span className="font-semibold text-muted-foreground block mb-1">Technician Notes:</span>
 <span>{job.technicianNotes || "No notes provided."}</span>
 </div>
 {job.completedDate && (
 <div>
 <span className="font-semibold text-muted-foreground block mb-1">Completed On:</span>
 <span>{new Date(job.completedDate).toLocaleString()}</span>
 </div>
 )}
 {job.status === 'Completed' && (
 <div className="pt-4 border-t border-border mt-4">
 <button
 type="button"
 onClick={handleGenerateInvoice}
 disabled={actionLoading}
 className="w-full bg-green-500/10 text-green-500 font-semibold py-3 flex items-center justify-center gap-2 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/30 disabled:opacity-50"
 >
 {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Receipt className="h-5 w-5" />}
 <span>Generate Invoice & Collect Payment</span>
 </button>
 </div>
 )}
 {job.status === 'PendingApproval' && (
 <div className="pt-4 border-t border-border">
 <button
 type="button"
 onClick={handleReopen}
 disabled={actionLoading}
 className="w-full bg-blue-500/10 text-blue-500 font-semibold py-3 flex items-center justify-center gap-2 rounded-xl hover:bg-blue-500/20 transition-all border border-blue-500/30 disabled:opacity-50"
 >
 {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Unlock className="h-5 w-5" />}
 <span>Unlock Job</span>
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </div>

 <ConfirmModal
 isOpen={confirmModal.isOpen}
 title={confirmModal.title}
 message={confirmModal.message}
 type={confirmModal.type}
 onConfirm={confirmModal.onConfirm}
 onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
 confirmText="Confirm"
 />

 {invoiceModalOpen && (
     <CreateInvoiceModal
         isOpen={invoiceModalOpen}
         onClose={() => setInvoiceModalOpen(false)}
         onSuccess={() => {
             setInvoiceModalOpen(false);
         }}
         initialCustomerId={invoiceModalProps.customerId}
         initialLaborCost={invoiceModalProps.laborCost}
         workOrderId={invoiceModalProps.workOrderId}
     />
 )}
 </div>
 );
};
