import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    Home, Users, MapPin, Briefcase, LogOut, FileText, FolderTree, Package, Receipt,
    ShieldAlert, X, Box, Wrench, DollarSign, FileSignature, ShoppingCart, ClipboardList,
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

    { label: "CRM & Assets", isHeader: true, allowedRoles: ["Admin", "Manager"] },
    { label: "Customers (CRM)", href: "/customers", icon: Users, paths: ["/customers", "/sites"], allowedRoles: ["Admin", "Manager"] },
    { label: "Assets", href: "/assets", icon: Box, allowedRoles: ["Admin", "Manager"] },

    { label: "Inventory", isHeader: true, allowedRoles: ["Admin", "Manager", "Engineer"] },
    { label: "Catalog (Items)", href: "/products", icon: Package, paths: ["/products"], allowedRoles: ["Admin", "Manager", "Engineer"] },
    { label: "Procurement (POs)", href: "/procurement", icon: ShoppingCart, allowedRoles: ["Admin", "Manager"] },
    { label: "Inventory", href: "/inventory", icon: FolderTree, allowedRoles: ["Admin", "Manager"] },

    { label: "Operations & Jobs", isHeader: true, allowedRoles: ["Admin", "Manager", "Engineer", "Worker", "Technician"] },
    { label: "Sales & Quotes", href: "/quotations", icon: FileText, paths: ["/quotations", "/quotations/new", "/quotations/edit"], allowedRoles: ["Admin", "Manager", "Engineer"] },
    { label: "Contracts & AMCs", href: "/contracts", icon: FileSignature, allowedRoles: ["Admin", "Manager", "Engineer"] },
    { label: "Dispatch (Jobs)", href: "/work-orders", icon: Briefcase, allowedRoles: ["Admin", "Manager"] },
    { label: "My Jobs", href: "/my-jobs", icon: Wrench, paths: ["/my-jobs", "/job/:id"], allowedRoles: ["Admin", "Manager", "Engineer", "Worker", "Technician"] },
    { label: "Checklist Form Builder", href: "/checklists", icon: ClipboardList, allowedRoles: ["Admin", "Manager"], requiredFeature: PlanFeature.ChecklistFormBuilder },

    { label: "Financials", isHeader: true, allowedRoles: ["Admin", "Manager"] },
    { label: "Invoices", href: "/invoices", icon: Receipt, allowedRoles: ["Admin", "Manager"] },
    { label: "Weekly Report", href: "/weekly-report", icon: FileText, allowedRoles: ["Admin", "Manager"] },
    { label: "HR & Payroll", href: "/payroll", icon: DollarSign, allowedRoles: ["Admin", "Manager"], requiredFeature: PlanFeature.HrPayroll },

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
        <div className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r border-border text-foreground w-64 transition-transform duration-300 ease-in-out h-full",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="p-6 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="text-primary p-1">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-wide font-sans text-primary">
                        FieldZenPro
                    </span>
                </div>
                <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-secondary/50 rounded-lg">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 relative overflow-y-auto custom-scrollbar">
                {SIDEBAR_ITEMS.map((item, index) => {
                    if (item.allowedRoles && !hasRole(item.allowedRoles)) {
                        return null;
                    }

                    if (item.isHeader) {
                        return (
                            <div key={`header-${index}`} className="px-4 pt-5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                {item.label}
                            </div>
                        );
                    }

                    const href = item.href as string;
                    const isActive = location.pathname === href || item.paths?.includes(location.pathname);
                    const isLocked = item.requiredFeature ? !hasFeature(item.requiredFeature) : false;

                    return (
                        <div key={href} className="space-y-1">
                            {isLocked ? (
                                <button
                                    onClick={() => {
                                        if (isOpen) onClose();
                                        navigate("/subscription/plans");
                                    }}
                                    className="w-full flex items-center justify-between space-x-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group font-medium text-sm text-muted-foreground/50 hover:bg-secondary/20 hover:text-muted-foreground"
                                    title="Upgrade to Pro to unlock this feature"
                                >
                                    <div className="flex items-center space-x-3">
                                        <item.icon className="h-5 w-5 opacity-50" />
                                        <span>{item.label}</span>
                                    </div>
                                    <div className="bg-background/80 p-1 rounded backdrop-blur-sm border border-border/50">
                                        <Lock className="h-3 w-3 text-amber-500/70" />
                                    </div>
                                </button>
                            ) : (
                                <NavLink
                                    to={href}
                                    onClick={() => { if (isOpen) onClose(); }}
                                    className={cn(
                                        "flex items-center justify-between space-x-3 pl-6 pr-4 py-2.5 rounded-r-full mr-3 transition-colors duration-200 font-medium text-sm",
                                        isActive
                                            ? "bg-accent text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    <div className="flex items-center space-x-4">
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                        <span>{item.label}</span>
                                    </div>
                                </NavLink>
                            )}

                            {/* Submenu for Catalog (Removed) */}
                            {/* Submenu for CRM */}
                            {!isLocked && item.label === "Customers (CRM)" && isActive && (
                                <div className="pl-12 flex flex-col space-y-1 mt-1 animate-in slide-in-from-top-2 duration-200">
                                    <NavLink
                                        to="/customers"
                                        className={({ isActive }) => cn(
                                            "text-xs py-2 px-2 rounded-md transition-colors",
                                            isActive ? "text-primary font-medium bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        )}
                                    >
                                        Client List
                                    </NavLink>
                                    <NavLink
                                        to="/sites"
                                        className={({ isActive }) => cn(
                                            "text-xs py-2 px-2 rounded-md transition-colors flex items-center space-x-2",
                                            isActive ? "text-primary font-medium bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                                        )}
                                    >
                                        <MapPin className="h-3 w-3" />
                                        <span>Sites & Locations</span>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center space-x-3 mb-4 px-2">
                    <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                        <span className="text-primary font-bold">
                            {user?.fullName?.[0] || 'U'}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground truncate w-32">{user?.fullName || 'User'}</span>
                        <span className="text-xs text-muted-foreground truncate w-32">{user?.email}</span>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 mt-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors duration-200"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign out</span>
                </button>
            </div>
        </div>
    );
};
