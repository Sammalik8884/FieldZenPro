import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, CheckCircle2, Smartphone, Mail, Printer, Send } from "lucide-react";
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

    // Dropdown Data State
    const [customers, setCustomers] = useState<CustomerDto[]>([]);
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [assets, setAssets] = useState<AssetDto[]>([]);

    // Form State
    const [customerId, setCustomerId] = useState<number | "">(initialCustomerId || "");
    const [customerSearch, setCustomerSearch] = useState("");
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
    const [dueDate, setDueDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    });
    const [technicianNotes, setTechnicianNotes] = useState("");
    const [items, setItems] = useState<InvoiceLineItem[]>(() => {
        // Preloaded job items take priority
        if (preloadedItems && preloadedItems.length > 0) {
            return preloadedItems.map(i => ({
                type: "custom" as const,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                isTaxable: i.isTaxable
            }));
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
        <div className="fixed top-16 inset-x-0 bottom-0 z-30 flex items-start md:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-card w-full max-w-4xl max-h-[90vh] flex flex-col border border-border rounded-2xl shadow-2xl relative my-auto">
                {createdInvoice ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-16 w-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-2">
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
                            className="mt-8 px-8 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                <div className="flex justify-between items-center p-6 border-b border-border shrink-0 bg-card z-10 rounded-t-2xl">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        Create Custom Invoice
                        {dataLoading && <Loader2 className="h-4 w-4 text-primary animate-spin ml-2" />}
                    </h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-full transition-colors">
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
                                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 items-end animate-in slide-in-from-left-4 duration-300">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="block text-xs text-muted-foreground mb-1">
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
                                                        className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
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
                                                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
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
                                                    className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                                />
                                            )}
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs text-muted-foreground mb-1">Qty</label>
                                            <input
                                                type="number"
                                                required
                                                min="0.01" step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
                                                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                                disabled={item.type === "asset"} // Assets usually have quantity 1
                                            />
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs text-muted-foreground mb-1">Unit Price ($)</label>
                                            <input
                                                type="number"
                                                required
                                                min="0" step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                                                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                        <div className="w-16 flex flex-col items-center">
                                            <label className="block text-xs text-muted-foreground mb-3">Tax</label>
                                            <input
                                                type="checkbox"
                                                checked={item.isTaxable || false}
                                                onChange={(e) => handleItemChange(index, "isTaxable", e.target.checked)}
                                                className="w-4 h-4 accent-primary cursor-pointer"
                                            />
                                        </div>
                                        <div className="w-32">

                                            <label className="block text-xs text-muted-foreground mb-1">Total</label>
                                            <div className="w-full bg-white/5 border border-transparent rounded-lg px-4 py-2 text-sm text-muted-foreground">
                                                ${(item.quantity * item.unitPrice).toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="w-10 flex justify-center pb-2">
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
                                            className="w-20 bg-white/5 border border-border rounded text-right px-2 py-1 focus:outline-none"
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

                <div className="p-6 border-t border-border bg-card shrink-0 flex justify-end space-x-4 rounded-b-2xl">
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
    );
};
