import { useState, useEffect, useCallback } from "react";
import {
    BarChart2, Download, Mail, RefreshCw, Wrench, Package,
    ChevronDown, ChevronUp, TrendingUp, FileText, Calendar
} from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "../services/apiClient";

// ── Types ──────────────────────────────────────────────────────────────────────

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
    rows.push(`,,,,,,,\"Materials Total:\",${report.materialsSalesTotal.toFixed(2)}`);
    rows.push(`,,,,,,,\"Labor & Services Total:\",${report.laborServicesSalesTotal.toFixed(2)}`);
    rows.push(`,,,,,,,\"Grand Total:\",${report.grandTotal.toFixed(2)}`);
    const blob = new Blob([rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `WeeklyReport_${report.dateFrom.split("T")[0]}_to_${report.dateTo.split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── Breakdown Section ─────────────────────────────────────────────────────────

function BreakdownSection({ title, icon, items, total, accentClass }: {
    title: string;
    icon:  React.ReactNode;
    items: ReportLineItem[];
    total: number;
    accentClass: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex w-full items-center justify-between px-4 py-4 hover:bg-muted/40 active:bg-muted/60 transition-colors"
            >
                <div className="flex items-center gap-3 font-semibold text-foreground">
                    <div className={`p-2 rounded-xl ${accentClass} bg-opacity-15`}>{icon}</div>
                    <div className="text-left">
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="text-xs text-muted-foreground font-normal">{items.length} line item{items.length !== 1 ? "s" : ""}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-base font-bold ${accentClass}`}>{fmt(total)}</span>
                    {open ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                </div>
            </button>

            {open && (
                <div className="border-t border-border">
                    {items.length === 0 ? (
                        <p className="px-5 py-5 text-sm text-muted-foreground text-center">No items in this category for the selected period.</p>
                    ) : (
                        <>
                            {/* Mobile cards */}
                            <div className="block md:hidden divide-y divide-border/30">
                                {items.map((r, i) => (
                                    <div key={i} className="p-4">
                                        <div className="flex justify-between items-start gap-3 mb-1">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm text-foreground truncate">{r.description}</p>
                                                <p className="text-xs text-muted-foreground">{r.customerName} · {r.invoiceNumber}</p>
                                            </div>
                                            <p className={`font-bold text-sm shrink-0 ${accentClass}`}>{fmt(r.lineTotal)}</p>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Qty {r.quantity} × {fmt(r.unitPrice)} · {r.invoiceDate.split("T")[0]}</p>
                                    </div>
                                ))}
                                <div className="px-4 py-3 bg-muted/30 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-muted-foreground">Subtotal</span>
                                    <span className={`text-base font-bold ${accentClass}`}>{fmt(total)}</span>
                                </div>
                            </div>
                            {/* Desktop table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-2.5 text-left font-medium">Invoice #</th>
                                            <th className="px-4 py-2.5 text-left font-medium">Customer</th>
                                            <th className="px-4 py-2.5 text-left font-medium">Description</th>
                                            <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                                            <th className="px-4 py-2.5 text-right font-medium">Unit</th>
                                            <th className="px-4 py-2.5 text-right font-medium">Total</th>
                                            <th className="px-4 py-2.5 text-left font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((r, i) => (
                                            <tr key={i} className="border-t border-border hover:bg-muted/30">
                                                <td className="px-4 py-2.5 font-mono text-xs">{r.invoiceNumber}</td>
                                                <td className="px-4 py-2.5">{r.customerName}</td>
                                                <td className="px-4 py-2.5 max-w-xs truncate">{r.description}</td>
                                                <td className="px-4 py-2.5 text-right">{r.quantity}</td>
                                                <td className="px-4 py-2.5 text-right">{fmt(r.unitPrice)}</td>
                                                <td className={`px-4 py-2.5 text-right font-semibold ${accentClass}`}>{fmt(r.lineTotal)}</td>
                                                <td className="px-4 py-2.5 text-muted-foreground">{r.invoiceDate.split("T")[0]}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted/20">
                                        <tr className="border-t border-border font-semibold">
                                            <td colSpan={5} className="px-4 py-2.5 text-right text-muted-foreground">Subtotal</td>
                                            <td className={`px-4 py-2.5 text-right ${accentClass}`}>{fmt(total)}</td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function WeeklyReportPage() {
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
            await apiClient.post(`/invoice/weekly-report/send?start=${weekStart}&end=${weekEnd}`,
                `"${sendEmail}"`,
                { headers: { "Content-Type": "application/json" } }
            );
            toast.success("Report emailed successfully!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || "Failed to send email");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                        <BarChart2 className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />
                        Weekly Report
                    </h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        Materials & labor totals from paid invoices — ready for your books.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="border border-border bg-card hover:bg-muted text-foreground px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 min-h-[44px] active:scale-95 transition-all"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    {report && (
                        <button
                            onClick={() => downloadCsv(report)}
                            className="bg-primary text-primary-foreground px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 min-h-[44px] active:scale-95 transition-all hover:bg-primary/90"
                        >
                            <Download size={15} />
                            <span className="hidden sm:inline">CSV</span>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Date Range Picker ── */}
            <div className="bg-card border border-border rounded-2xl p-4 mb-6 shadow-sm">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Date Range
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                    <div className="flex-1">
                        <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Week Start</label>
                        <input
                            type="date"
                            value={weekStart}
                            onChange={e => setWeekStart(e.target.value)}
                            className="w-full border border-border rounded-xl px-3 py-3 text-sm bg-background focus:outline-none focus:border-primary min-h-[48px]"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-muted-foreground mb-1.5 font-medium">Week End</label>
                        <input
                            type="date"
                            value={weekEnd}
                            onChange={e => setWeekEnd(e.target.value)}
                            className="w-full border border-border rounded-xl px-3 py-3 text-sm bg-background focus:outline-none focus:border-primary min-h-[48px]"
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="sm:w-auto w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all min-h-[48px] disabled:opacity-60"
                    >
                        {loading ? "Loading…" : "Generate"}
                    </button>
                </div>
            </div>

            {/* ── Loading ── */}
            {loading && !report && (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Generating report…
                </div>
            )}

            {/* ── Report Content ── */}
            {report && (
                <div className="space-y-5">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Materials */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-400 rounded-t-2xl" />
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
                                <div className="p-1.5 bg-blue-500/10 rounded-lg"><Package size={14} className="text-blue-500" /></div>
                                Materials Sales
                            </div>
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                                {fmt(report.materialsSalesTotal)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {report.materialsBreakdown.length} line item{report.materialsBreakdown.length !== 1 ? "s" : ""}
                            </div>
                        </div>

                        {/* Labor */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-2xl" />
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg"><Wrench size={14} className="text-emerald-500" /></div>
                                Labor & Services
                            </div>
                            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                                {fmt(report.laborServicesSalesTotal)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {report.laborServicesBreakdown.length} line item{report.laborServicesBreakdown.length !== 1 ? "s" : ""}
                            </div>
                        </div>

                        {/* Grand Total */}
                        <div className="bg-primary/5 border border-primary/30 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-violet-500 rounded-t-2xl" />
                            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-3">
                                <div className="p-1.5 bg-primary/10 rounded-lg"><TrendingUp size={14} className="text-primary" /></div>
                                Grand Total
                            </div>
                            <div className="text-3xl font-bold text-primary mb-1">
                                {fmt(report.grandTotal)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                from {report.paidInvoiceCount} paid invoice{report.paidInvoiceCount !== 1 ? "s" : ""}
                            </div>
                        </div>
                    </div>

                    {/* Period label */}
                    <p className="text-xs text-muted-foreground text-right flex items-center justify-end gap-1.5">
                        <Calendar size={12} />
                        Period: {new Date(report.dateFrom).toLocaleDateString()} – {new Date(report.dateTo).toLocaleDateString()}
                    </p>

                    {/* Breakdown sections */}
                    <BreakdownSection
                        title="Materials Breakdown"
                        icon={<Package size={16} className="text-blue-500" />}
                        items={report.materialsBreakdown}
                        total={report.materialsSalesTotal}
                        accentClass="text-blue-600 dark:text-blue-400"
                    />
                    <BreakdownSection
                        title="Labor & Services Breakdown"
                        icon={<Wrench size={16} className="text-emerald-500" />}
                        items={report.laborServicesBreakdown}
                        total={report.laborServicesSalesTotal}
                        accentClass="text-emerald-600 dark:text-emerald-400"
                    />

                    {/* Email delivery */}
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                            <div className="p-1.5 bg-primary/10 rounded-lg"><Mail size={14} className="text-primary" /></div>
                            Email This Report
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                placeholder="accounting@example.com"
                                value={sendEmail}
                                onChange={e => setSendEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendEmail()}
                                className="flex-1 border border-border rounded-xl px-3 py-3 text-sm bg-background focus:outline-none focus:border-primary min-h-[48px]"
                            />
                            <button
                                onClick={handleSendEmail}
                                disabled={sending}
                                className="sm:w-auto w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-95 transition-all min-h-[48px] disabled:opacity-60"
                            >
                                <Mail size={14} />
                                {sending ? "Sending…" : "Send Report"}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                            <FileText size={12} className="shrink-0 mt-0.5" />
                            An HTML email with a QuickBooks-compatible CSV attachment will be sent to the address above.
                        </p>
                    </div>

                    {/* Download CTA */}
                    <button
                        onClick={() => downloadCsv(report)}
                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-border hover:border-primary/50 rounded-2xl text-sm font-medium text-muted-foreground hover:text-primary transition-all active:scale-95"
                    >
                        <Download size={16} />
                        Download CSV for QuickBooks
                    </button>
                </div>
            )}

            {!loading && !report && (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                    <BarChart2 size={40} className="opacity-20" />
                    <p className="font-medium">No report data</p>
                    <p className="text-sm">Select a date range and click Generate.</p>
                </div>
            )}
        </div>
    );
}
