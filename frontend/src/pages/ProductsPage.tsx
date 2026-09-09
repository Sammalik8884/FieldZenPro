import { useState, useEffect } from "react";
import { Package, Plus, Edit, Trash2, Loader2, Search, ImageIcon, UploadCloud, AlertTriangle, X } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { apiClient } from "../services/apiClient";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { ProductDto, CreateProductDto } from "../types/product";
import { CategoryDto } from "../types/category";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "../components/common/ConfirmModal";

const getImageUrl = (url: string | null | undefined) => {
 if (!url) return "";
 if (url.startsWith("http")) return url;
 let base = import.meta.env.PROD ? "" : (import.meta.env.VITE_API_URL || "http://localhost:5269");
 base = base.replace(/\/api\/?$/, "").replace(/\/$/, "");
 const safePath = url.startsWith("/") ? url : `/${url}`;
 return `${base}${safePath}`;
};

export const ProductsPage = () => {
 const [products, setProducts] = useState<ProductDto[]>([]);
 const [categories, setCategories] = useState<CategoryDto[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [page, setPage] = useState(1);
 const [lowStockCount, setLowStockCount] = useState<number>(0);

 const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info'|'warning'|'danger'; onConfirm: () => void }>({ isOpen: false, title: "", message: "", type: "info", onConfirm: () => {} });

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [formLoading, setFormLoading] = useState(false);
 const [editingProduct, setEditingProduct] = useState<ProductDto | null>(null);
 const [formData, setFormData] = useState<CreateProductDto>({
 name: "",
 price: 0,
 categoryId: 0,
 description: "",
 itemCode: "",
 isTaxable: false
 });

 const [isImportModalOpen, setIsImportModalOpen] = useState(false);
 const [importFile, setImportFile] = useState<File | null>(null);
 const [importLoading, setImportLoading] = useState(false);

 const fetchData = async () => {
 try {
 setLoading(true);
 const [productsData, categoriesData, metricsData] = await Promise.all([
 productService.getAll(page, 50, searchQuery), // Paged, 50 per page
 categoryService.getAll(),
 apiClient.get('/Dashboard/metrics').then(r => r.data).catch(() => null)
 ]);
 setProducts(productsData);
 setCategories(categoriesData);
 if (metricsData) setLowStockCount(metricsData.lowStockItems || 0);
 } catch (error) {
 toast.error("Failed to load products.");
 } finally {
 setLoading(false);
 }
 };

 // Debounced search logic could be added here, for now it filters API strictly on Enter or Blur
 useEffect(() => {
 fetchData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [page]); // Re-fetch on page change

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault();
 setPage(1);
 fetchData();
 };

 const handleOpenModal = (product?: ProductDto) => {
 if (product) {
 setEditingProduct(product);
 setFormData({
 name: product.name,
 price: product.price,
 priceAED: product.priceAED || 0,
 categoryId: product.categoryId,
 description: product.description || "",
 itemCode: product.itemCode || "",
 isTaxable: product.isTaxable ?? false
 });
 } else {
 setEditingProduct(null);
 setFormData({
 name: "",
 price: 0,
 categoryId: categories.length > 0 ? categories[0].id : 0,
 description: "",
 itemCode: ""
 });
 }
 setIsModalOpen(true);
 };

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files && e.target.files[0]) {
 setFormData(prev => ({ ...prev, image: e.target.files![0] }));
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 if (formData.categoryId === 0) {
 toast.error("Please select a valid category.");
 return;
 }

 setFormLoading(true);
 try {
 if (editingProduct) {
 await productService.update(editingProduct.id, formData);
 toast.success("Product updated successfully");
 } else {
 await productService.create(formData);
 toast.success("Product created successfully");
 }
 setIsModalOpen(false);
 fetchData();
 } catch (error: any) {
 toast.error(error.response?.data?.Error || error.response?.data?.Message || "Error saving product");
 } finally {
 setFormLoading(false);
 }
 };

 const handleImportSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!importFile) {
 toast.error("Please select an Excel file.");
 return;
 }

 setImportLoading(true);
 try {
 const res = await productService.importExcel(importFile);
 toast.success(res.message || "Import completed successfully");
 setIsImportModalOpen(false);
 setImportFile(null);
 fetchData();
 } catch (error: any) {
 toast.error(error.response?.data?.Error || error.response?.data?.Message || "Error importing products");
 } finally {
 setImportLoading(false);
 }
 };

 const handleDelete = (id: number) => {
 setConfirmModal({
 isOpen: true,
 title: "Delete Product",
 message: "Are you sure you want to delete this product? This action cannot be undone.",
 type: "danger",
 onConfirm: async () => {
 setConfirmModal(prev => ({ ...prev, isOpen: false }));
 try {
 await productService.delete(id);
 toast.success("Product deleted successfully");
 fetchData();
 } catch (error) {
 toast.error("Failed to delete product. Access denied.");
 }
 }
 });
 };

 return (
  <>
  <div className="animate-in fade-in duration-500">
  {/* Header */}
  <div className="mb-6">
  <div className="flex justify-between items-start gap-3 mb-3">
   <div className="min-w-0">
    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
     <Package className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />
     <span>Catalog</span>
    </h1>
    <p className="text-muted-foreground mt-0.5 text-sm">Manage your items and services.</p>
   </div>
   <div className="flex gap-2 shrink-0">
    <button
     onClick={() => setIsImportModalOpen(true)}
     className="border border-border text-foreground px-3 py-2 rounded-xl font-medium hover:bg-muted transition-all flex items-center gap-1.5 min-h-[44px] text-sm"
    >
     <UploadCloud className="h-4 w-4" />
     <span className="hidden sm:inline">Import</span>
    </button>
    <button
     onClick={() => handleOpenModal()}
     className="bg-primary text-primary-foreground px-3 py-2 rounded-xl font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 min-h-[44px] text-sm"
    >
     <Plus className="h-4 w-4" />
     <span className="hidden sm:inline">Add Item</span>
    </button>
   </div>
  </div>
 </div>

 {/* Stats */}
 <div className="mb-6 grid gap-4 grid-cols-2 md:grid-cols-4">
 <StatCard
 title="Items Loaded"
 value={products.length}
 subtitle="Currently displayed page"
 icon={Package}
 href="#"
 accentColor="indigo"
 />
 <StatCard
 title="Low Stock Warning"
 value={lowStockCount}
 subtitle="Items below reorder limit"
 icon={AlertTriangle}
 href="#"
 accentColor="rose"
 trend={lowStockCount > 0 ? 'down' : 'neutral'}
 trendLabel={lowStockCount > 0 ? "Needs reorder" : "Stock healthy"}
 />
 </div>

 <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
 <div className="p-3 border-b border-border">
  <form onSubmit={handleSearch} className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <input
   type="text"
   placeholder="Search catalog... (Press Enter)"
   value={searchQuery}
   onChange={(e) => setSearchQuery(e.target.value)}
   className="bg-background/50 border border-border text-sm rounded-xl pl-9 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
  />
  </form>
 </div>

 {loading ? (
  <div className="divide-y divide-border/30">
   {[1,2,3,4,5].map(i => (
    <div key={i} className="p-4 space-y-2 animate-pulse">
     <div className="flex gap-3 items-center"><div className="skeleton h-10 w-10 rounded-lg shrink-0" /><div className="flex-1"><div className="skeleton h-4 w-32 rounded mb-1" /><div className="skeleton h-3 w-20 rounded" /></div><div className="skeleton h-5 w-16 rounded ml-auto" /></div>
    </div>
   ))}
  </div>
 ) : products.length === 0 ? (
  <div className="p-12 text-center text-muted-foreground">
   <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
   <p className="font-medium">No items found</p>
   <p className="text-sm mt-1">Add your first catalog item above.</p>
  </div>
 ) : (
  <>
   {/* ── Mobile Card List ── */}
   <div className="block md:hidden divide-y divide-border/30">
    {products.map((item) => (
     <div key={item.id} className="p-4 flex items-center gap-3">
      <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden">
       {item.imageUrl ? <img src={getImageUrl(item.imageUrl)} alt={item.name} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
       <p className="font-semibold text-foreground text-sm truncate">{item.name}</p>
       <p className="text-xs text-muted-foreground">{item.category?.name || 'Uncategorized'} {item.itemCode ? `· ${item.itemCode}` : ''}</p>
       <p className="text-sm font-bold text-primary mt-0.5">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex gap-1.5 shrink-0">
       <button onClick={() => handleOpenModal(item)} className="p-2.5 rounded-xl border border-primary/30 text-primary bg-primary/10 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 transition-all"><Edit className="h-4 w-4" /></button>
       <button onClick={() => handleDelete(item.id)} className="p-2.5 rounded-xl border border-destructive/30 text-destructive bg-destructive/10 min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 transition-all"><Trash2 className="h-4 w-4" /></button>
      </div>
     </div>
    ))}
   </div>

   {/* ── Desktop Table ── */}
   <div className="hidden md:block overflow-x-auto">
   <table className="w-full text-sm text-left">
   <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
   <tr>
   <th className="px-6 py-4 font-medium pl-6">Item</th>
   <th className="px-6 py-4 font-medium">Category</th>
   <th className="px-6 py-4 font-medium text-right">Price</th>
   <th className="px-6 py-4 font-medium text-right">Actions</th>
   </tr>
   </thead>
   <tbody className="divide-y divide-border/30">
   {products.map((item) => (
   <tr key={item.id} className="hover:bg-muted transition-colors group">
   <td className="px-6 py-4 font-medium text-foreground">
   <div className="flex items-center space-x-3">
   <div className="h-8 w-8 rounded bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden">
   {item.imageUrl ? <img src={getImageUrl(item.imageUrl)} alt={item.name} className="h-full w-full object-cover" /> : <Package className="h-4 w-4 text-muted-foreground" />}
   </div>
   <div className="flex flex-col"><span>{item.name}</span><span className="text-xs text-muted-foreground">{item.itemCode || '-'}</span></div>
   </div>
   </td>
   <td className="px-6 py-4 text-muted-foreground">{item.category?.name || 'Uncategorized'}</td>
   <td className="px-6 py-4 text-right font-medium text-primary">${item.price.toFixed(2)}</td>
   <td className="px-6 py-4 text-right">
   <div className="flex justify-end space-x-2">
   <button onClick={() => handleOpenModal(item)} className="p-2 border border-primary/30 text-primary hover:bg-primary/20 rounded-lg bg-primary/10 flex items-center gap-1 text-xs font-medium"><Edit className="h-4 w-4" /><span>Edit</span></button>
   <button onClick={() => handleDelete(item.id)} className="p-2 border border-destructive/30 text-destructive hover:bg-destructive/20 rounded-lg bg-destructive/10 flex items-center gap-1 text-xs font-medium"><Trash2 className="h-4 w-4" /><span>Delete</span></button>
   </div>
   </td>
   </tr>
   ))}
   </tbody>
   </table>
   </div>
  </>
 )}

 <div className="p-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
 <div>Page {page}</div>
 <div className="flex gap-2">
 <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-xl bg-background border border-border disabled:opacity-40 hover:bg-muted min-h-[36px] text-sm">Previous</button>
 <button disabled={products.length < 50} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-xl bg-background border border-border disabled:opacity-40 hover:bg-muted min-h-[36px] text-sm">Next</button>
 </div>
 </div>
  </div>

  {/* Add/Edit Modal */}
  {isModalOpen && (
   <div className="fixed inset-0 z-[200] flex flex-col md:items-center md:justify-center bg-background md:bg-black/60 md:backdrop-blur-sm animate-in fade-in duration-200">
    <div className="flex flex-col flex-1 w-full md:max-w-xl md:bg-card md:border md:border-border md:rounded-2xl md:shadow-2xl md:max-h-[92vh] md:flex-none overflow-hidden relative">
     <div className="hidden md:block absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />
     
     {/* Header */}
     <div className="flex items-center justify-between px-4 py-3 md:px-6 md:pt-6 md:pb-5 border-b border-border md:border-none bg-card shrink-0 shadow-sm md:shadow-none">
      {/* Mobile Cancel */}
      <button type="button" onClick={() => setIsModalOpen(false)} className="md:hidden text-sm font-medium text-muted-foreground p-2 -ml-2">Cancel</button>
      
      <h2 className="font-bold text-base md:text-xl flex items-center gap-2 text-foreground truncate px-2">
       <Package className="hidden md:block h-5 w-5 text-primary shrink-0" />
       {editingProduct ? 'Edit Item' : 'Add New Item'}
      </h2>
      
      {/* Mobile Save */}
      <button type="button" onClick={handleSubmit as any} disabled={formLoading} className="md:hidden text-sm font-bold text-primary p-2 -mr-2 disabled:opacity-50">Save</button>
      
      {/* Desktop Close */}
      <button onClick={() => setIsModalOpen(false)} className="hidden md:block p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
     </div>
     
     {/* Form */}
     <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 pb-20 md:pb-0">
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Item Name *</label>
         <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-base min-h-[52px]" />
        </div>
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category *</label>
         <select required value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary appearance-none text-base min-h-[52px]">
          <option value={0} disabled>Select category...</option>
          {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
         </select>
        </div>
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Price (\$) *</label>
         <input type="number" step="0.01" required min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-base min-h-[52px]" />
        </div>
        <div>
         <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Item Code / SKU</label>
         <input type="text" value={formData.itemCode} onChange={e => setFormData({ ...formData, itemCode: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-base min-h-[52px]" />
        </div>
       </div>
       <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Description</label>
        <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none text-base min-h-[80px]" />
       </div>
       <div className="flex items-center gap-3 p-4 border border-border rounded-xl bg-background mt-2">
        <input type="checkbox" id="isTaxable" checked={formData.isTaxable ?? false} onChange={e => setFormData({ ...formData, isTaxable: e.target.checked })} className="w-6 h-6 accent-primary cursor-pointer shrink-0" />
        <div>
         <label htmlFor="isTaxable" className="text-sm font-semibold cursor-pointer">Taxable (Sales Tax applies)</label>
         <p className="text-xs text-muted-foreground">Check for parts/materials. Uncheck for labor.</p>
        </div>
       </div>
       <div>
        <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Item Image (Optional)</label>
        <label className="w-full border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors rounded-xl flex items-center justify-center p-6 cursor-pointer min-h-[100px]">
         <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
         <div className="flex flex-col items-center space-y-2 text-muted-foreground"><ImageIcon className="h-8 w-8" /><span className="text-sm font-medium">{formData.image ? formData.image.name : 'Tap to upload image'}</span></div>
        </label>
       </div>
       
       {/* Desktop Save/Cancel */}
       <div className="hidden md:flex gap-3 pt-4 border-t border-border mt-6">
        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-sm font-medium border border-border hover:bg-muted rounded-xl transition-colors min-h-[48px]">Cancel</button>
        <button type="submit" disabled={formLoading} className="flex-1 px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-95 transition-all min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50">
         {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}<span>Save Item</span>
        </button>
       </div>
      </form>
     </div>
    </div>
   </div>
  )}

  {/* Import Excel Modal — bottom sheet */}
  {isImportModalOpen && (
  <div className="fixed inset-0 z-[200] flex flex-col md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
   <div className="bg-card border border-border w-full md:max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
    <div className="p-5">
     <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UploadCloud className="h-5 w-5 text-primary" />Import from Excel</h2>
     <form onSubmit={handleImportSubmit} className="space-y-4">
     <div>
     <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Select Excel File (.xlsx, .xls)</label>
     <input type="file" required accept=".xlsx,.xls" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
     </div>
     <div className="flex gap-3 pt-2">
     <button type="button" onClick={() => { setIsImportModalOpen(false); setImportFile(null); }} className="flex-1 border border-border px-4 py-3 rounded-xl text-sm font-medium hover:bg-muted min-h-[48px]">Cancel</button>
     <button type="submit" disabled={importLoading} className="flex-1 bg-primary text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold min-h-[48px] flex items-center justify-center gap-2 disabled:opacity-50">
     {importLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}Upload & Import
     </button>
     </div>
     </form>
    </div>
   </div>
  </div>
  )}

  <ConfirmModal
  isOpen={confirmModal.isOpen}
  title={confirmModal.title}
  message={confirmModal.message}
  type={confirmModal.type}
  onConfirm={confirmModal.onConfirm}
  onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
  />
  </>
 );
};
