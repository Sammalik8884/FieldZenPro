import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, Camera, CheckCircle2, AlertTriangle, Printer } from "lucide-react";
import { customerService } from "../services/customerService";
import { workOrderService } from "../services/workOrderService";
import { invoiceService } from "../services/invoiceService";
import { Customer } from "../types/crm";
import { WorkOrderDto } from "../types/crm";
import { InvoiceDto } from "../types/finance";
import { Loader2 } from "lucide-react";

export const CustomerProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [workOrders, setWorkOrders] = useState<WorkOrderDto[]>([]);
    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // We'd ideally have an endpoint for this, but let's fetch all and filter for now
                // In a real prod environment we'd fetch specific customer data.
                const cust = await customerService.getAll();
                const matchedCust = cust.find(c => c.id === Number(id));
                if (matchedCust) setCustomer(matchedCust);

                // Assuming we can fetch all work orders and invoices, then filter by customer name or ID
                const wos = await workOrderService.getAll(1, 100);
                // The WorkOrderDto doesn't strictly give us CustomerId easily, it gives CustomerName
                // We'll filter loosely or if backend has it. 
                const matchedWos = wos.data.filter(w => w.customerName === matchedCust?.name || w.customerName === matchedCust?.companyName);
                setWorkOrders(matchedWos);

                const invs = await invoiceService.getAll();
                const matchedInvs = invs.filter(i => i.customerName === matchedCust?.name || i.customerName === matchedCust?.companyName);
                setInvoices(matchedInvs);
            } catch (error) {
                console.error("Failed to load customer profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!customer) return <div className="p-12 text-center">Customer not found</div>;

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Customers
            </button>

            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-8">
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-border bg-secondary/30">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground mb-1">{customer.name}</h1>
                        {customer.companyName && <p className="text-muted-foreground">{customer.companyName}</p>}
                    </div>
                </div>
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Phone className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium text-sm">{customer.phone || 'N/A'}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Mail className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-sm truncate max-w-[150px]">{customer.email || 'N/A'}</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><MapPin className="h-5 w-5" /></div>
                        <div><p className="text-xs text-muted-foreground">Address</p><p className="font-medium text-sm truncate max-w-[150px]">{customer.address || 'N/A'}</p></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Work Orders */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> Job History</h2>
                    {workOrders.length === 0 ? <p className="text-muted-foreground text-sm">No jobs found for this customer.</p> : (
                        workOrders.map(wo => (
                            <div key={wo.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-primary text-sm">WO-{wo.id.toString().padStart(4, '0')}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${wo.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                        {wo.status}
                                    </span>
                                </div>
                                <p className="text-sm font-medium mb-1 line-clamp-1">{wo.description}</p>
                                <p className="text-xs text-muted-foreground">{wo.scheduledDate ? new Date(wo.scheduledDate).toLocaleDateString() : 'Unscheduled'}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* Invoices */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Printer className="h-5 w-5" /> Invoices</h2>
                    {invoices.length === 0 ? <p className="text-muted-foreground text-sm">No invoices found.</p> : (
                        invoices.map(inv => (
                            <div key={inv.id} className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-primary/30 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm">{inv.invoiceNumber}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Issued: {new Date(inv.issueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold">${inv.totalAmount.toFixed(2)}</span>
                                    <button onClick={() => window.open(`/api/invoice/${inv.id}/pdf`, "_blank")} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Print/Download PDF">
                                        <Printer className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
