import { useState, useEffect, useCallback } from "react";
import { BarChart2, Download, Mail, RefreshCw, Wrench, Package, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../services/apiClient";

// Helper to get the stored JWT token
function getAuthToken(): string {
    return sessionStorage.getItem("token") ?? "";
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReportLineItem {
    invoiceNumber: string;
    customerName:  string;
    description:   string;
    quantity:      number;
    unitPrice:     number;
    lineTotal:     number;
    invoiceDate:   string;
}

interface WeeklyReport {
    dateFrom:                string;
    dateTo:                  string;
    materialsSalesTotal:     number;
    laborServicesSalesTotal: number;
    grandTotal:              number;
    paidInvoiceCount:        number;
    materialsBreakdown:      ReportLineItem[];
    laborServicesBreakdown:  ReportLineItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function toIso(d: Date): string {
    return d.toISOString().split("T")[0];
}

function fmt(n: number): string {
    return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function downloadCsv(report: WeeklyReport) {
    const rows: string[] = [
        "Category,Invoice #,Customer,Description,Qty,Unit Price,Line Total,Invoice Date",
    ];

    const appendRows = (items: ReportLineItem[], category: string) => {
        items.forEach(r => {
            rows.push(
                `"${category}","${r.invoiceNumber}","${r.customerName.replace(/"/g, '""')}",` +
                `"${r.description.replace(/"/g, '""')}",${r.quantity},${r.unitPrice.toFixed(2)},` +
                `${r.lineTotal.toFixed(2)},${r.invoiceDate.split("T")[0]}`
            );
        });
    };

    appendRows(report.materialsBreakdown, "Material");
    appendRows(report.laborServicesBreakdown, "Labor / Flat Rate Service");

    rows.push("");
    rows.push(`,,,,,,,"Materials Total:",${report.materialsSalesTotal.toFixed(2)}`);
    rows.push(`,,,,,,,"Labor & Services Total:",${report.laborServicesSalesTotal.toFixed(2)}`);
    rows.push(`,,,,,,,"Grand Total:",${report.grandTotal.toFixed(2)}`);

    const blob = new Blob([rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `WeeklyReport_${report.dateFrom.split("T")[0]}_to_${report.dateTo.split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Breakdown table ───────────────────────────────────────────────────────────

function BreakdownTable({ title, icon, items, total, color }: {
    title: string;
    icon:  React.ReactNode;
    items: ReportLineItem[];
    total: number;
    color: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-lg border border-border bg-card mt-4">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
            >
                <div className="flex items-center gap-2 font-medium text-foreground">
                    {icon} {title}
                    <span className={`ml-2 text-sm font-semibold ${color}`}>{fmt(total)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    {items.length} line item{items.length !== 1 ? "s" : ""}
                    {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </div>
            </button>

            {open && (
                <div className="overflow-x-auto border-t border-border">
                    {items.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">No items in this category for the selected week.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2 text-left">Invoice #</th>
                                    <th className="px-4 py-2 text-left">Customer</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Unit Price</th>
                                    <th className="px-4 py-2 text-right">Line Total</th>
                                    <th className="px-4 py-2 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((r, i) => (
                                    <tr key={i} className="border-t border-border hover:bg-muted/30">
                                        <td className="px-4 py-2 font-mono">{r.invoiceNumber}</td>
                                        <td className="px-4 py-2">{r.customerName}</td>
                                        <td className="px-4 py-2 max-w-xs truncate">{r.description}</td>
                                        <td className="px-4 py-2 text-right">{r.quantity}</td>
                                        <td className="px-4 py-2 text-right">{fmt(r.unitPrice)}</td>
                                        <td className="px-4 py-2 text-right font-medium">{fmt(r.lineTotal)}</td>
                                        <td className="px-4 py-2 text-muted-foreground">{r.invoiceDate.split("T")[0]}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-muted/20">
                                <tr className="border-t border-border font-semibold">
                                    <td colSpan={5} className="px-4 py-2 text-right">Subtotal</td>
                                    <td className={`px-4 py-2 text-right ${color}`}>{fmt(total)}</td>
                                    <td/>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function WeeklyReportPage() {
    // Default week range: current Mon–Sun
    const today  = new Date();
    const monday = getMonday(new Date(today));
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);

    const [weekStart, setWeekStart] = useState(toIso(monday));
    const [weekEnd,   setWeekEnd]   = useState(toIso(sunday));
    const [report,    setReport]    = useState<WeeklyReport | null>(null);
    const [loading,   setLoading]   = useState(false);
    const [sendEmail, setSendEmail] = useState("");
    const [sending,   setSending]   = useState(false);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get(`/invoice/weekly-report?start=${weekStart}&end=${weekEnd}`);
            setReport(res.data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to load report");
        } finally {
            setLoading(false);
        }
    }, [weekStart, weekEnd]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    const handleSendEmail = async () => {
        if (!sendEmail) { toast.error("Enter an email address first."); return; }
        setSending(true);
        try {
            const res = await apiClient.post(`/invoice/weekly-report/send?start=${weekStart}&end=${weekEnd}`, 
                `"${sendEmail}"`, 
                { headers: { "Content-Type": "application/json" } }
            );
            toast.success("Email sent successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to send email");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart2 className="text-primary" size={26}/> Weekly Accounting Report
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Materials sales and labor/service totals from paid invoices — ready for your books.
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="flex items-center gap-1 px-3 py-2 rounded-md border border-border bg-card hover:bg-muted text-sm transition-colors"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""}/> Refresh
                    </button>
                    {report && (
                        <button
                            onClick={() => downloadCsv(report)}
                            className="flex items-center gap-1 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                        >
                            <Download size={14}/> Download CSV
                        </button>
                    )}
                </div>
            </div>

            {/* ── Date range picker ───────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-4 items-end mb-6 bg-card border border-border rounded-lg p-4">
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Week Start</label>
                    <input
                        type="date"
                        value={weekStart}
                        onChange={e => setWeekStart(e.target.value)}
                        className="border border-input rounded px-3 py-1.5 text-sm bg-background"
                    />
                </div>
                <div>
                    <label className="block text-xs text-muted-foreground mb-1">Week End</label>
                    <input
                        type="date"
                        value={weekEnd}
                        onChange={e => setWeekEnd(e.target.value)}
                        className="border border-input rounded px-3 py-1.5 text-sm bg-background"
                    />
                </div>
                <button
                    onClick={fetchReport}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                    {loading ? "Loading…" : "Generate Report"}
                </button>
            </div>

            {/* ── Summary cards ───────────────────────────────────────────────── */}
            {report && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                        {/* Materials */}
                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                <Package size={16}/> Materials Sales
                            </div>
                            <div className="text-3xl font-bold text-blue-600">
                                {fmt(report.materialsSalesTotal)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {report.materialsBreakdown.length} line item{report.materialsBreakdown.length !== 1 ? "s" : ""}
                            </div>
                        </div>

                        {/* Labor */}
                        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                <Wrench size={16}/> Labor & Flat Rate Services
                            </div>
                            <div className="text-3xl font-bold text-emerald-600">
                                {fmt(report.laborServicesSalesTotal)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {report.laborServicesBreakdown.length} line item{report.laborServicesBreakdown.length !== 1 ? "s" : ""}
                            </div>
                        </div>

                        {/* Grand total */}
                        <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                                <BarChart2 size={16}/> Grand Total
                            </div>
                            <div className="text-3xl font-bold text-primary">
                                {fmt(report.grandTotal)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                                from {report.paidInvoiceCount} paid invoice{report.paidInvoiceCount !== 1 ? "s" : ""}
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-4 text-right">
                        Period: {new Date(report.dateFrom).toLocaleDateString()} – {new Date(report.dateTo).toLocaleDateString()}
                    </p>

                    {/* ── Breakdown tables ──────────────────────────────────────── */}
                    <BreakdownTable
                        title="Materials Breakdown"
                        icon={<Package size={16}/>}
                        items={report.materialsBreakdown}
                        total={report.materialsSalesTotal}
                        color="text-blue-600"
                    />
                    <BreakdownTable
                        title="Labor & Flat Rate Services Breakdown"
                        icon={<Wrench size={16}/>}
                        items={report.laborServicesBreakdown}
                        total={report.laborServicesSalesTotal}
                        color="text-emerald-600"
                    />

                    {/* ── Email delivery ────────────────────────────────────────── */}
                    <div className="mt-6 rounded-lg border border-border bg-card p-4">
                        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Mail size={15}/> Email This Report
                        </h2>
                        <div className="flex gap-2 flex-wrap">
                            <input
                                type="email"
                                placeholder="accounting@example.com"
                                value={sendEmail}
                                onChange={e => setSendEmail(e.target.value)}
                                className="flex-1 min-w-48 border border-input rounded px-3 py-1.5 text-sm bg-background"
                            />
                            <button
                                onClick={handleSendEmail}
                                disabled={sending}
                                className="flex items-center gap-1 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                            >
                                <Mail size={14}/> {sending ? "Sending…" : "Send Report"}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            An HTML email with a CSV attachment (QuickBooks-compatible) will be sent to the address above.
                            Automated weekly delivery every Monday is configured via the Admin panel.
                        </p>
                    </div>
                </>
            )}

            {loading && !report && (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                    <RefreshCw size={16} className="animate-spin mr-2"/> Generating report…
                </div>
            )}
        </div>
    );
}


