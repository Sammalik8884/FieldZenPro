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
        <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Parts &amp; Services Used
            </h3>

            {loading ? (
                <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    {items.length > 0 && (
                        <div className="mb-4 overflow-x-auto rounded-xl border border-border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted text-muted-foreground text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Description</th>
                                        <th className="px-4 py-2 text-right font-medium w-20">Qty</th>
                                        <th className="px-4 py-2 text-right font-medium w-24">Unit Price</th>
                                        <th className="px-4 py-2 text-right font-medium w-24">Total</th>
                                        <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {items.map(item => (
                                        <tr key={item.id} className="bg-background">
                                            <td className="px-4 py-2 text-foreground">{item.description}</td>
                                            <td className="px-4 py-2 text-right text-foreground">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right text-foreground">${item.unitPrice.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right font-medium text-foreground">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                            <td className="px-4 py-2 text-center">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Remove item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-muted/50 font-semibold text-sm">
                                        <td colSpan={3} className="px-4 py-2 text-right text-muted-foreground">Subtotal</td>
                                        <td className="px-4 py-2 text-right text-foreground">${subtotal.toFixed(2)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {items.length === 0 && !showForm && (
                        <p className="text-sm text-muted-foreground mb-4">No items added yet. Add parts, labor, or services below.</p>
                    )}

                    {/* Add Item Form */}
                    {showForm ? (
                        <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">Item / Description</label>
                                <input
                                    type="text"
                                    list="job-product-list"
                                    value={productSearch}
                                    onChange={e => handleProductSelect(e.target.value)}
                                    placeholder="Type item name or pick from catalog..."
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                                />
                                <datalist id="job-product-list">
                                    {products.map(p => <option key={p.id} value={p.name} />)}
                                </datalist>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Quantity</label>
                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.quantity}
                                        onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Unit Price (\$)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.unitPrice}
                                        onChange={e => setForm(f => ({ ...f, unitPrice: parseFloat(e.target.value) || 0 }))}
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    onClick={handleAdd}
                                    disabled={adding}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Add Item
                                </button>
                                <button
                                    onClick={() => { setShowForm(false); setProductSearch(""); setForm({ description: "", quantity: 1, unitPrice: 0 }); }}
                                    className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted text-muted-foreground"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium border border-dashed border-primary/30 rounded-xl px-4 py-2.5 w-full justify-center hover:bg-primary/5 transition-colors"
                        >
                            <Plus className="h-4 w-4" /> Add Part, Labor, or Service
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
