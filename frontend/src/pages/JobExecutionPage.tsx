import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Navigation, CalendarClock, Clock, CheckCircle2, Loader2, UploadCloud, ClipboardCheck, Unlock, Receipt, Phone, ChevronDown, Camera, X, AlertCircle } from "lucide-react";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { workOrderService, WorkOrderItemDto } from "../services/workOrderService";
import { JobLineItems } from "../components/workorders/JobLineItems";
import imageCompression from 'browser-image-compression';

const extractApiError = (error: any, fallback: string) => {
 if (!error || !error.response || !error.response.data) return error?.message || fallback;
 const d = error.response.data;
 if (typeof d === 'string') return d;
 return d.error || d.Error || d.message || d.Message || d.detail || d.title || fallback;
};

import { WorkOrderDto, ChecklistResultDto, UpdateChecklistDto } from "../types/field";
import { toast } from "react-hot-toast";
import { useAuth } from "../auth/AuthContext";
import { PlanFeature } from "../types/auth";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
import { invoiceService } from "../services/invoiceService";

const statusColor = (status: string) => {
 if (status === 'Completed' || status === 'Approved') return 'text-green-600 bg-green-50 border-green-200';
 if (status === 'InProgress') return 'text-blue-600 bg-blue-50 border-blue-200';
 if (status === 'WaitingForParts') return 'text-orange-600 bg-orange-50 border-orange-200';
 if (status === 'PendingQuote') return 'text-yellow-700 bg-yellow-50 border-yellow-200';
 return 'text-primary bg-primary/10 border-primary/20';
};

// Skeleton loader for the job page
const JobSkeleton = () => (
 <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 animate-pulse">
  <div className="flex items-center gap-3">
   <div className="skeleton h-10 w-10 rounded-xl" />
   <div className="skeleton h-6 w-40 rounded-lg" />
  </div>
  <div className="skeleton h-32 w-full rounded-2xl" />
  <div className="skeleton h-48 w-full rounded-2xl" />
  <div className="skeleton h-64 w-full rounded-2xl" />
 </div>
);

// Accordion section component
const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false, badge }: {
 title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: string | number;
}) => {
 const [open, setOpen] = useState(defaultOpen);
 return (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
   <button
    type="button"
    onClick={() => setOpen(o => !o)}
    className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-muted/30 transition-colors min-h-[56px]"
   >
    <div className="flex items-center gap-3">
     <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
      <Icon className="h-5 w-5 text-primary" />
     </div>
     <span className="font-semibold text-foreground">{title}</span>
     {badge !== undefined && (
      <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full min-w-[20px] text-center">
       {badge}
      </span>
     )}
    </div>
    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
   </button>
   {open && (
    <div className="px-4 pb-4 md:px-5 md:pb-5 border-t border-border/50 pt-4 animate-slide-up">
     {children}
    </div>
   )}
  </div>
 );
};

