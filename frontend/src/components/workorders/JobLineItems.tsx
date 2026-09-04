import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Package } from "lucide-react";
import { workOrderService, WorkOrderItemDto } from "../../services/workOrderService";
import { productService } from "../../services/productService";
import { ProductDto } from "../../types/product";
import { toast } from "react-hot-toast";

interface JobLineItemsProps {
    jobId: number;
    onItemsChange?: (items: WorkOrderItemDto[]) => void;
}

export const JobLineItems = ({ jobId, onItemsChange }: JobLineItemsProps) => {
    const [items, setItems] = useState<WorkOrderItemDto[]>([]);
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ description: "", quantity: 1, unitPrice: 0 });
    const [productSearch, setProductSearch] = useState("");

    const fetchItems = async () => {
        try {
            const data = await workOrderService.getItems(jobId);
            setItems(data);
            onItemsChange?.(data);
        } catch {
            // silently ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        productService.getAll(1, 200).then(setProducts).catch(() => {});
    }, [jobId]);

    const handleProductSelect = (name: string) => {
        setProductSearch(name);
        const matched = products.find(p => p.name === name);
        if (matched) {
            setForm(f => ({
                ...f,
                description: matched.name,
                unitPrice: matched.price ?? 0
            }));
        } else {
            setForm(f => ({ ...f, description: name }));
        }
    };

    const handleAdd = async () => {
        if (!form.description.trim()) return toast.error("Description is required");
        if (form.quantity <= 0) return toast.error("Quantity must be greater than 0");
        setAdding(true);
        try {
            await workOrderService.addItem(jobId, form);
            toast.success("Item added");
            setForm({ description: "", quantity: 1, unitPrice: 0 });
            setProductSearch("");
            setShowForm(false);
            await fetchItems();
        } catch {
            toast.error("Failed to add item");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (itemId: number) => {
        try {
            await workOrderService.deleteItem(jobId, itemId);
            toast.success("Item removed");
            await fetchItems();
        } catch {
            toast.error("Failed to remove item");
        }
    };

    const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

    return (
        <div className="border border-border rounded-xl overflow-hidden mt-6 bg-card">
            <div className="bg-white/5 p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Parts &amp; Services Used
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        type="button"
                        onClick={() => { setForm({ description: "", quantity: 1, unitPrice: 0 }); setShowForm(true); }}
                        className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition-colors font-medium border border-blue-500/20"
                    >
                        <Plus className="h-3 w-3" />
                        <span>Add Product</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setForm({ description: "Service/Labor", quantity: 1, unitPrice: 0 }); setShowForm(true); }}
                        className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-white/10 text-muted-foreground hover:bg-white/20 transition-colors font-medium border border-border"
                    >
                        <Plus className="h-3 w-3" />
                        <span>Add Service</span>
                    </button>
                </div>
            </div>
            <div className="p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {items.length === 0 && !showForm && (
                            <p className="text-sm text-muted-foreground text-center py-4">No items added yet.</p>
                        )}

                        {items.map(item => (
                            <div key={item.id} className="flex flex-wrap md:flex-nowrap gap-4 items-end animate-in slide-in-from-left-4 duration-300">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-xs text-muted-foreground mb-1">Description</label>
                                    <div className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground">
                                        {item.description}
                                    </div>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs text-muted-foreground mb-1">Qty</label>
                                    <div className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground text-right">
                                        {item.quantity}
                                    </div>
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs text-muted-foreground mb-1">Unit Price ($)</label>
                                    <div className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground text-right">
                                        {item.unitPrice.toFixed(2)}
                                    </div>
                                </div>
                                <div className="w-16 flex flex-col items-center">
                                    <label className="block text-xs text-muted-foreground mb-3">Tax</label>
                                    <input type="checkbox" disabled className="w-4 h-4 accent-primary cursor-not-allowed opacity-50" />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs text-muted-foreground mb-1">Total</label>
                                    <div className="w-full bg-white/5 border border-transparent rounded-lg px-4 py-2 text-sm text-muted-foreground flex justify-between items-center">
                                        <span>${(item.quantity * item.unitPrice).toFixed(2)}</span>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                                            title="Remove item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {showForm && (
                            <div className="flex flex-wrap md:flex-nowrap gap-4 items-end animate-in slide-in-from-left-4 duration-300 bg-muted/20 p-3 rounded-lg border border-border">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-xs text-muted-foreground mb-1">Description</label>
                                    <input
                                        type="text"
                                        list="job-product-list"
                                        value={productSearch || form.description}
                                        onChange={e => handleProductSelect(e.target.value)}
                                        placeholder="Type or select a product..."
                                        className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                    <datalist id="job-product-list">
                                        {products.map(p => <option key={p.id} value={p.name} />)}
                                    </datalist>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs text-muted-foreground mb-1">Qty</label>
                                    <input
                                        type="number"
                                        min="0.01" step="0.01"
                                        value={form.quantity}
                                        onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs text-muted-foreground mb-1">Unit Price ($)</label>
                                    <input
                                        type="number"
                                        min="0" step="0.01"
                                        value={form.unitPrice}
                                        onChange={e => setForm(f => ({ ...f, unitPrice: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-white/5 border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="w-16 flex flex-col items-center">
                                    <label className="block text-xs text-muted-foreground mb-3">Tax</label>
                                    <input type="checkbox" className="w-4 h-4 accent-primary cursor-pointer" />
                                </div>
                                <div className="w-32 flex flex-col gap-2">
                                    <button
                                        onClick={handleAdd}
                                        disabled={adding}
                                        className="w-full bg-primary text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {(items.length > 0 || showForm) && (
                            <div className="pt-4 mt-6 border-t border-border flex justify-end gap-12 text-sm">
                                <div className="space-y-2 text-right">
                                    <div className="text-muted-foreground">Subtotal:</div>
                                </div>
                                <div className="space-y-2 text-right font-medium text-foreground w-32 pr-2">
                                    <div>${subtotal.toFixed(2)}</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
