import { useState, useEffect } from "react";
import { Users, Plus, Shield, Mail, CheckCircle, XCircle, Loader2, Eye, EyeOff, Edit2, Trash2 } from "lucide-react";
import { authService } from "../services/authService";
import { toast } from "react-hot-toast";
import { ConfirmModal } from "../components/common/ConfirmModal";

export const UsersPage = () => {
 const [users, setUsers] = useState<any[]>([]);
 const [roles, setRoles] = useState<string[]>([]);
 const [loading, setLoading] = useState(true);

 // Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isEditMode, setIsEditMode] = useState(false);
 const [editingUserId, setEditingUserId] = useState<string | null>(null);
 const [formLoading, setFormLoading] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [formData, setFormData] = useState({
 fullName: "",
 email: "",
 password: "",
 role: ""
 });

 const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'info'|'warning'|'danger'; confirmText: string; onConfirm: () => void }>({ isOpen: false, title: "", message: "", type: "info", confirmText: "Confirm", onConfirm: () => {} });

 const confirmAction = (title: string, message: string, type: 'info' | 'warning' | 'danger', confirmText: string, action: () => Promise<void>) => {
 setConfirmModal({
 isOpen: true, title, message, type, confirmText,
 onConfirm: async () => {
 setConfirmModal(prev => ({ ...prev, isOpen: false }));
 await action();
 }
 });
 };

 const fetchData = async () => {
 try {
 setLoading(true);
 const [usersData, rolesData] = await Promise.all([
 authService.getUsers(),
 authService.getRoles()
 ]);
 setUsers(usersData);
 // Only show the official backend roles — filter out stale DB entries like Worker, Client, Customers
 const validRoles = ["Manager", "Engineer", "Technician", "Customer"];
 const filteredRoles = rolesData.filter((r: string) => validRoles.includes(r));
 setRoles(filteredRoles);
 if (filteredRoles.length > 0) {
 setFormData(prev => ({ ...prev, role: filteredRoles[0] }));
 }
 } catch (error) {
 toast.error("Failed to load users or roles. You may not have permission.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchData();
 }, []);

 const handleOpenModal = () => {
 setIsEditMode(false);
 setEditingUserId(null);
 setFormData({
 fullName: "",
 email: "",
 password: "",
 role: roles.length > 0 ? roles[0] : ""
 });
 setIsModalOpen(true);
 };

 const handleEditUser = (user: any) => {
 setIsEditMode(true);
 setEditingUserId(user.id);
 setFormData({
 fullName: user.fullName || "",
 email: user.email || "",
 password: "",
 role: (user.roles && user.roles.length > 0) ? user.roles[0] : (roles.length > 0 ? roles[0] : "")
 });
 setIsModalOpen(true);
 };

 const handleDeleteUser = (user: any) => {
 confirmAction(
 "Delete User",
 `Are you sure you want to delete ${user.fullName || user.email}? This action cannot be undone.`,
 "danger",
 "Delete",
 async () => {
 try {
 await authService.deleteUser(user.id);
 toast.success("User deleted successfully.");
 fetchData();
 } catch (error: any) {
 const data = error.response?.data;
 const msg = data?.error || data?.Error || data?.message || data?.Message || error.message || "Failed to delete user.";
 toast.error(msg);
 }
 }
 );
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setFormLoading(true);
 try {
 if (isEditMode && editingUserId) {
 await authService.updateUser(editingUserId, formData);
 toast.success("User updated successfully");
 } else {
 const res = await authService.createUser(formData);
 toast.success(res.message || "User created successfully");
 }
 setIsModalOpen(false);
 fetchData();
 } catch (error: any) {
 const status = error.response?.status;
 const data = error.response?.data;
 if (status === 403) {
 toast.error("You don't have permission to modify users.");
 } else if (status === 401) {
 toast.error("Your session has expired. Please log in again.");
 } else {
 const msg = data?.error || data?.Error || data?.message || data?.Message ||
 (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
 error.message || "An error occurred.";
 toast.error(msg);
 }
 } finally {
 setFormLoading(false);
 }
 };

 return (
 <div className="p-8 animate-in fade-in duration-500">
 <div className="flex justify-between items-center mb-8">
 <div>
 <h1 className="text-3xl font-bold text-foreground">Users & Roles</h1>
 <p className="text-muted-foreground mt-1 text-sm">Manage access and roles for your organization.</p>
 </div>
 <button
 onClick={handleOpenModal}
 className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:-translate-y-0.5 transition-all shadow-sm flex items-center space-x-2"
 >
 <Plus className="h-5 w-5" />
 <span>Invite User</span>
 </button>
 </div>

 <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-muted-foreground uppercase bg-muted border-b border-border">
 <tr>
 <th className="px-6 py-4 font-medium">User</th>
 <th className="px-6 py-4 font-medium">Role(s)</th>
 <th className="px-6 py-4 font-medium text-center">Status</th>
 <th className="px-6 py-4 font-medium text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/30">
 {loading ? (
 <tr>
 <td colSpan={4} className="px-6 py-12 text-center">
 <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-50" />
 </td>
 </tr>
 ) : users.length === 0 ? (
 <tr>
 <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
 No users found.
 </td>
 </tr>
 ) : (
 users.map((user) => (
 <tr key={user.id} className="hover:bg-muted transition-colors group">
 <td className="px-6 py-4">
 <div className="flex items-center space-x-3">
 <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-border flex items-center justify-center shrink-0">
 <span className="font-bold text-primary">{user.fullName?.charAt(0) || 'U'}</span>
 </div>
 <div className="flex flex-col">
 <span className="font-medium text-foreground">{user.fullName || "Unnamed User"}</span>
 <span className="text-xs text-muted-foreground flex items-center mt-0.5">
 <Mail className="h-3 w-3 mr-1" />
 {user.email}
 </span>
 </div>
 </div>
 </td>
 <td className="px-6 py-4">
 <div className="flex flex-wrap gap-2">
 {(user.roles || []).map((role: string) => (
 <span key={role} className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
 <Shield className="h-3 w-3" />
 <span>{role}</span>
 </span>
 ))}
 {(!user.roles || user.roles.length === 0) && <span className="text-muted-foreground italic text-xs">No roles assigned</span>}
 </div>
 </td>
 <td className="px-6 py-4 text-center">
 {user.isActive ? (
 <span className="inline-flex items-center space-x-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-md text-xs font-medium">
 <CheckCircle className="h-3 w-3" />
 <span>Active</span>
 </span>
 ) : (
 <span className="inline-flex items-center space-x-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-md text-xs font-medium">
 <XCircle className="h-3 w-3" />
 <span>Inactive</span>
 </span>
 )}
 </td>
 <td className="px-6 py-4 text-right">
 <div className="flex justify-end space-x-2">
 <button
 onClick={() => handleEditUser(user)}
 className="p-2 border border-border text-muted-foreground hover:bg-secondary/50 rounded-lg transition-colors flex items-center space-x-1"
 title="Edit User"
 >
 <Edit2 className="h-4 w-4" />
 </button>
 <button
 onClick={() => handleDeleteUser(user)}
 className="p-2 border border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center space-x-1"
 title="Delete User"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Create/Edit User Modal */}
 {isModalOpen && (
 <div className="fixed top-16 inset-x-0 bottom-0 z-30 flex items-center justify-center p-4 bg-background/80 animate-in fade-in">
 <div className="bg-secondary border border-border rounded-2xl w-full max-w-md shadow-md overflow-hidden relative">
 <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent pointer-events-none" />

 <div className="p-6">
 <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
 <Users className="h-5 w-5 text-primary" />
 <span>{isEditMode ? "Edit User" : "Invite New User"}</span>
 </h2>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">Full Name *</label>
 <input
 type="text" required
 value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })}
 className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
 placeholder="John Doe"
 />
 </div>
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email Address *</label>
 <input
 type="email" required
 value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
 className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
 placeholder="john@example.com"
 />
 </div>
 {!isEditMode && (
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">Temporary Password *</label>
 <div className="relative group">
 <input
 type={showPassword ? "text" : "password"} required minLength={6}
 value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
 className="w-full bg-background border border-border rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-primary"
 placeholder="Min 6 chars, 1 uppercase, 1 symbol"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
 >
 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 </div>
 <p className="text-[10px] text-muted-foreground mt-1">
 Password must contain an uppercase letter, lowercase letter, number, and special character.
 </p>
 </div>
 )}
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">Assign Role *</label>
 <select
 required
 value={formData.role}
 onChange={e => setFormData({ ...formData, role: e.target.value })}
 className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
 >
 <option value="" disabled>Select a role...</option>
 {roles.map(role => (
 <option key={role} value={role}>{role}</option>
 ))}
 </select>
 </div>

 <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-border">
 <button
 type="button"
 onClick={() => setIsModalOpen(false)}
 className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={formLoading}
 className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:-translate-y-0.5 transition-transform flex items-center space-x-2"
 >
 {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
 <span>{isEditMode ? "Save Changes" : "Create User"}</span>
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
 confirmText={confirmModal.confirmText}
 onConfirm={confirmModal.onConfirm}
 onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
 />
 </div>
 );
};