export const JobExecutionPage = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { hasFeature } = useAuth();
 const [job, setJob] = useState<WorkOrderDto | null>(null);
 const [loading, setLoading] = useState(true);
 const [actionLoading, setActionLoading] = useState(false);

 const [checklists, setChecklists] = useState<ChecklistResultDto[]>([]);
 const [checklistAnswers, setChecklistAnswers] = useState<Record<number, string>>({});
 const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

 const [notes, setNotes] = useState("");
 const result = 1; // Always completes as "Completed"

 const [jobItems, setJobItems] = useState<WorkOrderItemDto[]>([]);

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

 const handleSaveProgress = async (newStatus: string) => {
  try {
   setActionLoading(true);
   await workOrderService.update(Number(id), {
    id: Number(id),
    status: newStatus,
    technicianNotes: notes,
    clearScheduledDate: true
   });
   toast.success(`Job saved and marked as ${newStatus.replace(/([A-Z])/g, ' $1').trim()}.`);
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

   if (hasFeature(PlanFeature.ChecklistFormBuilder)) {
    try {
     const checklistData = await workOrderService.getChecklist(Number(id));
     setChecklists(checklistData);
     const initialAnswers: Record<number, string> = {};
     checklistData.forEach(c => { if (c.selectedValue) initialAnswers[c.id] = c.selectedValue; });
     setChecklistAnswers(initialAnswers);
    } catch { }
   }
  } catch (error) {
   toast.error("Failed to load job details.");
   navigate('/my-jobs');
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { if (id) fetchJob(); }, [id]);

 const uploadPhotosNow = async () => {
  if (!id || evidenceFiles.length === 0) return;
  setActionLoading(true);
  try {
   const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
   for (const file of evidenceFiles) {
    let uploadFile = file;
    if (file.type.startsWith('image/')) uploadFile = await imageCompression(file, options);
    const formData = new FormData();
    formData.append('File', uploadFile, uploadFile.name);
    await workOrderService.uploadEvidence(Number(id), formData);
   }
   toast.success("Photos uploaded successfully!");
   setEvidenceFiles([]);
   fetchJob();
  } catch (error: any) {
   toast.error(extractApiError(error, "Failed to upload photos."));
  } finally {
   setActionLoading(false);
  }
 };

 const handleComplete = async (e: React.FormEvent) => {
  e.preventDefault();
  confirmAction("Complete Job", "Are you sure you want to complete this job?", "warning", async () => {
   setActionLoading(true);
   try {
    if (checklists.length > 0) {
     const answers: UpdateChecklistDto[] = checklists.map(c => ({
      resultId: c.id,
      selectedValue: checklistAnswers[c.id] || "",
      comments: null
     }));
     await workOrderService.submitChecklist(Number(id), answers);
    }
    if (evidenceFiles.length > 0) {
     const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
     for (const file of evidenceFiles) {
      let uploadFile = file;
      if (file.type.startsWith('image/')) uploadFile = await imageCompression(file, options);
      const formData = new FormData();
      formData.append('File', uploadFile, uploadFile.name);
      await workOrderService.uploadEvidence(Number(id), formData);
     }
    }
    await workOrderService.completeJob(Number(id), { notes, result });
    toast.success("Job completed! You can now generate an invoice.");
    fetchJob();
   } catch (error: any) {
    toast.error(extractApiError(error, "Failed to complete job."));
   } finally {
    setActionLoading(false);
   }
  });
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
  confirmAction("Re-open Job", "This will revert the job status to In Progress. Continue?", "info", async () => {
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
  });
 };

 if (loading) return <JobSkeleton />;
 if (!job) return null;

 const isCompleted = job.status === 'Completed' || job.status === 'Approved';

 return (
  <>
  <div className="max-w-3xl mx-auto animate-in fade-in duration-300 pb-36 md:pb-24">

   {/* Sticky Header */}
   <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border flex items-center gap-3 px-4 py-3 -mx-4 md:-mx-8 mb-6 shadow-sm">
    <button
     onClick={() => navigate('/my-jobs')}
     className="p-2.5 hover:bg-muted rounded-xl transition-colors text-muted-foreground min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-90"
    >
     <ArrowLeft className="h-5 w-5" />
    </button>
    <div className="flex-1 min-w-0">
     <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
       WO-{job.id.toString().padStart(4, '0')}
      </span>
      <span className={`text-xs font-semibold border px-2.5 py-1 rounded-full ${statusColor(job.status)}`}>
       {job.status}
      </span>
     </div>
     <p className="text-xs text-muted-foreground mt-0.5 truncate">{job.description}</p>
    </div>
    {isCompleted && (
     <button
      onClick={handleReopen}
      disabled={actionLoading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-medium transition-colors min-h-[44px]"
     >
      <Unlock className="h-4 w-4" />
      <span className="hidden sm:inline">Reopen</span>
     </button>
    )}
   </div>

   <div className="space-y-3">

    {/* Job Info */}
    <AccordionSection title="Job Details" icon={MapPin} defaultOpen={true}>
     <div className="space-y-4">
      <p className="text-base font-semibold text-foreground leading-snug whitespace-pre-wrap">{job.description}</p>

      <div className="grid grid-cols-1 gap-3">
       <div className="flex items-start gap-3 bg-muted/30 rounded-xl p-3">
        <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
         <p className="text-sm font-semibold text-foreground">{job.customerName}</p>
         <p className="text-sm text-muted-foreground">{job.customerAddress || job.siteName}</p>
         <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.customerAddress || `${job.siteName} ${job.customerName}`)}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-1.5 hover:underline"
         >
          <Navigation className="h-3 w-3" /> Get Directions
         </a>
        </div>
       </div>

       {(job.customerPhone || job.customerAltPhone) && (
        <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
         <Phone className="h-5 w-5 text-primary shrink-0" />
         <div className="flex flex-col gap-1">
          {job.customerPhone && (
           <a href={`tel:${job.customerPhone}`} className="text-sm font-semibold text-primary hover:underline">
            {job.customerPhone}
           </a>
          )}
          {job.customerAltPhone && (
           <a href={`tel:${job.customerAltPhone}`} className="text-sm text-primary hover:underline">
            {job.customerAltPhone}
           </a>
          )}
         </div>
        </div>
       )}

       <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
        <CalendarClock className="h-5 w-5 text-primary shrink-0" />
        <div>
         <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Scheduled</p>
         <p className="text-sm font-semibold text-foreground">
          {job.scheduledDate
           ? new Date(job.scheduledDate).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
           : 'Unscheduled'}
         </p>
        </div>
       </div>
      </div>
     </div>
    </AccordionSection>

    {/* Parts & Materials */}
    <AccordionSection title="Parts & Materials" icon={ClipboardCheck} defaultOpen={true} badge={jobItems.length || undefined}>
     <JobLineItems jobId={Number(id)} onItemsChange={setJobItems} />
    </AccordionSection>

    {/* Checklist */}
    {checklists.length > 0 && (
     <AccordionSection title="Required Checklist" icon={ClipboardCheck} defaultOpen={false} badge={checklists.length}>
      <div className="space-y-3">
       {checklists.map(item => (
        <div key={item.id} className="bg-muted/20 border border-border rounded-xl p-4">
         <label className="text-sm font-medium text-foreground mb-3 block">{item.questionText}</label>
         {item.inputType === 'Boolean' && (
          <div className="flex gap-3">
           {['Yes', 'No'].map(val => (
            <label key={val} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer transition-all font-medium text-sm ${checklistAnswers[item.id] === val ? (val === 'Yes' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') : 'border-border bg-background text-muted-foreground'}`}>
             <input type="radio" name={`checklist-${item.id}`} value={val} checked={checklistAnswers[item.id] === val} onChange={e => setChecklistAnswers(prev => ({ ...prev, [item.id]: e.target.value }))} className="sr-only" />
             {val === 'Yes' ? '✓ Pass' : '✗ Fail'}
            </label>
           ))}
          </div>
         )}
         {item.inputType === 'Text' && (
          <input type="text" value={checklistAnswers[item.id] || ""} onChange={e => setChecklistAnswers(prev => ({ ...prev, [item.id]: e.target.value }))} className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary min-h-[48px]" placeholder="Enter reading or value..." />
         )}
        </div>
       ))}
      </div>
     </AccordionSection>
    )}

    {/* Photos */}
    <AccordionSection title="Job Photos" icon={Camera} defaultOpen={false} badge={((job.evidences?.length || 0) + evidenceFiles.length) || undefined}>
     <div className="space-y-4">
      {/* Saved photos */}
      {job.evidences && job.evidences.length > 0 && (
       <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Saved Photos</p>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
         {job.evidences.map(ev => (
          <div key={ev.id} className="relative rounded-xl overflow-hidden border border-border aspect-square bg-muted">
           <img src={ev.fileUrl} alt={ev.fileName} className="w-full h-full object-cover" />
          </div>
         ))}
        </div>
       </div>
      )}

      {/* Upload new */}
      <div>
       <input type="file" accept="image/*" id="evidence-upload" multiple className="hidden" onChange={e => {
        if (e.target.files && e.target.files.length > 0) setEvidenceFiles(prev => [...prev, ...Array.from(e.target.files!)]);
       }} />
       <label htmlFor="evidence-upload" className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-muted/30 transition-colors active:scale-[0.99]">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
         <Camera className="h-6 w-6 text-primary" />
        </div>
        <span className="text-sm font-semibold text-primary">Take Photo / Upload</span>
        <span className="text-xs text-muted-foreground">JPEG, PNG, HEIC — max 10MB</span>
       </label>
      </div>

      {evidenceFiles.length > 0 && (
       <div className="space-y-3">
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
         {evidenceFiles.map((file, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-muted">
           <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
           <button type="button" onClick={() => setEvidenceFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1.5 rounded-full shadow-md">
            <X className="h-3 w-3" />
           </button>
          </div>
         ))}
        </div>
        <button type="button" onClick={uploadPhotosNow} disabled={actionLoading} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[48px]">
         {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
         Upload {evidenceFiles.length} Photo{evidenceFiles.length !== 1 ? 's' : ''} Now
        </button>
       </div>
      )}
     </div>
    </AccordionSection>

    {/* Sign-Off */}
    <AccordionSection title="Job Sign-Off" icon={CheckCircle2} defaultOpen={true}>
     <form onSubmit={handleComplete} className="space-y-4">
      <div>
       <label className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider">Work Performed / Notes *</label>
       <textarea
        required
        rows={4}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Detail the work carried out, parts used, issues found..."
        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
       />
      </div>

      <div>
       {/* Save Progress Buttons */}
       <div className="flex gap-2">
        <button type="button" onClick={() => handleSaveProgress('WaitingForParts')} disabled={actionLoading || !notes} className="flex-1 bg-orange-500/10 text-orange-600 border border-orange-500/20 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 text-sm min-h-[48px]">
         <Clock className="h-4 w-4" />
         <span className="hidden sm:inline">Waiting for Parts</span>
         <span className="sm:hidden">Parts</span>
        </button>
        <button type="button" onClick={() => handleSaveProgress('PendingQuote')} disabled={actionLoading || !notes} className="flex-1 bg-yellow-500/10 text-yellow-700 border border-yellow-500/20 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 text-sm min-h-[48px]">
         <AlertCircle className="h-4 w-4" />
         <span className="hidden sm:inline">Pending Quote</span>
         <span className="sm:hidden">Quote</span>
        </button>
       </div>
      </div>

      {/* Close Job button */}
      <button type="submit" disabled={actionLoading || !notes} className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 text-base shadow-lg shadow-primary/20 min-h-[56px]">
       {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
       Close Job
      </button>

      {/* Generate Invoice (if completed) */}
      {job.status === 'Completed' && (
       <button type="button" onClick={handleGenerateInvoice} disabled={actionLoading} className="w-full bg-green-500/10 text-green-600 border border-green-500/30 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 min-h-[48px]">
        {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Receipt className="h-5 w-5" />}
        Generate Invoice & Collect Payment
       </button>
      )}
     </form>
    </AccordionSection>

   </div>

   {/* Sticky Bottom CTA — most important action always visible */}
   {!isCompleted && (
    <div className="fixed bottom-20 md:bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 md:hidden">
     <div className="max-w-3xl mx-auto flex gap-3">
      {job.status === 'Completed' ? (
       <button onClick={handleGenerateInvoice} disabled={actionLoading} className="flex-1 bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[52px]">
        <Receipt className="h-5 w-5" /> Invoice & Pay
       </button>
      ) : (
       <div className="flex-1 bg-primary/5 text-primary border border-primary/20 rounded-xl flex items-center justify-center text-sm font-medium min-h-[52px] px-4">
        <CheckCircle2 className="h-4 w-4 mr-2" />
        Fill notes above to complete job
       </div>
      )}
     </div>
    </div>
   )}

   {isCompleted && (
    <div className="fixed bottom-20 md:bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 md:hidden">
     <div className="max-w-3xl mx-auto">
      <button onClick={handleGenerateInvoice} disabled={actionLoading} className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[52px]">
       {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Receipt className="h-5 w-5" />}
       Generate Invoice & Collect Payment
      </button>
     </div>
    </div>
   )}

  </div>
  
   <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} confirmText="Confirm" />

   {invoiceModalOpen && (
    <CreateInvoiceModal
     isOpen={invoiceModalOpen}
     onClose={() => setInvoiceModalOpen(false)}
     onSuccess={() => { setInvoiceModalOpen(false); window.location.reload(); }}
     initialCustomerId={invoiceModalProps.customerId}
     initialLaborCost={invoiceModalProps.laborCost}
     workOrderId={invoiceModalProps.workOrderId}
     preloadedItems={jobItems}
    />
   )}
  </>
 );
};
