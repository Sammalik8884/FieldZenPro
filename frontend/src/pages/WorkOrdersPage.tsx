import { useState, useEffect } from "react";
import { Loader2, Search, BriefcaseBusiness, CheckCircle, XCircle, Receipt, Trash2, Edit, Briefcase, PlusCircle, X } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { workOrderService } from "../services/workOrderService";
import { invoiceService } from "../services/invoiceService";
import { customerService } from "../services/customerService";
import { WorkOrderDto, UpdateWorkOrderDto, CreateWorkOrderDto } from "../types/field";
import { CustomerDto } from "../types/customer";
import { toast } from "react-hot-toast";
import { authService } from "../services/authService";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
import { ReviewJobModal } from "../components/ReviewJobModal";
import { SchedulingBoard } from "../components/workorders/SchedulingBoard";
import { getNYDate } from "../utils/dateUtils";

const extractApiError = (error: any, fallback: string) => {
 if (!error || !error.response || !error.response.data) return error?.message || fallback;
 const d = error.response.data;
 if (typeof d === 'string') return d;
 return d.error || d.Error || d.message || d.Message || d.detail || d.title || fallback;
};

const statusStyle = (status: string) => {
 if (status === 'Completed') return 'bg-green-500/10 text-green-600 border-green-500/20';
 if (status === 'InProgress') return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
 if (status === 'PendingApproval') return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
 if (status === 'Approved') return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
 if (status === 'Initialized') return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
 if (status === 'Assigned') return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
 if (status === 'Rejected') return 'bg-red-500/10 text-red-600 border-red-500/20';
 return 'bg-muted/30 text-muted-foreground border-border';
};

