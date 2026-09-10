import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "../components/common/BottomNav";
import { TrialBanner, TrialExpiredWall, useTrialEnforcement } from "../components/TrialBanner";

export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isTrialExpired = useTrialEnforcement();

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
            {/* Blocking wall for expired trials */}
            {isTrialExpired && <TrialExpiredWall />}

            {/* Mobile overlay — only shown when sidebar is open on mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar — permanent on desktop, slide-in on mobile */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden bg-secondary/30">
                {/* Header — on desktop the hamburger opens sidebar as overlay still works but isn't needed */}
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <TrialBanner />

                <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar scroll-smooth-ios pb-20 md:pb-0">
                    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav onMenuClick={() => setIsSidebarOpen(true)} />
        </div>
    );
};

