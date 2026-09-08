import { useState, useEffect } from "react";
import { Loader2, Search, Receipt, Eye, Send, Plus, Copy, DollarSign, AlertTriangle, FileText, X } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { invoiceService } from "../services/invoiceService";
import { customerService } from "../services/customerService";
import { InvoiceDto } from "../types/finance";
import { CreateInvoiceModal } from "../components/CreateInvoiceModal";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { toast } from "react-hot-toast";

export const InvoicesPage = () => {
 const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [processingId, setProcessingId] = useState<number | null>(null);
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

 const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info'|'warning'|'danger'; confirmText: string; onConfirm: () => void }>({ isOpen: false, title: "", message: "", type: "info", confirmText: "Confirm", onConfirm: () => {} });

 const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; invoiceId: number | null }>({ isOpen: false, invoiceId: null });
 const [paymentRef, setPaymentRef] = useState('');

 const confirmAction = (title: string, message: string, type: 'info' | 'warning' | 'danger', confirmText: string, action: () => Promise<void>) => {
  setConfirmModal({
   isOpen: true, title, message, type, confirmText,
   onConfirm: async () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    await action();
   }
  });
 };

 const totalRevenue = invoices.filter(i => i.status === 2).reduce((sum, i) => sum + i.totalAmount, 0);
 const outstandingBalance = invoices.filter(i => i.status === 1 || i.status === 3).reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0);
 const pendingInvoicesCount = invoices.filter(i => i.status === 1 || i.status === 3).length;

 const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K`
  : `$${n.toFixed(0)}`;

 const fetchInvoices = async () => {
  try {
   setLoading(true);
   const data = await invoiceService.getAll();
   setInvoices(data);
  } catch (error) {
   toast.error("Failed to load invoices.");
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { fetchInvoices(); }, []);

 const filteredInvoices = invoices.filter(inv =>
  inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (inv.customerName && inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
 );

 const handlePublishInvoice = (inv: InvoiceDto) => {
  confirmAction("Issue Invoice", "Are you sure you want to officially issue this invoice? We will also try to send an email to the customer.", "warning", "Issue", async () => {
   try {
    setProcessingId(inv.id);
    const customer = await customerService.getById(inv.customerId);
    let email = customer.email;
    if (!email) {
     email = window.prompt("The customer doesn't have an email address saved. Enter an email address to send the invoice to (or leave blank to skip):") || "";
    }
    if (email && email.trim() !== "") {
     await invoiceService.sendEmail(inv.id, email);
     await invoiceService.markAsIssued(inv.id);
     toast.success(`Invoice sent to ${email} and officially issued!`);
    } else {
     await invoiceService.markAsIssued(inv.id);
     toast.success("Invoice officially issued! (No email sent)");
    }
    fetchInvoices();
   } catch (error: any) {
    toast.error(error.response?.data?.Error || error.response?.data?.Message || "Failed to issue invoice.");
   } finally {
    setProcessingId(null);
   }
  });
 };

 const handleMarkAsPaid = (id: number) => {
  setPaymentRef('');
  setPaymentModal({ isOpen: true, invoiceId: id });
 };

 const handleConfirmPaid = async () => {
  if (!paymentModal.invoiceId) return;
  try {
   setProcessingId(paymentModal.invoiceId);
   setPaymentModal({ isOpen: false, invoiceId: null });
   await invoiceService.markAsPaidWithRef(paymentModal.invoiceId, paymentRef || undefined);
   toast.success('Invoice marked as paid!' + (paymentRef ? ` (Ref: ${paymentRef})` : ''));
   fetchInvoices();
  } catch (error) {
   toast.error((error as any).response?.data?.Error || (error as any).response?.data?.Message || 'Failed to mark invoice as paid.');
  } finally {
   setProcessingId(null);
  }
 };

 const handleCopyPortalLink = (invoice: InvoiceDto) => {
  const portalUrl = `${window.location.origin}/portal/invoices`;
  navigator.clipboard.writeText(portalUrl)
   .then(() => toast.success(`Portal link copied! Share with ${invoice.customerName || 'customer'} to pay invoice ${invoice.invoiceNumber}.`))
   .catch(() => toast.error("Failed to copy link."));
 };

 const handleViewPdf = async (id: number) => {
  try {
   setProcessingId(id);
   const blob = await invoiceService.downloadPdf(id);
   const url = window.URL.createObjectURL(blob);
   window.open(url, '_blank');
  } catch (error) {
   toast.error((error as any).response?.data?.Error || (error as any).response?.data?.Message || "Failed to load invoice PDF.");
  } finally {
   setProcessingId(null);
  }
 };

 const getStatusStyles = (status: number) => {
  switch (status) {
   case 0: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
   case 1: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
   case 2: return "bg-green-500/10 text-green-500 border-green-500/20";
   case 3: return "bg-red-500/10 text-red-500 border-red-500/20";
   default: return "bg-primary/10 text-primary border-primary/20";
  }
 };

 const getStatusText = (status: number) => {
  switch (status) {
   case 0: return "Draft";
   case 1: return "Issued";
   case 2: return "Paid";
   case 3: return "Overdue";
   case 4: return "Voided";
   default: return "Unknown";
  }
 };

 return (
  <div className="animate-in fade-in duration-500">
   {/* Header */}
   <div className="flex justify-between items-center mb-6">
    <div>
     <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
      <Receipt className="h-6 w-6 md:h-8 md:w-8 text-primary" />
      Invoices
     </h1>
     <p className="text-muted-foreground mt-0.5 text-sm">Manage receivables and process payments.</p>
    </div>
    <button
     onClick={() => setIsCreateModalOpen(true)}
     className="bg-primary text-primary-foreground px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-sm flex items-center gap-2 min-h-[44px]"
    >
     <Plus className="h-5 w-5" />
     <span className="hidden sm:inline">Create Invoice</span>
    </button>
   </div>

   {/* Stats */}
   <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
    <StatCard title="Total Revenue" value={fmt(totalRevenue)} subtitle="Paid invoices all time" icon={DollarSign} href="#" accentColor="emerald" trend="up" trendLabel="All time" />
    <StatCard title="Outstanding" value={fmt(outstandingBalance)} subtitle="Issued + overdue" icon={AlertTriangle} href="#" accentColor="rose" trend={outstandingBalance > 0 ? 'down' : 'neutral'} trendLabel={outstandingBalance > 0 ? 'Needs collection' : 'All cleared'} />
    <StatCard title="Pending" value={pendingInvoicesCount} subtitle="Awaiting payment" icon={FileText} href="#" accentColor="amber" />
   </div>

   {/* List Container */}
   <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
    <div className="p-4 border-b border-border">
     <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
       type="text"
       placeholder="Search invoice # or customer..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       className="bg-background/50 border border-border text-sm rounded-xl pl-9 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
      />
     </div>
    </div>

    {loading ? (
     <div className="flex justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
     </div>
    ) : filteredInvoices.length === 0 ? (
     <div className="p-12 text-center text-muted-foreground">
      <Receipt className="h-12 w-12 mx-auto mb-3 opacity-20" />
      <p className="font-medium">No invoices found</p>
     </div>
    ) : (
     <>
      {/* Mobile Card List */}
      <div className="block md:hidden divide-y divide-border/30">
       {filteredInvoices.map((inv) => (
        <div key={inv.id} className="p-4">
         <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-foreground">{inv.invoiceNumber}</span>
            <span className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${getStatusStyles(inv.status)}`}>
             {getStatusText(inv.status)}
            </span>
           </div>
           <p className="text-sm text-muted-foreground truncate">{inv.customerName || `Customer #${inv.customerId}`}</p>
           <p className="text-xs text-muted-foreground mt-0.5">
            {inv.workOrderId ? `WO-${inv.workOrderId}` : inv.quotationId ? `Quote-${inv.quotationId}` : 'Manual'} · Due {new Date(inv.dueDate).toLocaleDateString()}
           </p>
          </div>
          <div className="text-right shrink-0">
           <p className="font-bold text-foreground text-lg">${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
           {inv.status === 2 && inv.paymentReference && (<p className="text-xs text-muted-foreground">Ref: {inv.paymentReference}</p>)}
          </div>
         </div>
         <div className="flex gap-2 overflow-x-auto pb-0.5">
          <button onClick={() => handleViewPdf(inv.id)} disabled={processingId === inv.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-medium min-h-[40px] active:scale-95 transition-all disabled:opacity-50">
           {processingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} View PDF
          </button>
          {inv.status === 0 && (<button onClick={() => handlePublishInvoice(inv)} disabled={processingId === inv.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-500 text-xs font-medium min-h-[40px] active:scale-95 transition-all disabled:opacity-50"><Send className="h-4 w-4" /> Issue</button>)}
          {inv.status === 1 && (<button onClick={() => handleCopyPortalLink(inv)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-500 text-xs font-medium min-h-[40px] active:scale-95 transition-all"><Copy className="h-4 w-4" /> Copy Link</button>)}
          {inv.status === 1 && (<button onClick={() => handleMarkAsPaid(inv.id)} disabled={processingId === inv.id} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-green-500/30 bg-green-500/10 text-green-500 text-xs font-medium min-h-[40px] active:scale-95 transition-all disabled:opacity-50"><DollarSign className="h-4 w-4" /> Mark Paid</button>)}
         </div>
        </div>
       ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
       <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
         <tr>
          <th className="px-6 py-4 font-medium">Invoice Number</th>
          <th className="px-6 py-4 font-medium">Customer</th>
          <th className="px-6 py-4 font-medium">Amount</th>
          <th className="px-6 py-4 font-medium">Status</th>
          <th className="px-6 py-4 font-medium">Due Date</th>
          <th className="px-6 py-4 font-medium text-right">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
         {filteredInvoices.map((inv) => (
          <tr key={inv.id} className="hover:bg-muted transition-colors group">
           <td className="px-6 py-4">
            <div className="font-medium text-foreground">{inv.invoiceNumber}</div>
            <div className="text-xs text-muted-foreground">{inv.workOrderId ? `From WO-${inv.workOrderId}` : inv.quotationId ? `From Quote-${inv.quotationId}` : 'Manual'}</div>
           </td>
           <td className="px-6 py-4 font-medium">{inv.customerName || `Customer ID: ${inv.customerId}`}</td>
           <td className="px-6 py-4">
            <div className="font-bold text-foreground">${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            {inv.status === 2 && (<div className="text-xs text-green-500 mt-0.5">Paid: ${inv.amountPaid.toLocaleString()}</div>)}
            {inv.status === 2 && inv.paymentReference && (<div className="text-xs text-muted-foreground mt-0.5">Ref: {inv.paymentReference}</div>)}
           </td>
           <td className="px-6 py-4"><span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusStyles(inv.status)}`}>{getStatusText(inv.status)}</span></td>
           <td className="px-6 py-4 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
           <td className="px-6 py-4 text-right">
            <div className="flex justify-end space-x-2">
             <button onClick={() => handleViewPdf(inv.id)} disabled={processingId === inv.id} className="p-2 border border-primary/30 text-primary hover:bg-primary/20 rounded-lg bg-primary/10 disabled:opacity-50" title="View PDF">
              {processingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
             </button>
             {inv.status === 0 && (<button onClick={() => handlePublishInvoice(inv)} disabled={processingId === inv.id} className="p-2 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20 rounded-lg bg-blue-500/10 disabled:opacity-50" title="Issue Invoice"><Send className="h-4 w-4" /></button>)}
             {inv.status === 1 && (<button onClick={() => handleCopyPortalLink(inv)} className="p-2 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 rounded-lg bg-teal-500/10" title="Copy Portal Link"><Copy className="h-4 w-4" /></button>)}
             {inv.status === 1 && (<button onClick={() => handleMarkAsPaid(inv.id)} disabled={processingId === inv.id} className="p-2 border border-green-500/30 text-green-500 hover:bg-green-500/20 rounded-lg bg-green-500/10 disabled:opacity-50" title="Mark as Paid"><DollarSign className="h-4 w-4" /></button>)}
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

   {/* Payment Modal */}
   {paymentModal.isOpen && (
    <div className="fixed inset-0 z-[200] flex flex-col md:items-center md:justify-center bg-background md:bg-black/60 md:backdrop-blur-sm animate-in fade-in">
     <div className="flex flex-col flex-1 w-full md:max-w-md md:bg-card md:border md:border-border md:rounded-2xl md:shadow-2xl md:max-h-[90vh] md:flex-none overflow-hidden relative">
      <div className="hidden md:block absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:pt-6 md:pb-5 border-b border-border md:border-none bg-card shrink-0 shadow-sm md:shadow-none">
       <button onClick={() => setPaymentModal({ isOpen: false, invoiceId: null })} className="md:hidden text-sm font-medium text-muted-foreground p-2 -ml-2">Cancel</button>
       <h3 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2 truncate px-2"><DollarSign className="hidden md:block h-5 w-5 text-green-500 shrink-0" /> Record Payment</h3>
       <button onClick={handleConfirmPaid} className="md:hidden text-sm font-bold text-primary p-2 -mr-2">Confirm</button>
       <button onClick={() => setPaymentModal({ isOpen: false, invoiceId: null })} className="hidden md:block text-muted-foreground hover:text-foreground p-1"><X className="h-5 w-5" /></button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 pb-20 md:pb-6">
       <p className="text-sm text-muted-foreground mb-4">Enter check number, CC auth code, or any payment reference. <strong>Optional</strong> but helps track payments.</p>
       <div className="mb-4">
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Payment Reference (Check #, CC Auth, etc.)</label>
        <input type="text" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleConfirmPaid()} placeholder="e.g., Check #4521 or CC Auth: 89234" autoFocus className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-base min-h-[52px]" />
       </div>
       <div className="hidden md:flex gap-3 mt-6">
        <button onClick={() => setPaymentModal({ isOpen: false, invoiceId: null })} className="flex-1 border border-border px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors min-h-[48px]">Cancel</button>
        <button onClick={handleConfirmPaid} className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] active:scale-95 transition-all">Mark as Paid</button>
       </div>
      </div>
     </div>
    </div>
   )}

   <CreateInvoiceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={fetchInvoices} />
   <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} confirmText={confirmModal.confirmText} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
  </div>
 );
};
