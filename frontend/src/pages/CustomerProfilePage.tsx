import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Phone, Mail, MapPin, FileText, Printer,
  Wrench, CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { customerService } from "../services/customerService";
import { workOrderService } from "../services/workOrderService";
import { invoiceService } from "../services/invoiceService";
import { CustomerDto as Customer } from "../types/customer";
import { WorkOrderDto } from "../types/field";
import { InvoiceDto } from "../types/finance";

type Tab = "jobs" | "invoices" | "payments" | "balance";

const statusBadge = (status: string) => {
  if (status === "Completed" || status === "Approved")
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (status === "InProgress")
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (status === "WaitingForParts")
    return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (status === "PendingQuote")
    return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  return "bg-primary/10 text-primary border-primary/20";
};

const invStatusLabel = (status: number) => {
  if (status === 2) return { label: "Paid", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
  if (status === 3) return { label: "Overdue", cls: "bg-red-500/10 text-red-500 border-red-500/20" };
  if (status === 1) return { label: "Issued", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
  if (status === 4) return { label: "Void", cls: "bg-muted text-muted-foreground border-border" };
  return { label: "Draft", cls: "bg-muted text-muted-foreground border-border" };
};

export const CustomerProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrderDto[]>([]);
  const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("jobs");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [custList, wos, invs] = await Promise.all([
          customerService.getAll(),
          workOrderService.getByCustomer(Number(id)).catch(() => []),
          invoiceService.getAll().catch(() => [])
        ]);
        const cust = custList.find(c => c.id === Number(id));
        setCustomer(cust || null);

        // Work orders from dedicated endpoint; fallback to name match
        if (wos.length > 0) {
          setWorkOrders(wos);
        } else if (cust) {
          const filtered = (await workOrderService.getAll()).filter(
            w => w.customerName === cust.name || w.customerName === cust.companyName
          );
          setWorkOrders(filtered);
        }

        // Invoices filtered by customerId
        const filteredInvs = invs.filter(i => i.customerId === Number(id));
        setInvoices(filteredInvs);
      } catch (err) {
        console.error("Failed to load customer profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="p-12 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
  if (!customer) return (
    <div className="p-12 text-center text-muted-foreground">Customer not found</div>
  );

  // Balance calculations
  const totalBilled = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const outstanding = totalBilled - totalPaid;
  const completedJobs = workOrders.filter(w => w.status === "Completed" || w.status === "Approved").length;

  const paidInvoices = invoices.filter(i => i.status === 2);
  const unpaidInvoices = invoices.filter(i => i.status !== 2 && i.status !== 4);

  const tabs: { key: Tab; label: string; count?: number; icon: any }[] = [
    { key: "jobs", label: "Jobs", count: workOrders.length, icon: Wrench },
    { key: "invoices", label: "Invoices", count: invoices.length, icon: FileText },
    { key: "payments", label: "Payments", count: paidInvoices.length, icon: CheckCircle2 },
    { key: "balance", label: "Balance", icon: AlertCircle },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-24 max-w-5xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate("/customers")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to Customers
      </button>

      {/* Header Card */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-start justify-between border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{customer.name}</h1>
            {customer.companyName && <p className="text-muted-foreground font-medium">{customer.companyName}</p>}
          </div>
          {/* KPI pills */}
          <div className="flex flex-wrap gap-3">
            <div className="bg-card border border-border rounded-xl px-4 py-2 text-center min-w-[90px]">
              <p className="text-2xl font-bold text-foreground">{workOrders.length}</p>
              <p className="text-xs text-muted-foreground">Total Jobs</p>
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-2 text-center min-w-[90px]">
              <p className="text-2xl font-bold text-emerald-500">{completedJobs}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-2 text-center min-w-[90px]">
              <p className="text-2xl font-bold text-primary">\${totalBilled.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Total Billed</p>
            </div>
            <div className={`border rounded-xl px-4 py-2 text-center min-w-[90px] ${outstanding > 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
              <p className={`text-2xl font-bold ${outstanding > 0 ? "text-red-500" : "text-emerald-500"}`}>\${outstanding.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </div>

        {/* Contact info row */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0"><Phone className="h-4 w-4" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-sm">{customer.phone || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0"><Mail className="h-4 w-4" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-sm truncate max-w-[180px]">{customer.email || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0"><MapPin className="h-4 w-4" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium text-sm truncate max-w-[180px]">{customer.address || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-xl border border-border mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-h-[40px] ${activeTab === t.key ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "jobs" && (
        <div className="space-y-3">
          {workOrders.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              <Wrench className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No jobs found for this customer.</p>
            </div>
          ) : workOrders.map(wo => (
            <div
              key={wo.id}
              onClick={() => navigate(`/work-orders?edit=${wo.id}`)}
              className="bg-card border border-border rounded-2xl p-4 shadow-sm hover:border-primary/40 cursor-pointer transition-all active:scale-[0.99] flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">WO-{wo.id.toString().padStart(4, "0")}</span>
                  <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${statusBadge(wo.status)}`}>{wo.status}</span>
                </div>
                <p className="font-semibold text-foreground leading-snug truncate">{wo.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{wo.siteName || "—"} · {wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : "Unscheduled"}</p>
              </div>
              {wo.technicianName && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg shrink-0">{wo.technicianName}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No invoices found.</p>
            </div>
          ) : invoices.map(inv => {
            const { label, cls } = invStatusLabel(inv.status);
            return (
              <div key={inv.id} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm">{inv.invoiceNumber}</span>
                    <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Issued: {new Date(inv.issueDate).toLocaleDateString()} · Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                  {inv.paymentReference && <p className="text-xs text-muted-foreground mt-0.5">Ref: {inv.paymentReference}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="font-bold text-foreground">\${inv.totalAmount.toFixed(2)}</p>
                    {inv.amountPaid > 0 && inv.amountPaid < inv.totalAmount && (
                      <p className="text-xs text-muted-foreground">Paid: \${inv.amountPaid.toFixed(2)}</p>
                    )}
                  </div>
                  <button
                    onClick={async e => {
                      e.stopPropagation();
                      try {
                        const blob = await invoiceService.downloadPdf(inv.id);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = `Invoice_${inv.invoiceNumber}.pdf`;
                        document.body.appendChild(a); a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } catch { /**/ }
                    }}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-3">
          {paidInvoices.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>No payments recorded yet.</p>
            </div>
          ) : paidInvoices.map(inv => (
            <div key={inv.id} className="bg-card border border-emerald-500/20 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="font-bold text-sm">{inv.invoiceNumber}</span>
                </div>
                <p className="text-xs text-muted-foreground">Paid on: {new Date(inv.dueDate).toLocaleDateString()}</p>
                {inv.paymentReference && <p className="text-xs text-muted-foreground mt-0.5">Ref: {inv.paymentReference}</p>}
              </div>
              <span className="font-bold text-emerald-500 text-lg shrink-0">\${inv.totalAmount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === "balance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Billed</p>
              <p className="text-3xl font-bold text-foreground">\${totalBilled.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-card border border-emerald-500/20 rounded-2xl p-5 text-center shadow-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Paid</p>
              <p className="text-3xl font-bold text-emerald-500">\${totalPaid.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{paidInvoices.length} paid</p>
            </div>
            <div className={`border rounded-2xl p-5 text-center shadow-sm ${outstanding > 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Outstanding</p>
              <p className={`text-3xl font-bold ${outstanding > 0 ? "text-red-500" : "text-emerald-500"}`}>\${outstanding.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">{unpaidInvoices.length} unpaid</p>
            </div>
          </div>

          {unpaidInvoices.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Outstanding Invoices</h3>
              <div className="space-y-2">
                {unpaidInvoices.map(inv => {
                  const { label, cls } = invStatusLabel(inv.status);
                  const balance = inv.totalAmount - (inv.amountPaid || 0);
                  return (
                    <div key={inv.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{inv.invoiceNumber}</span>
                          <span className={`text-xs border px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-red-500">\${balance.toFixed(2)}</p>
                        {inv.amountPaid > 0 && <p className="text-xs text-muted-foreground">of \${inv.totalAmount.toFixed(2)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
