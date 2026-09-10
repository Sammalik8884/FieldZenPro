import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    Home, Users, MapPin, Briefcase, LogOut, FileText, FolderTree, Package, Receipt,
    ShieldAlert, X, Wrench, FileSignature, ClipboardList,
    Activity, RefreshCw, CreditCard, Lock, HelpCircle
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { PlanFeature } from "../types/auth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

type SidebarItem = {
    label: string;
    href?: string;
    icon?: any;
    paths?: string[];
    allowedRoles?: string[];
    isHeader?: boolean;
    requiredFeature?: PlanFeature;
};

const SIDEBAR_ITEMS: SidebarItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: Home },

    { label: "Foundation", isHeader: true, allowedRoles: ["Admin", "Manager"] },
    { label: "Users & Roles", href: "/users", icon: ShieldAlert, allowedRoles: ["Admin", "Manager"] },

    { label: "CRM", isHeader: true, allowedRoles: ["Admin", "Manager"] },
    { label: "Customers (CRM)", href: "/customers", icon: Users, paths: ["/customers", "/sites"], allowedRoles: ["Admin", "Manager"] },

    { label: "Catalog", isHeader: true, allowedRoles: ["Admin", "Manager", "Engineer"] },
    { label: "Catalog (Items)", href: "/products", icon: Package, paths: ["/products"], allowedRoles: ["Admin", "Manager", "Engineer"] },

    { label: "Operations & Jobs", isHeader: true, allowedRoles: ["Admin", "Manager", "Engineer", "Worker", "Technician"] },
    { label: "Sales & Quotes", href: "/quotations", icon: FileText, paths: ["/quotations", "/quotations/new", "/quotations/edit"], allowedRoles: ["Admin", "Manager", "Engineer"] },
    { label: "Contracts & AMCs", href: "/contracts", icon: FileSignature, allowedRoles: ["Admin", "Manager", "Engineer"] },
    { label: "Dispatch (Jobs)", href: "/work-orders", icon: Briefcase, allowedRoles: ["Admin", "Manager"] },
    { label: "My Jobs", href: "/my-jobs", icon: Wrench, paths: ["/my-jobs", "/job/:id"], allowedRoles: ["Admin", "Manager", "Engineer", "Worker", "Technician"] },
    { label: "Checklist Form Builder", href: "/checklists", icon: ClipboardList, allowedRoles: ["Admin", "Manager"], requiredFeature: PlanFeature.ChecklistFormBuilder },

    { label: "Financials", isHeader: true, allowedRoles: ["Admin", "Manager"] },
    { label: "Invoices", href: "/invoices", icon: Receipt, allowedRoles: ["Admin", "Manager"] },
    { label: "Weekly Report", href: "/weekly-report", icon: FileText, allowedRoles: ["Admin", "Manager"] },

    { label: "System", isHeader: true, allowedRoles: ["Admin", "Manager"] },
    { label: "Audit Logs", href: "/audit-logs", icon: Activity, allowedRoles: ["Admin", "Manager"], requiredFeature: PlanFeature.AuditLogs },
    { label: "Sync Dashboard", href: "/sync-dashboard", icon: RefreshCw, allowedRoles: ["Admin", "Manager"], requiredFeature: PlanFeature.OfflineSync },
    { label: "Billing & Plans", href: "/subscription/plans", icon: CreditCard, allowedRoles: ["Admin", "Manager"] },
    { label: "Support", href: "/support", icon: HelpCircle, allowedRoles: ["Admin", "Manager", "Engineer", "Technician", "Worker", "Customer"] },

    { label: "Settings", isHeader: true, allowedRoles: ["Admin", "Manager"] },
    { label: "Categories", href: "/categories", icon: FolderTree, allowedRoles: ["Admin", "Manager"] },
];

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { logout, user, hasRole, hasFeature } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border text-foreground w-64 transition-transform duration-300 ease-in-out h-full",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            {/* Logo + close button */}
            <div className="p-5 flex justify-between items-center border-b border-border/50 shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                        <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">
                        FieldZenPro
                    </span>
                </div>
                {/* Close button only on mobile */}
                <button 
                    onClick={onClose} 
                    className="p-2 text-muted-foreground hover:bg-secondary/50 rounded-lg"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto custom-scrollbar px-2">
                {SIDEBAR_ITEMS.map((item, index) => {
                    if (item.allowedRoles && !hasRole(item.allowedRoles)) return null;

                    if (item.isHeader) {
                        return (
                            <div key={`header-${index}`} className="px-3 pt-5 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                {item.label}
                            </div>
                        );
                    }

                    const href = item.href as string;
                    const isActive = location.pathname === href || item.paths?.includes(location.pathname);
                    const isLocked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;

                    return (
                        <div key={href} className="space-y-0.5">
                            {isLocked ? (
                                <button
                                    onClick={() => { if (isOpen) onClose(); navigate("/subscription/plans"); }}
                                    className="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm text-muted-foreground/50 hover:bg-secondary/20 hover:text-muted-foreground"
                                    title="Upgrade to Pro to unlock this feature"
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="h-4 w-4 opacity-50" />
                                        <span>{item.label}</span>
                                    </div>
                                    <div className="bg-background/80 p-1 rounded border border-border/50">
                                        <Lock className="h-3 w-3 text-amber-500/70" />
                                    </div>
                                </button>
                            ) : (
                                <NavLink
                                    to={href}
                                    onClick={() => { if (isOpen) onClose(); }}
                                    className={cn(
                                        "flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                                    <span className="truncate">{item.label}</span>
                                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                                </NavLink>
                            )}

                            {/* CRM submenu */}
                            {!isLocked && item.label === "Customers (CRM)" && isActive && (
                                <div className="pl-10 flex flex-col space-y-0.5 mt-0.5 animate-in slide-in-from-top-2 duration-200">
                                    <NavLink to="/customers" className={({ isActive }) => cn("text-xs py-2 px-2 rounded-lg transition-colors", isActive ? "text-primary font-medium bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50")}>
                                        Client List
                                    </NavLink>
                                    <NavLink to="/sites" className={({ isActive }) => cn("text-xs py-2 px-2 rounded-lg transition-colors flex items-center space-x-2", isActive ? "text-primary font-medium bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50")}>
                                        <MapPin className="h-3 w-3" />
                                        <span>Sites & Locations</span>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User profile + logout */}
            <div className="p-3 border-t border-border shrink-0 pb-24 md:pb-3">
                <div className="flex items-center space-x-3 px-2 py-2 rounded-xl hover:bg-secondary/50 transition-colors mb-1">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">{user?.fullName?.[0] || 'U'}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-foreground truncate">{user?.fullName || 'User'}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign out</span>
                </button>
            </div>
        </aside>
    );
};
