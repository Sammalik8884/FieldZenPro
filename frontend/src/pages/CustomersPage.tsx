import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Search, Users, Phone, Mail, MapPin } from "lucide-react";
import { StatCard } from "../components/dashboard/StatCard";
import { customerService } from "../services/customerService";
import { CustomerDto, CreateCustomerDto } from "../types/customer";
import { ConfirmModal } from "../components/common/ConfirmModal";
import { toast } from "react-hot-toast";

export const CustomersPage = () => {
 const [customers, setCustomers] = useState<CustomerDto[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [formLoading, setFormLoading] = useState(false);
 const [editingCustomer, setEditingCustomer] = useState<CustomerDto | null>(null);
 const [formData, setFormData] = useState<CreateCustomerDto>({
  name: "",
  email: "",
  phone: "",
  altPhone: "",
  address: "",
  taxNumber: ""
 });

 const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info' | 'warning' | 'danger'; onConfirm: () => void }>({ isOpen: false, title: "", message: "", type: "info", onConfirm: () => { } });

 const confirmAction = (title: string, message: string, type: 'info' | 'warning' | 'danger', action: () => Promise<void>) => {
  setConfirmModal({
   isOpen: true, title, message, type,
   onConfirm: async () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    await action();
   }
  });
 };

 const fetchCustomers = async () => {
  try {
   setLoading(true);
   const data = await customerService.getAll();
   setCustomers(data);
  } catch (error) {
   toast.error("Failed to load customers.");
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchCustomers();
 }, []);

 const filteredCustomers = customers.filter(c =>
  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  c.email.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const handleOpenModal = (customer?: CustomerDto) => {
  if (customer) {
   setEditingCustomer(customer);
   setFormData({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
    altPhone: (customer as any).altPhone || "",
    address: customer.address || "",
    taxNumber: ""
   });
  } else {
   setEditingCustomer(null);
   setFormData({ name: "", email: "", phone: "", altPhone: "", address: "", taxNumber: "" });
  }
  setIsModalOpen(true);
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormLoading(true);
  try {
   if (editingCustomer) {
    await customerService.update(editingCustomer.id, formData);
    toast.success("Customer updated successfully");
   } else {
    await customerService.create(formData);
    toast.success("Customer created successfully");
   }
   setIsModalOpen(false);
   fetchCustomers();
  } catch (error: any) {
   toast.error(error.response?.data?.Error || error.response?.data?.Message || "Error saving customer");
  } finally {
   setFormLoading(false);
  }
 };

 const handleDelete = (id: number) => {
  confirmAction("Delete Customer", "Are you sure you want to delete this customer? This action cannot be undone.", "danger", async () => {
   try {
    await customerService.delete(id);
    toast.success("Customer deleted successfully");
    fetchCustomers();
   } catch (error: any) {
    const bodyStr = typeof error.response?.data === 'object' ? JSON.stringify(error.response?.data) : error.response?.data;
    const errorMsg = error.response?.data?.Error || error.response?.data?.error || bodyStr || error.message;
    toast.error(errorMsg);
   }
  });
 };

 return (
  <div className="animate-in fade-in duration-500">
   {/* Page Header */}
   <div className="flex justify-between items-center mb-6">
    <div>
     <h1 className="text-2xl md:text-3xl font-bold text-foreground">Customers</h1>
     <p className="text-muted-foreground mt-0.5 text-sm">Manage your client base and contacts.</p>
    </div>
    <button
     onClick={() => handleOpenModal()}
     className="bg-primary text-primary-foreground px-3 py-2 md:px-4 md:py-2.5 rounded-xl font-medium hover:bg-primary/90 active:scale-95 transition-all shadow-sm flex items-center gap-2 min-h-[44px]"
    >
     <Plus className="h-5 w-5" />
     <span className="hidden sm:inline">Add Customer</span>
    </button>
   </div>

   {/* Stats */}
   <div className="mb-6 grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
    <StatCard
     title="Total Customers"
     value={customers.length}
     subtitle="Registered accounts"
     icon={Users}
     href="#"
     accentColor="blue"
    />
   </div>

   {/* Search */}
   <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
    <div className="p-4 border-b border-border">
     <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
       type="text"
       placeholder="Search customers..."
       value={searchQuery}
       onChange={(e) => setSearchQuery(e.target.value)}
       className="bg-background/50 border border-border text-sm rounded-xl pl-9 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[44px]"
      />
     </div>
    </div>

    {loading ? (
     <div className="flex justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
     </div>
    ) : filteredCustomers.length === 0 ? (
     <div className="p-12 text-center text-muted-foreground">
      <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
      <p className="font-medium">No customers found</p>
      <p className="text-sm mt-1">Try adjusting your search or add a new customer.</p>
     </div>
    ) : (
     <>
      {/* Mobile Card List */}
      <div className="block md:hidden divide-y divide-border/30">
       {filteredCustomers.map((customer) => (
        <div key={customer.id} className="p-4 hover:bg-muted/30 transition-colors">
         <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
           <p className="font-semibold text-foreground truncate">{customer.name}</p>
           {customer.email && (
            <div className="flex items-center gap-1.5 mt-1">
             <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
             <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
            </div>
           )}
           {customer.phone && (
            <div className="flex items-center gap-1.5 mt-0.5">
             <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
             <a href={`tel:${customer.phone}`} className="text-sm text-primary" onClick={e => e.stopPropagation()}>
              {customer.phone}
             </a>
            </div>
           )}
           {customer.address && (
            <div className="flex items-center gap-1.5 mt-0.5">
             <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
             <p className="text-xs text-muted-foreground truncate">{customer.address}</p>
            </div>
           )}
          </div>
          <div className="flex gap-2 shrink-0">
           <button
            onClick={() => handleOpenModal(customer)}
            className="p-2.5 border border-primary/30 text-primary hover:bg-primary/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
           >
            <Edit className="h-4 w-4" />
           </button>
           <button
            onClick={() => handleDelete(customer.id)}
            className="p-2.5 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
           >
            <Trash2 className="h-4 w-4" />
           </button>
          </div>
         </div>
        </div>
       ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
       <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
         <tr>
          <th className="px-6 py-4 font-medium">Name</th>
          <th className="px-6 py-4 font-medium">Email</th>
          <th className="px-6 py-4 font-medium">Phone</th>
          <th className="px-6 py-4 font-medium text-right">Actions</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
         {filteredCustomers.map((customer) => (
          <tr key={customer.id} className="hover:bg-muted transition-colors group">
           <td className="px-6 py-4 font-medium text-foreground">{customer.name}</td>
           <td className="px-6 py-4 text-muted-foreground">{customer.email}</td>
           <td className="px-6 py-4 text-muted-foreground">{customer.phone || "-"}</td>
           <td className="px-6 py-4 text-right">
            <div className="flex justify-end space-x-2">
             <button
              onClick={() => handleOpenModal(customer)}
              className="p-2 border border-primary/30 text-primary hover:bg-primary/20 hover:text-primary rounded-lg transition-colors flex items-center space-x-1 font-medium bg-primary/10"
             >
              <Edit className="h-4 w-4" />
              <span className="text-xs">Edit</span>
             </button>
             <button
              onClick={() => handleDelete(customer.id)}
              className="p-2 border border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-destructive rounded-lg transition-colors flex items-center space-x-1 font-medium bg-destructive/10"
             >
              <Trash2 className="h-4 w-4" />
              <span className="text-xs">Delete</span>
             </button>
            </div>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     </>
    )}
   </div>

   {/* Add/Edit Modal — Full screen bottom sheet on mobile, centered dialog on desktop */}
   {isModalOpen && (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
     <div className="bg-card border border-border w-full md:max-w-md md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />

      {/* Mobile drag handle */}
      <div className="flex justify-center pt-3 pb-1 md:hidden">
       <div className="w-10 h-1 bg-border rounded-full" />
      </div>

      <div className="p-5 md:p-6 overflow-y-auto flex-1">
       <h2 className="text-xl font-bold mb-5">
        {editingCustomer ? "Edit Customer" : "Add New Customer"}
       </h2>

       <form onSubmit={handleSubmit} className="space-y-4">
        {[
         { label: "Name *", field: "name", type: "text", required: true },
         { label: "Email *", field: "email", type: "email", required: true },
         { label: "Phone", field: "phone", type: "text", required: false },
         { label: "Alt Phone", field: "altPhone", type: "text", required: false },
         { label: "Address", field: "address", type: "text", required: false },
         { label: "Tax Number", field: "taxNumber", type: "text", required: false },
        ].map(({ label, field, type, required }) => (
         <div key={field}>
          <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{label}</label>
          <input
           type={type}
           required={required}
           value={(formData as any)[field]}
           onChange={e => setFormData({ ...formData, [field]: e.target.value })}
           className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[48px]"
          />
         </div>
        ))}

        <div className="flex gap-3 pt-4 border-t border-border mt-4">
         <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="flex-1 px-4 py-3 text-sm font-medium border border-border hover:bg-muted rounded-xl transition-colors min-h-[48px]"
         >
          Cancel
         </button>
         <button
          type="submit"
          disabled={formLoading}
          className="flex-1 px-4 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
         >
          {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>Save Customer</span>
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
    confirmText="Delete"
    onConfirm={confirmModal.onConfirm}
    onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
   />
  </div>
 );
};
