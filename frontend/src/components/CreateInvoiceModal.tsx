import { ModalPortal } from "./common/ModalPortal";
import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, CheckCircle2, Smartphone, Mail, Printer, Send, DollarSign } from "lucide-react";
import { CreateInvoiceDto, CreateInvoiceItemDto } from "../types/finance";
import { invoiceService } from "../services/invoiceService";
import { customerService } from "../services/customerService";
import { productService } from "../services/productService";
import { assetService } from "../services/assetService";
import { CustomerDto } from "../types/customer";
import { ProductDto } from "../types/product";
import { AssetDto } from "../types/field";
import { toast } from "react-hot-toast";

import { WorkOrderItemDto } from "../services/workOrderService";

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialCustomerId?: number;
    initialLaborCost?: number;
    workOrderId?: number;
    preloadedItems?: WorkOrderItemDto[];
}

interface InvoiceLineItem extends CreateInvoiceItemDto {
    type: "product" | "asset" | "custom";
    itemId?: number;
    isTaxable?: boolean;
}

export const CreateInvoiceModal = ({ isOpen, onClose, onSuccess, initialCustomerId, initialLaborCost, workOrderId, preloadedItems }: CreateInvoiceModalProps) => {
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [createdInvoice, setCreatedInvoice] = useState<{ id: number, number: string } | null>(null);
    const [emailPromptVisible, setEmailPromptVisible] = useState(false);
    const [customerEmail, setCustomerEmail] = useState("");
    const [sendingEmail, setSendingEmail] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Check' | 'CreditCard' | 'PaymentLink' | ''>('');
    const [paymentRef, setPaymentRef] = useState('');
    const [paymentRecorded, setPaymentRecorded] = useState(false);
    const needsRef = paymentMethod === 'Check' || paymentMethod === 'CreditCard';

    // Dropdown Data State
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [assets, setAssets] = useState<AssetDto[]>([]);

    // Form State
    const [customerId, setCustomerId] = useState<number | "">(initialCustomerId || "");
    const [customerSearch, setCustomerSearch] = useState("");
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
    const [technicianNotes, setTechnicianNotes] = useState("");
    const [items, setItems] = useState<InvoiceLineItem[]>(() => {
        // Preloaded job items take priority
        if (preloadedItems && preloadedItems.length > 0) {
            return preloadedItems.map(i => {
                const isLabor = i.description?.toLowerCase().includes("labor") || i.description?.toLowerCase().includes("service");
                return {
                    type: isLabor ? "custom" : "product",
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    isTaxable: i.isTaxable
                } as InvoiceLineItem;
            });
        }
        if (initialLaborCost !== undefined && initialLaborCost > 0) {
            return [{ type: "custom", description: "Technician Labor (Time tracked)", quantity: 1, unitPrice: initialLaborCost, isTaxable: false }];
        }
        return [{ type: "custom", description: "", quantity: 1, unitPrice: 0, isTaxable: false }];
    });
    const [taxRate, setTaxRate] = useState(5.5);

    // Derived values
    const subTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxableAmount = items.filter(i => i.isTaxable).reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxAmount = taxableAmount * (taxRate / 100);
    const totalAmount = subTotal + taxAmount;

    useEffect(() => {
        if (isOpen) {
            const loadData = async () => {
                setDataLoading(true);
                try {
                    const [custs, prods, asts] = await Promise.all([
                        customerService.getAll(),
                        productService.getAll(1, 200), // Get lots of products for the dropdown
                        assetService.getAll()
                    ]);
                    setCustomers(custs);
                    setProducts(prods);
                    setAssets(asts);
                    if (initialCustomerId) {
                        const matched = custs.find(c => c.id === initialCustomerId);
                        if (matched) {
                            setCustomerSearch(matched.name);
                            setCustomerId(matched.id); 
                            if(matched.email) setCustomerEmail(matched.email);
                        }
                    }
                } catch (error) {
                    toast.error("Failed to load select options.");
                    console.error("Failed to load options", error);
                } finally {
                    setDataLoading(false);
                }
            };
            loadData();
        } else {
            // Reset form when closed
            setCustomerId(initialCustomerId || "");
            if (initialLaborCost !== undefined && initialLaborCost > 0) {
                setItems([{ type: "custom", description: "Technician Labor (Time tracked)", quantity: 1, unitPrice: initialLaborCost, isTaxable: false }]);
            } else {
                setItems([{ type: "custom", description: "", quantity: 1, unitPrice: 0, isTaxable: false }]);
            }
            setTaxRate(5.5);
        }
    }, [isOpen, initialCustomerId, initialLaborCost]);

    if (!isOpen) return null;

    const handleAddItem = (type: "product" | "asset" | "custom") => {
        setItems([...items, { type, description: "", quantity: 1, unitPrice: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
        const newItems = [...items];
        // @ts-ignore dynamic field assignment
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSelectOption = (index: number, itemId: number, type: "product" | "asset") => {
        const newItems = [...items];
        if (type === "product") {
            const product = products.find(p => p.id === itemId);
            if (product) {
                newItems[index] = { ...newItems[index], itemId, description: product.name, unitPrice: product.price || 0, isTaxable: product.isTaxable };
            }
        } else {
            const asset = assets.find(a => a.id === itemId);
            if (asset) {
                newItems[index] = { ...newItems[index], itemId, description: asset.name, unitPrice: 0, isTaxable: false };
            }
        }
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerId) {
            toast.error("Please select a valid Customer");
            return;
        }

        if (items.some(i => !i.description || i.quantity <= 0 || i.unitPrice < 0)) {
            toast.error("Please ensure all items have a valid selection/description, quantity and price.");
            return;
        }

        const dto: CreateInvoiceDto = {
            customerId: Number(customerId),
            workOrderId: workOrderId,
            issueDate: new Date(issueDate).toISOString(),
            dueDate: new Date(dueDate).toISOString(),
            subTotal,
            taxAmount,
            totalAmount,
            status: 0, // Draft
            technicianNotes,
            items: items.map(i => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                isTaxable: i.isTaxable || false,
                itemCategory: i.type === "product" ? 0 : 1
            }))
        };

        try {
             setLoading(true);
             const res = await invoiceService.createCustom(dto);
             toast.success("Invoice generated successfully!");
             setCreatedInvoice({ id: res.invoiceId, number: res.invoiceNumber });
         } catch (error: any) {
            toast.error(error.response?.data?.Error || "Failed to create invoice.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalPortal>
          <div className="fixed inset-0 z-[200] flex flex-col md:items-center md:justify-center bg-background md:bg-black/60 md:backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex flex-col flex-1 w-full md:max-w-4xl md:bg-card md:border md:border-border md:rounded-2xl md:shadow-2xl md:max-h-[92vh] overflow-hidden relative md:flex-none">
                {createdInvoice ? (
                    <div className="p-4 sm:p-8 flex flex-col items-center text-center space-y-6 overflow-y-auto flex-1 w-full">
                        <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-2 shrink-0 mt-4 sm:mt-auto">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold">Invoice {createdInvoice.number} Created!</h2>
                        <p className="text-muted-foreground max-w-md">The invoice has been saved to the customer's account. How would you like to collect payment?</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mt-4">
                            <a 
                                href={`sms:?&body=Please view and pay your invoice ${createdInvoice.number} here: ${window.location.origin}/portal/invoices`}
                                className="flex items-center justify-center gap-2 p-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-sm"
                            >
                                <Smartphone className="h-5 w-5" /> Send via Text
                            </a>
                            <button 
                                type="button"
                                onClick={() => setEmailPromptVisible(true)}
                                className="flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
                            >
                                <Mail className="h-5 w-5" /> Send via Email
                            </button>
                            <button 
                                type="button"
                                onClick={async () => {
                                    try {
                                        const blob = await invoiceService.downloadPdf(createdInvoice.id);
                                        const url = window.URL.createObjectURL(blob);
                                        window.open(url, '_blank');
                                    } catch {
                                        toast.error("Failed to load PDF for printing");
                                    }
                                }}
                                className="flex items-center justify-center gap-2 p-4 bg-secondary text-foreground border border-border rounded-xl hover:bg-secondary/80 transition-colors font-medium shadow-sm"
                            >
                                <Printer className="h-5 w-5" /> Print (Thermal / PDF)
                            </button>
                        </div>

                        {/* --- Payment Method Section --- */}
                        {!paymentRecorded ? (
                            <div className="w-full max-w-lg mt-2 space-y-3">
                                <p className="text-sm font-semibold text-foreground">Record Payment Method</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {([
                                        { key: 'Cash',        label: 'Cash',         icon: '💵' },
                                        { key: 'Check',       label: 'Check',        icon: '📝' },
                                        { key: 'CreditCard',  label: 'Credit Card',  icon: '💳' },
                                        { key: 'PaymentLink', label: 'Payment Link', icon: '🔗' },
                                    ] as const).map(opt => (
                                        <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => { setPaymentMethod(opt.key); setPaymentRef(''); }}
                                            className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 transition-all min-h-[76px] text-sm font-semibold active:scale-95 ${
                                                paymentMethod === opt.key
                                                    ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400'
                                                    : 'border-border bg-secondary/30 text-foreground hover:border-primary/40 hover:bg-secondary/60'
                                            }`}
                                        >
                                            <span className="text-2xl">{opt.icon}</span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {needsRef && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                                            {paymentMethod === 'Check' ? 'Check Number *' : 'CC Transaction / Auth Number *'}
                                        </label>
                                        <input
                                            type="text"
                                            value={paymentRef}
                                            onChange={e => setPaymentRef(e.target.value)}
                                            placeholder={paymentMethod === 'Check' ? 'e.g. 4521' : 'e.g. AUTH-89234'}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary min-h-[48px]"
                                        />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    disabled={!paymentMethod || (needsRef && !paymentRef.trim())}
                                    onClick={async () => {
                                        if (!paymentMethod) return;
                                        try {
                                            await invoiceService.markAsPaidWithRef(createdInvoice.id, paymentRef.trim() || undefined, paymentMethod);
                                            setPaymentRecorded(true);
                                            const label = paymentMethod === 'CreditCard' ? 'Credit Card' : paymentMethod === 'PaymentLink' ? 'Payment Link' : paymentMethod;
                                            toast.success(`Payment recorded! (${label}${paymentRef ? ` · ${paymentRef}` : ''})`);
                                        } catch (err: any) {
                                            toast.error(err.response?.data?.message || 'Failed to record payment');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-xl transition-colors font-semibold shadow-sm active:scale-95 min-h-[52px]"
                                >
                                    <DollarSign className="h-5 w-5" /> Confirm Payment
                                </button>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg mt-2 flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">Payment Recorded!</p>
                                    <p className="text-xs text-muted-foreground">{paymentMethod === 'CreditCard' ? 'Credit Card' : paymentMethod === 'PaymentLink' ? 'Payment Link' : paymentMethod}{paymentRef ? ` · ${paymentRef}` : ''}</p>
                                </div>
                            </div>
                        )}

                        {emailPromptVisible && (
                                <div className="w-full max-w-lg mt-4 p-4 border border-border rounded-xl bg-muted/50 text-left animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium mb-2 text-foreground">Send Invoice to:</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="email" 
                                            value={customerEmail} 
                                            onChange={e => setCustomerEmail(e.target.value)}
                                            placeholder="customer@email.com"
                                            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                                        />
                                        <button 
                                            onClick={async () => {
                                                if(!customerEmail) return toast.error("Email required");
                                                try {
                                                    setSendingEmail(true);
                                                    await invoiceService.sendEmail(createdInvoice.id, customerEmail);
                                                    toast.success("Invoice sent successfully!");
                                                    setEmailPromptVisible(false);
                                                } catch (err: any) {
                                                    toast.error(err.response?.data?.Error || "Failed to send email");
                                                } finally {
                                                    setSendingEmail(false);
                                                }
                                            }}
                                            disabled={sendingEmail}
                                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} 
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}

                        <button 
                            type="button"
                            onClick={() => {
                                onSuccess();
                                onClose();
                            }}
                            className="mt-8 mb-8 sm:mb-auto px-8 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors shrink-0"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 border-b border-border shrink-0 bg-card z-10 md:rounded-t-2xl">
                    <button type="button" onClick={onClose} className="md:hidden text-sm font-medium text-muted-foreground p-2 -ml-2">Cancel</button>
                    
                    <h2 className="text-base md:text-xl font-semibold text-foreground flex items-center gap-2 px-2 truncate">
                        Create Custom Invoice
                        {dataLoading && <Loader2 className="h-4 w-4 text-primary animate-spin ml-2" />}
                    </h2>
                    
                    <button type="submit" form="invoice-form" disabled={loading} className="md:hidden text-sm font-bold text-primary p-2 -mr-2 flex items-center gap-1 disabled:opacity-50">
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : null} Create
                    </button>
                    
                    <button onClick={onClose} className="hidden md:block p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-secondary/50">
                    <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Customer</label>
                                <input
                                    list="customer-options"
                                    required
                                    placeholder="Search or select a Customer..."
                                    value={customerSearch}
                                    onChange={(e) => {
                                        setCustomerSearch(e.target.value);
                                        const matched = customers.find(c => c.name === e.target.value);
                                        if (matched) {
                                            setCustomerId(matched.id);
                                            if (matched.email) setCustomerEmail(matched.email);
                                        } else {
                                            setCustomerId(0);
                                            setCustomerEmail("");
                                        }
                                    }}
                                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50"
                                    disabled={dataLoading}
                                />
                                <datalist id="customer-options">
                                    {customers.map(c => (
                                        <option key={c.id} value={c.name} />
                                    ))}
                                </datalist>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Issue Date</label>
                                <input
                                    type="date"
                                    required
                                    value={issueDate}
                                    onChange={(e) => setIssueDate(e.target.value)}
                                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Technician's Notes (Visible to Customer)</label>
                            <textarea
                                value={technicianNotes}
                                onChange={(e) => setTechnicianNotes(e.target.value)}
                                placeholder="e.g. Recommend new blades, needs carburetor replaced next season..."
                                rows={2}
                                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary/50 resize-none"
                            />
                        </div>

                        {/* Line Items */}
                        <div className="border border-border rounded-xl overflow-hidden mt-6 bg-card">
                            <div className="bg-white/5 p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
                                <h3 className="font-medium text-foreground">Line Items</h3>
                                <div className="flex items-center space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem("product")}
                                        className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors font-medium border border-blue-500/20"
                                    >
                                        <Plus className="h-3 w-3" />
                                        <span>Add Product</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem("asset")}
                                        className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors font-medium border border-purple-500/20"
                                    >
                                        <Plus className="h-3 w-3" />
                                        <span>Add Asset</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAddItem("custom")}
                                        className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors font-medium border border-border"
                                    >
                                        <Plus className="h-3 w-3" />
                                        <span>Add Service</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 md:flex gap-4 md:items-end p-4 md:p-0 bg-muted/10 md:bg-transparent rounded-xl border border-border/50 md:border-none animate-in slide-in-from-left-4 duration-300">
                                        <div className="col-span-12 md:flex-1 md:min-w-[200px]">
                                            <label className="block text-xs text-muted-foreground mb-1.5 md:mb-1">
                                                {item.type === "product" ? "Product" : item.type === "asset" ? "Asset" : "Service Description"}
                                            </label>
                                            {item.type === "product" ? (
                                                <>
                                                    <input
                                                        list={`product-options-${index}`}
                                                        required
                                                        value={item.description}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            const matched = products.find(p => p.name === val);
                                                            const newItems = [...items];
                                                            if (matched) {
                                                                newItems[index] = { ...newItems[index], itemId: matched.id, description: matched.name, unitPrice: matched.price || 0, isTaxable: matched.isTaxable };
                                                            } else {
                                                                newItems[index] = { ...newItems[index], itemId: undefined, description: val };
                                                            }
                                                            setItems(newItems);
                                                        }}
                                                        placeholder="Type or select a product..."
                                                        className="w-full bg-background md:bg-white/5 border border-border rounded-lg px-4 py-2.5 md:py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                                    />
                                                    <datalist id={`product-options-${index}`}>
                                                        {products.map(p => <option key={p.id} value={p.name} />)}
                                                    </datalist>
                                                </>
                                            ) : item.type === "asset" ? (
                                                <select
                                                    required
                                                    value={item.itemId || ""}
                                                    onChange={(e) => handleSelectOption(index, Number(e.target.value), "asset")}
                                                    className="w-full bg-background md:bg-white/5 border border-border rounded-lg px-4 py-2.5 md:py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                                >
                                                    <option value="" className="bg-card text-foreground">Select Asset...</option>
                                                    {assets.map(a => <option key={a.id} value={a.id} className="bg-card text-foreground">{a.name} ({a.serialNumber})</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    required
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                                    placeholder="Description..."
                                                    className="w-full bg-background md:bg-white/5 border border-border rounded-lg px-4 py-2.5 md:py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                                />
                                            )}
                                        </div>
                                        <div className="col-span-5 md:w-24">
                                            <label className="block text-xs text-muted-foreground mb-1.5 md:mb-1">Qty</label>
                                            <input
                                                type="number"
                                                required
                                                min="0.01" step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
                                                className="w-full bg-background md:bg-white/5 border border-border rounded-lg px-4 py-2.5 md:py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                                disabled={item.type === "asset"}
                                            />
                                        </div>
                                        <div className="col-span-7 md:w-32">
                                            <label className="block text-xs text-muted-foreground mb-1.5 md:mb-1">Unit Price ($)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0" step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                                                className="w-full bg-background md:bg-white/5 border border-border rounded-lg px-4 py-2.5 md:py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="col-span-12 flex items-center justify-between pt-3 border-t border-border/50 md:pt-0 md:justify-start md:w-16 md:border-none md:flex-col md:items-center mt-1 md:mt-0">
                                            <div className="flex items-center gap-3 md:flex-col md:gap-1.5">
                                                <label className="block text-sm md:text-xs font-medium md:font-normal text-muted-foreground md:mb-1">Tax</label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleItemChange(index, "isTaxable", !item.isTaxable)}
                                                    className={`w-11 h-6 md:w-10 md:h-6 rounded-full transition-colors relative flex-shrink-0 border-2 ${item.isTaxable ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
                                                >
                                                    <span className={`absolute top-[1px] md:top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${item.isTaxable ? 'translate-x-5 md:translate-x-4' : 'translate-x-0.5'}`} />
                                                </button>
                                            </div>
                                            {/* Mobile Total & Trash */}
                                            <div className="flex md:hidden items-center gap-4">
                                                <div className="text-base font-bold text-foreground">
                                                    ${(item.quantity * item.unitPrice).toFixed(2)}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={items.length === 1}
                                                    className="text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors p-2 bg-background border border-border rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Desktop Only Total & Trash */}
                                        <div className="hidden md:block w-32">
                                            <label className="block text-xs text-muted-foreground mb-1">Total</label>
                                            <div className="w-full bg-white/5 border border-transparent rounded-lg px-4 py-2 text-sm text-muted-foreground">
                                                ${(item.quantity * item.unitPrice).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="hidden md:flex w-10 justify-center pb-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(index)}
                                                disabled={items.length === 1}
                                                className="text-gray-500 hover:text-red-500 disabled:opacity-30 transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals Calculation */}
                        <div className="flex justify-end pt-4">
                            <div className="w-full max-w-xs space-y-3">
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span>Subtotal:</span>
                                    <span>${subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <span className="flex items-center space-x-2">
                                        <span>Tax Rate (%):</span>
                                        <input
                                            type="number"
                                            min="0" max="100" step="0.1"
                                            value={taxRate}
                                            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                            className="w-20 bg-white/5 border border-border rounded-lg text-right px-2 py-2 focus:outline-none min-h-[40px] text-sm"
                                        />
                                    </span>
                                    <span>${taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold text-foreground border-t border-border pt-3">
                                    <span>Grand Total:</span>
                                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="hidden md:flex p-6 border-t border-border bg-card shrink-0 justify-end space-x-4 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="invoice-form"
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        <span>Generate Invoice</span>
                    </button>
                </div>
                </>
                )}
            </div>
        </div>
        </ModalPortal>
    );
};

