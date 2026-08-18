import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TrialBanner, TrialExpiredWall, useTrialEnforcement } from "../components/TrialBanner";

export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const isTrialExpired = useTrialEnforcement();

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
            {/* Blocking wall for expired trials */}
            {isTrialExpired && <TrialExpiredWall />}

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-all duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col relative w-full h-full overflow-hidden bg-secondary/30">

                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <TrialBanner />
                <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar flex flex-col items-center">
                    <div className="w-full max-w-7xl p-4 md:p-8 animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
