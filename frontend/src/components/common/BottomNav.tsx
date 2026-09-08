import { NavLink, useLocation } from "react-router-dom";
import { Home, Wrench, Users, Receipt, Menu } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

interface BottomNavProps {
    onMenuClick: () => void;
}

export const BottomNav = ({ onMenuClick }: BottomNavProps) => {
    const location = useLocation();
    const { hasRole } = useAuth();
    const isTech = hasRole(["Technician"]) && !hasRole(["Admin", "Manager"]);

    const isActive = (path: string) => location.pathname.startsWith(path);

    return (
        <nav className="fixed bottom-0 inset-x-0 z-50 bg-card border-t border-border flex md:hidden safe-area-inset-bottom">
            <NavLink
                to="/dashboard"
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
            >
                <Home className="h-5 w-5" />
                <span className="text-[10px] font-medium">Home</span>
            </NavLink>

            <NavLink
                to="/my-jobs"
                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${isActive('/my-jobs') || isActive('/job/') ? 'text-primary' : 'text-muted-foreground'}`}
            >
                <Wrench className="h-5 w-5" />
                <span className="text-[10px] font-medium">My Jobs</span>
            </NavLink>

            {!isTech && (
                <NavLink
                    to="/customers"
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${isActive('/customers') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <Users className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Customers</span>
                </NavLink>
            )}

            {!isTech && (
                <NavLink
                    to="/invoices"
                    className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${isActive('/invoices') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                    <Receipt className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Invoices</span>
                </NavLink>
            )}

            <button
                onClick={onMenuClick}
                className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-muted-foreground"
            >
                <Menu className="h-5 w-5" />
                <span className="text-[10px] font-medium">Menu</span>
            </button>
        </nav>
    );
};