export const WorkOrdersPage = () => {
 const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
 const [invoiceModalProps, setInvoiceModalProps] = useState<{workOrderId?: number, customerId?: number, laborCost?: number}>({});
 const [reviewModalOpen, setReviewModalOpen] = useState(false);
 const [reviewWorkOrder, setReviewWorkOrder] = useState<WorkOrderDto | null>(null);
 const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
 const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, type: 'info' | 'warning' | 'danger', onConfirm: () => void}>({
  isOpen: false, title: '', message: '', type: 'info', onConfirm: () => {}
 });

 const confirmAction = (title: string, message: string, type: 'info' | 'warning' | 'danger', action: () => Promise<void>) => {
  setConfirmModal({ isOpen: true, title, message, type, onConfirm: async () => { setConfirmModal(prev => ({ ...prev, isOpen: false })); await action(); } });
 };

 const [workOrders, setWorkOrders] = useState<WorkOrderDto[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [processingId, setProcessingId] = useState<number | null>(null);

 const activeWorkOrders = workOrders.filter(w => ['InProgress', 'Assigned', 'Initialized', 'PendingApproval'].includes(w.status)).length;
 const now = getNYDate();
 const completedThisMonth = workOrders.filter(w => {
  if (w.status !== 'Completed' || !w.completedDate) return false;
  const d = new Date(w.completedDate);
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
 }).length;

 const [technicians, setTechnicians] = useState<any[]>([]);
 const [customers, setCustomers] = useState<CustomerDto[]>([]);

 // Create modal state
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [createForm, setCreateForm] = useState<CreateWorkOrderDto>({
  description: "", customerId: 0, contractId: 0, scheduledDate: "", technicianId: null, assetId: undefined
 });
 const [createCustomerSearch, setCreateCustomerSearch] = useState("");
 const [createTechSearch, setCreateTechSearch] = useState("");
 const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
 const [showTechDropdown, setShowTechDropdown] = useState(false);

 // Delete modal state
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [jobToDelete, setJobToDelete] = useState<WorkOrderDto | null>(null);

 // Edit modal state
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [editingJob, setEditingJob] = useState<WorkOrderDto | null>(null);
 const [formData, setFormData] = useState<UpdateWorkOrderDto>({ id: 0, description: "", status: "", scheduledDate: "", technicianId: "", assetId: null });

 const fetchData = async () => {
  try {
   setLoading(true);
   const [woData, usersData, custData] = await Promise.all([
    workOrderService.getAll(),
    authService.getUsers().catch(() => []),
    customerService.getAll().catch(() => [])
   ]);
   setWorkOrders(woData);
   setTechnicians(usersData.filter((u: any) => u.roles && (u.roles.includes("Tech") || u.roles.includes("Worker") || u.roles.includes("Technician"))));
   setCustomers(Array.isArray(custData) ? custData : []);
  } catch (error) {
   toast.error("Failed to load work orders.");
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { fetchData(); }, []);

 const filteredWorkOrders = workOrders.filter(wo =>
  wo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
  wo.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  wo.status.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const handleDeleteWO = async (id: number) => {
  const wo = workOrders.find(w => w.id === id);
  if (wo) { setJobToDelete(wo); setIsDeleteModalOpen(true); }
 };

 const confirmDeleteJob = async () => {
  if (!jobToDelete) return;
  try {
   await workOrderService.delete(jobToDelete.id);
   toast.success("Work Order deleted.");
   setIsDeleteModalOpen(false);
   setJobToDelete(null);
   fetchData();
  } catch (error: any) {
   toast.error(extractApiError(error, "Failed to delete item."));
   setIsDeleteModalOpen(false);
   setJobToDelete(null);
  }
 };

 const handleApproveReject = async (id: number, isApproved: boolean) => {
  confirmAction(
   isApproved ? "Approve Job" : "Reject Job",
   `Are you sure you want to ${isApproved ? 'approve' : 'reject'} this job?`,
   isApproved ? "info" : "warning",
   async () => {
    try {
     setProcessingId(id);
     await workOrderService.approveJob(id, isApproved);
     toast.success(`Job ${isApproved ? 'approved' : 'rejected'} successfully.`);
     fetchData();
    } catch (error: any) {
     toast.error(extractApiError(error, "Failed to process job."));
    } finally { setProcessingId(null); }
   }
  );
 };

 const handleGenerateInvoice = async (id: number) => {
  try {
   setProcessingId(id);
   const preview = await invoiceService.getPreviewFromJob(id);
   setInvoiceModalProps({ workOrderId: id, customerId: preview.customerId, laborCost: preview.laborCost });
   setInvoiceModalOpen(true);
  } catch (error: any) {
   toast.error(extractApiError(error, "Failed to prepare invoice."));
  } finally { setProcessingId(null); }
 };

 const handleCreateSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!createForm.customerId) { toast.error("Please select a Customer."); return; }
  try {
   setProcessingId(-10);
   await workOrderService.create({
    description: createForm.description,
    customerId: createForm.customerId,
    contractId: createForm.contractId || undefined,
    scheduledDate: createForm.scheduledDate ? createForm.scheduledDate + "T00:00:00" : null,
    technicianId: createForm.technicianId || null,
    assetId: createForm.assetId || undefined
   });
   toast.success("Work Order created successfully!");
   setIsCreateModalOpen(false);
   setCreateForm({ description: "", customerId: 0, contractId: 0, scheduledDate: "", technicianId: null, assetId: undefined });
   setCreateCustomerSearch(""); setCreateTechSearch("");
   fetchData();
  } catch (error: any) {
   toast.error(extractApiError(error, "Failed to create work order."));
  } finally { setProcessingId(null); }
 };

 const handleOpenEdit = (wo: WorkOrderDto) => {
  setEditingJob(wo);
  setFormData({ id: wo.id, description: wo.description, status: wo.status, scheduledDate: wo.scheduledDate ? wo.scheduledDate.split('T')[0] : "", technicianId: "", assetId: (wo as any).assetId || null });
  setIsEditModalOpen(true);
 };

 const handleSaveEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.technicianId) { toast.error("Please select a Technician before assigning."); return; }
  try {
   if (formData.technicianId !== undefined && formData.technicianId !== editingJob?.technicianId) {
    if (formData.technicianId === "") { formData.technicianId = null; }
    else { await workOrderService.assignTechnician(formData.id, formData.technicianId as string); }
   }
   const updatePayload: any = {
    id: formData.id,
    description: formData.description,
    status: formData.status,
    technicianId: formData.technicianId === "" ? null : formData.technicianId,
    assetId: formData.assetId === 0 ? null : formData.assetId
   };
   if (formData.scheduledDate && formData.scheduledDate.trim() !== "") {
    updatePayload.scheduledDate = formData.scheduledDate + "T00:00:00";
   }
   await workOrderService.update(editingJob!.id, updatePayload);
   toast.success("Work Order updated successfully.");
   setIsEditModalOpen(false);
   fetchData();
  } catch (error: any) {
   console.error("Update error:", error.response?.data || error.message);
   toast.error(extractApiError(error, "Failed to update job."));
  }
 };

 const inputCls = "w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]";

 return (
  <div className="animate-in fade-in duration-500">

   {/* Header */}
   <div className="flex justify-between items-center mb-6">
    <div>
     <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
      <BriefcaseBusiness className="h-6 w-6 md:h-8 md:w-8 text-primary" />
      Work Orders
     </h1>
     <p className="text-muted-foreground mt-0.5 text-sm">Dispatch overview and job status tracking.</p>
    </div>
    <button
     onClick={() => setIsCreateModalOpen(true)}
     className="bg-primary text-primary-foreground px-3 py-2 md:px-5 md:py-2.5 rounded-xl flex items-center gap-2 font-semibold hover:bg-primary/90 active:scale-95 transition-all shadow-sm min-h-[44px]"
    >
     <PlusCircle className="h-5 w-5" />
     <span className="hidden sm:inline">New Work Order</span>
    </button>
   </div>

   {/* Stats */}
   <div className="mb-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
    <StatCard title="Active Jobs" value={activeWorkOrders} subtitle="In progress or assigned" icon={Briefcase} href="#" accentColor="blue" />
    <StatCard title="Completed MTD" value={completedThisMonth} subtitle="This month" icon={CheckCircle} href="#" accentColor="cyan" trend={completedThisMonth > 0 ? 'up' : 'neutral'} trendLabel="This month" />
   </div>

   {/* Main Panel */}
   <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

    {/* Toolbar */}
    <div className="p-3 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
     <div className="flex bg-muted p-1 rounded-xl">
      <button onClick={() => setViewMode('board')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'board' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
       Schedule Board
      </button>
      <button onClick={() => setViewMode('list')} className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-lg transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
       All Jobs
      </button>
     </div>
     {viewMode === 'list' && (
      <div className="relative flex-1">
       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
       <input type="text" placeholder="Search jobs or customers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-background/50 border border-border text-sm rounded-xl pl-9 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]" />
      </div>
     )}
    </div>

    {/* Content */}
    {viewMode === 'board' ? (
     <div className="p-4 bg-background">
      <SchedulingBoard
       workOrders={workOrders}
       onUpdateJob={async (id, updates) => { await workOrderService.update(id, updates as any); fetchData(); }}
      />
     </div>
    ) : loading ? (
     <div className="divide-y divide-border/30">
      {[1,2,3,4,5].map(i => (
       <div key={i} className="p-4 space-y-2 animate-pulse">
        <div className="flex gap-2"><div className="skeleton h-5 w-24 rounded-lg" /><div className="skeleton h-5 w-20 rounded-full" /></div>
        <div className="skeleton h-4 w-64 rounded" />
        <div className="skeleton h-4 w-36 rounded" />
       </div>
      ))}
     </div>
    ) : filteredWorkOrders.length === 0 ? (
     <div className="p-12 text-center text-muted-foreground">
      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
      <p className="font-medium">No work orders found</p>
      <p className="text-sm mt-1">Create one using the button above.</p>
     </div>
    ) : (
     <>
      {/* ── Mobile Card List ── */}
      <div className="block md:hidden divide-y divide-border/30">
       {filteredWorkOrders.map(wo => (
        <div key={wo.id} className="p-4">
         <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-foreground text-sm">WO-{wo.id.toString().padStart(4, '0')}</span>
            <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${statusStyle(wo.status)}`}>{wo.status}</span>
           </div>
           <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{wo.description}</p>
           <p className="text-xs text-muted-foreground mt-1">{wo.customerName}{wo.siteName ? ` — ${wo.siteName}` : ''}</p>
           <p className="text-xs text-primary mt-0.5 font-medium">Tech: {wo.technicianName || 'Unassigned'}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
           <button onClick={() => handleOpenEdit(wo)} className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
            <Edit className="h-4 w-4" />
           </button>
           <button onClick={() => handleDeleteWO(wo.id)} className="p-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center">
            <Trash2 className="h-4 w-4" />
           </button>
          </div>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-0.5">
          {wo.status === 'PendingApproval' && (<>
           <button onClick={() => { setReviewWorkOrder(wo); setReviewModalOpen(true); }} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 text-xs font-semibold min-h-[40px] active:scale-95 transition-all"><BriefcaseBusiness className="h-4 w-4" /> Review</button>
           <button onClick={() => handleApproveReject(wo.id, true)} disabled={processingId === wo.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-green-500/30 bg-green-500/10 text-green-600 text-xs font-semibold min-h-[40px] active:scale-95 transition-all disabled:opacity-50">{processingId === wo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />} Approve</button>
           <button onClick={() => handleApproveReject(wo.id, false)} disabled={processingId === wo.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold min-h-[40px] active:scale-95 transition-all disabled:opacity-50"><XCircle className="h-4 w-4" /> Reject</button>
          </>)}
          {wo.status === 'Approved' && (
           <button onClick={() => handleGenerateInvoice(wo.id)} disabled={processingId === wo.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 text-xs font-semibold min-h-[40px] active:scale-95 transition-all disabled:opacity-50">{processingId === wo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />} Generate Invoice</button>
          )}
          {(wo.status === 'Completed') && (
           <button onClick={() => { setReviewWorkOrder(wo); setReviewModalOpen(true); }} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-muted/20 text-muted-foreground text-xs font-semibold min-h-[40px] active:scale-95 transition-all"><BriefcaseBusiness className="h-4 w-4" /> Review Work</button>
          )}
         </div>
        </div>
       ))}
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block overflow-x-auto">
       <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
         <tr>
          <th className="px-6 py-4 font-medium">Job Details</th>
          <th className="px-6 py-4 font-medium">Customer & Site</th>
          <th className="px-6 py-4 font-medium">Status</th>
          <th className="px-6 py-4 font-medium">Result</th>
          <th className="px-6 py-4 font-medium text-right">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
         {filteredWorkOrders.map(wo => (
          <tr key={wo.id} className="hover:bg-muted transition-colors">
           <td className="px-6 py-4">
            <div className="font-medium text-foreground">WO-{wo.id.toString().padStart(4, '0')}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={wo.description}>{wo.description}</div>
            <div className="text-xs text-primary mt-1">Tech: {wo.technicianName || 'Unassigned'}</div>
           </td>
           <td className="px-6 py-4">
            <div className="font-medium">{wo.customerName}</div>
            <div className="text-xs text-muted-foreground">{wo.siteName}</div>
           </td>
           <td className="px-6 py-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${statusStyle(wo.status)}`}>{wo.status}</span>
           </td>
           <td className="px-6 py-4">
            <div className="font-medium">{wo.result || '-'}</div>
            {wo.completedDate && <div className="text-xs text-muted-foreground">{new Date(wo.completedDate).toLocaleDateString()}</div>}
           </td>
           <td className="px-6 py-4 text-right">
            {wo.status === 'PendingApproval' && (
             <div className="flex justify-end space-x-2 mb-2">
              <button onClick={() => { setReviewWorkOrder(wo); setReviewModalOpen(true); }} className="p-2 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20 rounded-lg bg-blue-500/10" title="Review"><BriefcaseBusiness className="h-4 w-4" /></button>
              <button onClick={() => handleApproveReject(wo.id, true)} disabled={processingId === wo.id} className="p-2 border border-green-500/30 text-green-500 hover:bg-green-500/20 rounded-lg bg-green-500/10 disabled:opacity-50">{processingId === wo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}</button>
              <button onClick={() => handleApproveReject(wo.id, false)} disabled={processingId === wo.id} className="p-2 border border-destructive/30 text-destructive hover:bg-destructive/20 rounded-lg bg-destructive/10 disabled:opacity-50"><XCircle className="h-4 w-4" /></button>
             </div>
            )}
            {wo.status === 'Approved' && (
             <div className="flex justify-end space-x-2 mb-2">
              <button onClick={() => { setReviewWorkOrder(wo); setReviewModalOpen(true); }} className="p-2 border border-border text-muted-foreground hover:bg-muted/20 rounded-lg bg-muted/10"><BriefcaseBusiness className="h-4 w-4" /></button>
              <button onClick={() => handleGenerateInvoice(wo.id)} disabled={processingId === wo.id} className="p-2 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20 rounded-lg bg-blue-500/10 disabled:opacity-50">{processingId === wo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}</button>
             </div>
            )}
            {wo.status === 'Completed' && (
             <div className="flex justify-end space-x-2 mb-2">
              <button onClick={() => { setReviewWorkOrder(wo); setReviewModalOpen(true); }} className="p-2 border border-border text-muted-foreground hover:bg-muted/20 rounded-lg bg-muted/10"><BriefcaseBusiness className="h-4 w-4" /></button>
             </div>
            )}
            {(wo.status === 'Assigned' || wo.status === 'Initialized') && <div className="flex justify-end text-[11px] text-muted-foreground italic items-center gap-1 mb-1"><Loader2 className="h-3 w-3 animate-spin" /> Waiting for Tech</div>}
            {wo.status === 'InProgress' && <div className="flex justify-end text-[11px] text-blue-500 italic items-center gap-1 mb-1"><Loader2 className="h-3 w-3 animate-spin" /> In Progress</div>}
            <div className="flex justify-end space-x-2">
             <button onClick={() => handleOpenEdit(wo)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"><Edit className="h-4 w-4" /></button>
             <button onClick={() => handleDeleteWO(wo.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
            </div>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     </>
    )}
   </div>

   {/* ── Edit Modal — bottom sheet on mobile ── */}
   {isEditModalOpen && editingJob && (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
     <div className="bg-card border border-border w-full md:max-w-md md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />
      <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 bg-border rounded-full" /></div>
      <div className="p-5 md:p-6 overflow-y-auto flex-1">
       <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
        <BriefcaseBusiness className="h-5 w-5 text-primary" />
        Edit WO-{editingJob.id.toString().padStart(4, '0')}
       </h2>
       <form onSubmit={handleSaveEdit} className="space-y-4">
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description / Notes</label>
         <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary" rows={3} />
        </div>
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Status</label>
         <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className={inputCls}>
          <option value="Created">Created</option>
          <option value="Assigned">Assigned</option>
          <option value="Initialized">Initialized</option>
          <option value="InProgress">InProgress</option>
          <option value="PendingApproval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
          <option value="WaitingForParts">Waiting for Parts</option>
          <option value="Unscheduled">Unscheduled</option>
          <option value="PendingQuote">Pending Quote</option>
         </select>
        </div>
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Scheduled Date</label>
         <input type="date" value={formData.scheduledDate || ""} onChange={e => setFormData({ ...formData, scheduledDate: e.target.value })} className={inputCls} />
        </div>
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Assign Technician</label>
         <select value={formData.technicianId || ""} onChange={e => setFormData({ ...formData, technicianId: e.target.value })} className={inputCls}>
          <option value="">-- Unassigned --</option>
          {technicians.map(t => (<option key={t.id} value={t.id}>{t.fullName}</option>))}
          {technicians.length === 0 && <option value="" disabled>No technicians found.</option>}
         </select>
        </div>
        <div className="flex gap-3 pt-4 border-t border-border">
         <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 px-4 py-3 text-sm font-medium border border-border hover:bg-muted rounded-xl transition-colors min-h-[48px]">Cancel</button>
         <button type="submit" className="flex-1 px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-95 transition-all min-h-[48px]">Save Changes</button>
        </div>
       </form>
      </div>
     </div>
    </div>
   )}

   {/* ── Create Modal — bottom sheet on mobile ── */}
   {isCreateModalOpen && (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
     <div className="bg-card border border-border w-full md:max-w-lg md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />
      <div className="flex justify-between items-center px-5 pt-5 pb-1">
       <div className="flex items-center gap-3">
        <div className="md:hidden w-10 h-1 bg-border rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
         <PlusCircle className="h-5 w-5 text-primary" /> Create Work Order
        </h2>
       </div>
       <button onClick={() => { setIsCreateModalOpen(false); setCreateCustomerSearch(""); setCreateTechSearch(""); }} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors">
        <X className="h-5 w-5" />
       </button>
      </div>
      <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-4">
       {/* Customer search */}
       <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Customer *</label>
        <div className="relative">
         <input type="text" required placeholder="Search customer..." value={createCustomerSearch}
          onChange={e => { setCreateCustomerSearch(e.target.value); setShowCustomerDropdown(true); if (!e.target.value) setCreateForm({ ...createForm, customerId: 0 }); }}
          onFocus={() => setShowCustomerDropdown(true)} onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 150)}
          className={inputCls} />
         {showCustomerDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
           {customers.filter(c => (c.companyName || c.name).toLowerCase().includes(createCustomerSearch.toLowerCase())).length === 0
            ? <div className="px-3 py-2 text-sm text-muted-foreground">No customers found</div>
            : customers.filter(c => (c.companyName || c.name).toLowerCase().includes(createCustomerSearch.toLowerCase())).map(c => (
             <button key={c.id} type="button" onMouseDown={() => { setCreateForm({ ...createForm, customerId: c.id }); setCreateCustomerSearch(c.companyName || c.name); setShowCustomerDropdown(false); }} className="w-full text-left px-3 py-3 text-sm hover:bg-muted transition-colors">{c.companyName || c.name}</button>
            ))}
          </div>
         )}
        </div>
        {createForm.customerId > 0 && <p className="text-xs text-green-600 mt-1 font-medium">✓ Customer selected</p>}
       </div>

       {/* Description */}
       <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description *</label>
        <textarea required value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary" rows={3} placeholder="Describe the work to be done..." />
       </div>

       {/* Scheduled Date */}
       <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Scheduled Date</label>
        <input type="date" value={createForm.scheduledDate || ""} onChange={e => setCreateForm({ ...createForm, scheduledDate: e.target.value })} className={inputCls} />
       </div>

       {/* Technician search */}
       <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Assign Technician</label>
        <div className="relative">
         <input type="text" placeholder="Search technician..." value={createTechSearch}
          onChange={e => { setCreateTechSearch(e.target.value); setShowTechDropdown(true); if (!e.target.value) setCreateForm({ ...createForm, technicianId: null }); }}
          onFocus={() => setShowTechDropdown(true)} onBlur={() => setTimeout(() => setShowTechDropdown(false), 150)}
          className={inputCls} />
         {showTechDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
           <button type="button" onMouseDown={() => { setCreateForm({ ...createForm, technicianId: null }); setCreateTechSearch(""); setShowTechDropdown(false); }} className="w-full text-left px-3 py-3 text-sm text-muted-foreground hover:bg-muted transition-colors italic">-- Unassigned --</button>
           {technicians.filter(t => t.fullName.toLowerCase().includes(createTechSearch.toLowerCase())).map(t => (
            <button key={t.id} type="button" onMouseDown={() => { setCreateForm({ ...createForm, technicianId: t.id }); setCreateTechSearch(t.fullName); setShowTechDropdown(false); }} className="w-full text-left px-3 py-3 text-sm hover:bg-muted transition-colors">{t.fullName}</button>
           ))}
           {technicians.length === 0 && <div className="px-3 py-2 text-sm text-muted-foreground">No technicians found</div>}
          </div>
         )}
        </div>
       </div>

       <div className="flex gap-3 pt-4 border-t border-border">
        <button type="button" onClick={() => { setIsCreateModalOpen(false); setCreateCustomerSearch(""); setCreateTechSearch(""); }} className="flex-1 px-4 py-3 text-sm font-medium border border-border hover:bg-muted rounded-xl transition-colors min-h-[48px] text-muted-foreground">Cancel</button>
        <button type="button" onClick={handleCreateSubmit as any} disabled={processingId === -10 || !createForm.customerId} className="flex-1 px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]">
         {processingId === -10 ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
         Create Work Order
        </button>
       </div>
      </div>
     </div>
    </div>
   )}

   {/* Delete Confirm */}
   <ConfirmModal isOpen={isDeleteModalOpen} onCancel={() => { setIsDeleteModalOpen(false); setJobToDelete(null); }} onConfirm={confirmDeleteJob} title="Delete Work Order" message={`Are you sure you want to delete WO-${jobToDelete?.id.toString().padStart(4, '0')}? This action cannot be undone.`} confirmText="Delete Job" type="danger" />
   <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} confirmText="Confirm" />

   <CreateInvoiceModal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} onSuccess={() => { setInvoiceModalOpen(false); fetchData(); }} initialCustomerId={invoiceModalProps.customerId} initialLaborCost={invoiceModalProps.laborCost} workOrderId={invoiceModalProps.workOrderId} />
   <ReviewJobModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} workOrder={reviewWorkOrder} />
  </div>
 );
};
