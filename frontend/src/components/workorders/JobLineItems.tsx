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
    const [newItems, setNewItems] = useState<Omit<WorkOrderItemDto, 'id'>[]>([]);
    const [products, setProducts] = useState<ProductDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [taxRate, setTaxRate] = useState(5.5); // Default tax rate

    const fetchItems = async () => {
        try {
            const data = await workOrderService.getItems(jobId);
            setItems(data);
        } catch {
            // silently ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        onItemsChange?.([...items, ...newItems] as WorkOrderItemDto[]);
    }, [items, newItems, onItemsChange]);

    useEffect(() => {
        fetchItems();
        productService.getAll(1, 200).then(setProducts).catch(() => {});
    }, [jobId]);

    const handleNewItemChange = (index: number, field: keyof Omit<WorkOrderItemDto, 'id'>, value: any) => {
        const updated = [...newItems];
        // @ts-ignore
        updated[index] = { ...updated[index], [field]: value };
        setNewItems(updated);
    };

    const handleProductSelect = (index: number, name: string) => {
        const matched = products.find(p => p.name === name);
        const updated = [...newItems];
        if (matched) {
            updated[index] = {
                ...updated[index],
                description: matched.name,
                unitPrice: matched.price ?? 0,
                isTaxable: matched.isTaxable ?? false
            };
        } else {
            updated[index] = { ...updated[index], description: name };
        }
        setNewItems(updated);
    };

    const handleRemoveNewItem = (index: number) => {
        setNewItems(newItems.filter((_, i) => i !== index));
    };

    const handleSaveAll = async () => {
        if (newItems.some(i => !i.description.trim())) return toast.error("All items must have a description");
        if (newItems.some(i => i.quantity <= 0)) return toast.error("Quantities must be greater than 0");
        
        setAdding(true);
        try {
            for (const item of newItems) {
                await workOrderService.addItem(jobId, item);
            }
            toast.success("Items added successfully");
            setNewItems([]);
            await fetchItems();
        } catch {
            toast.error("Failed to add some items");
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

    const allItems = [...items, ...newItems];
    const subtotal = allItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const taxableAmount = allItems.filter(i => i.isTaxable).reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const taxAmount = taxableAmount * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

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
                        onClick={() => setNewItems([...newItems, { description: "", quantity: 1, unitPrice: 0, isTaxable: false, _itemType: "Product" } as any])}
                        className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/30 transition-colors font-medium border border-blue-500/20"
                    >
                        <Plus className="h-3 w-3" />
                        <span>Add Product</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setNewItems([...newItems, { description: "", quantity: 1, unitPrice: 0, isTaxable: false, _itemType: "Service" } as any])}
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
                        {items.length === 0 && newItems.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No items added yet.</p>
                        )}

                        {items.map(item => (
                            <div key={`saved-${item.id}`} className="grid grid-cols-12 gap-x-2 gap-y-3 md:flex md:flex-nowrap md:gap-4 items-end animate-in slide-in-from-left-4 duration-300 bg-muted/5 p-2 rounded-lg border border-border">
                                <div className="col-span-12 md:flex-1 md:min-w-[200px]">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Description</label>
                                    <div className="w-full bg-white/5 border border-border rounded px-2 py-1.5 text-sm text-foreground">
                                        {item.description}
                                    </div>
                                </div>
                                <div className="col-span-3 md:w-20">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Qty</label>
                                    <div className="w-full bg-white/5 border border-border rounded px-2 py-1.5 text-sm text-foreground text-right">
                                        {item.quantity}
                                    </div>
                                </div>
                                <div className="col-span-4 md:w-24">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Price</label>
                                    <div className="w-full bg-white/5 border border-border rounded px-2 py-1.5 text-sm text-foreground text-right">
                                        {item.unitPrice.toFixed(2)}
                                    </div>
                                </div>
                                <div className="col-span-3 md:w-14 flex flex-col items-center justify-center h-full pb-2 md:pb-3">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tax</label>
                                    <button
                                        type="button"
                                        disabled
                                        className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 border-2 opacity-60 cursor-not-allowed ${item.isTaxable ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
                                    >
                                        <span className={`absolute top-[1px] h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${item.isTaxable ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                                <div className="col-span-3 flex justify-end md:w-32 items-center h-full pb-1 md:pb-0 gap-2">
                                    <div className="w-full text-right text-sm font-medium text-muted-foreground pr-1 mt-auto">
                                        ${(item.quantity * item.unitPrice).toFixed(2)}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-muted-foreground hover:text-destructive transition-colors mt-auto p-1"
                                        title="Remove item"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {newItems.map((item, index) => (
                            <div key={`new-${index}`} className="grid grid-cols-12 gap-x-2 gap-y-3 md:flex md:flex-nowrap md:gap-4 items-end animate-in slide-in-from-left-4 duration-300 bg-muted/20 p-2 rounded-lg border border-border">
                                <div className="col-span-12 md:flex-1 md:min-w-[200px]">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Description</label>
                                    <input
                                        type="text"
                                        list={`job-product-list-${index}`}
                                        value={item.description}
                                        onChange={e => handleProductSelect(index, e.target.value)}
                                        placeholder={(item as any)._itemType === 'Service' ? "Type or select a service..." : "Type or select a product..."}
                                        className="w-full bg-white/5 border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                    <datalist id={`job-product-list-${index}`}>
                                        {products
                                            .filter(p => { const pType = p.itemType || "Product"; const iType = (item as any)._itemType; return !iType || pType === iType; })
                                            .map(p => <option key={p.id} value={p.name} />)}
                                    </datalist>
                                </div>
                                <div className="col-span-3 md:w-20">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Qty</label>
                                    <input
                                        type="number"
                                        min="0.01" step="0.01"
                                        value={item.quantity}
                                        onChange={e => handleNewItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="col-span-4 md:w-24">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Price</label>
                                    <input
                                        type="number"
                                        min="0" step="0.01"
                                        value={item.unitPrice}
                                        onChange={e => handleNewItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-border rounded px-2 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                                <div className="col-span-3 md:w-14 flex flex-col items-center justify-center h-full pb-2 md:pb-3">
                                    <label className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Tax</label>
                                    <button
                                        type="button"
                                        onClick={() => handleNewItemChange(index, 'isTaxable', !item.isTaxable)}
                                        className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 border-2 ${item.isTaxable ? 'bg-primary border-primary' : 'bg-muted border-border'}`}
                                    >
                                        <span className={`absolute top-[1px] h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${item.isTaxable ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                    </button>
                                </div>
                                <div className="col-span-3 flex justify-end md:w-32 items-center h-full pb-1 md:pb-0 gap-2">
                                    <div className="w-full text-right text-sm font-medium text-muted-foreground pr-1 mt-auto">
                                        ${(item.quantity * item.unitPrice).toFixed(2)}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewItem(index)}
                                        className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors mt-auto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {newItems.length > 0 && (
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleSaveAll}
                                    disabled={adding}
                                    className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save Added Items
                                </button>
                            </div>
                        )}
                        
                        {(items.length > 0 || newItems.length > 0) && (
                            <div className="pt-4 mt-6 border-t border-border flex justify-end gap-12 text-sm">
                                <div className="space-y-2 text-right">
                                    <div className="text-muted-foreground">Subtotal:</div>
                                    <div className="text-muted-foreground flex items-center gap-2 justify-end">
                                        Tax Rate (%):
                                        <input
                                            type="number"
                                            min="0" step="0.1"
                                            value={taxRate}
                                            onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                            className="w-16 bg-white/5 border border-border rounded text-right px-1 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="text-foreground font-semibold pt-2">Total:</div>
                                </div>
                                <div className="space-y-2 text-right font-medium text-foreground w-32 pr-2">
                                    <div>${subtotal.toFixed(2)}</div>
                                    <div>${taxAmount.toFixed(2)}</div>
                                    <div className="pt-2 text-lg font-bold text-primary">${totalAmount.toFixed(2)}</div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
