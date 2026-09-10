import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { RoleProtectedRoute } from "./auth/RoleProtectedRoute";
import { FeatureProtectedRoute } from "./auth/FeatureProtectedRoute";
import { PlanFeature } from "./types/auth";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { CustomerPortalLayout } from "./layouts/CustomerPortalLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { WeeklyReportPage } from "./pages/WeeklyReportPage";
import { CustomersPage } from "./pages/CustomersPage";`r`nimport { CustomerProfilePage } from "./pages/CustomerProfilePage";
import { SitesPage } from "./pages/SitesPage";
import { CategoriesPage } from "./pages/CategoriesPage";
import { ProductsPage } from "./pages/ProductsPage";
import { QuotationsPage } from "./pages/QuotationsPage";
import { QuotationFormPage } from "./pages/QuotationFormPage";
import { UsersPage } from "./pages/UsersPage";
import { AssetsPage } from "./pages/AssetsPage";
import { WorkOrdersPage } from "./pages/WorkOrdersPage";
import { MyJobsPage } from "./pages/MyJobsPage";
import { JobExecutionPage } from "./pages/JobExecutionPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { InventoryPage } from "./pages/InventoryPage";
import { PayrollPage } from "./pages/PayrollPage";
import { ContractsPage } from "./pages/ContractsPage";
import { ProcurementPage } from "./pages/ProcurementPage";
import { ChecklistBuilderPage } from "./pages/ChecklistBuilderPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { SyncDashboardPage } from "./pages/SyncDashboardPage";
import { CustomerPortalDashboardPage } from "./pages/CustomerPortalDashboardPage";
import { CustomerInvoicesPage } from "./pages/CustomerInvoicesPage";
import { SubscriptionPlansPage } from "./pages/SubscriptionPlansPage";
import { SubscriptionSuccessPage } from "./pages/SubscriptionSuccessPage";
import { SubscriptionCancelPage } from "./pages/SubscriptionCancelPage";
import { SupportPage } from "./pages/SupportPage";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./auth/AuthContext";
import { SyncProvider } from "./contexts/SyncContext";
import SyncStatusWidget from "./components/common/SyncStatusWidget";

// Smart root route: Logged out -> /landing, Logged in -> dashboard/portal
const RootRoute = () => {
    const { isAuthenticated, hasRole } = useAuth();
    if (!isAuthenticated) {
        window.location.href = "/landing";
        return null;
    }
    return hasRole(["Customer"]) ? <Navigate to="/portal" replace /> : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <AuthProvider>
            <SyncProvider>
                <Router>
                    <Routes>
                        {/* ── Public Routes ── */}
                        <Route path="/" element={<RootRoute />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />

                        {/* ── Main App (protected) ── */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<DashboardLayout />}>
                                <Route path="/dashboard" element={<DashboardPage />} />

                                {/* CRM - Admin/Manager */}
                                <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                                    <Route path="/customers" element={<CustomersPage />} />`r`n                                    <Route path="/customers/:id" element={<CustomerProfilePage />} />
                                    <Route path="/sites" element={<SitesPage />} />
                                </Route>

                                {/* Catalog & Sales - Engineer/Manager/Admin */}
                                <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager", "Engineer"]} />}>
                                    <Route path="/categories" element={<CategoriesPage />} />
                                    <Route path="/products" element={<ProductsPage />} />
                                    <Route path="/quotations" element={<QuotationsPage />} />
                                    <Route path="/quotations/new" element={<QuotationFormPage />} />
                                    <Route path="/quotations/edit/:id" element={<QuotationFormPage />} />
                                    <Route path="/contracts" element={<ContractsPage />} />
                                </Route>

                                {/* System / Admin */}
                                <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                                    <Route path="/users" element={<UsersPage />} />
                                    <Route element={<FeatureProtectedRoute requiredFeature={PlanFeature.HrPayroll} />}>
                                        <Route path="/payroll" element={<PayrollPage />} />
                                    </Route>
                                    <Route element={<FeatureProtectedRoute requiredFeature={PlanFeature.ChecklistFormBuilder} />}>
                                        <Route path="/checklists" element={<ChecklistBuilderPage />} />
                                    </Route>
                                    <Route element={<FeatureProtectedRoute requiredFeature={PlanFeature.AuditLogs} />}>
                                        <Route path="/audit-logs" element={<AuditLogsPage />} />
                                    </Route>
                                    <Route element={<FeatureProtectedRoute requiredFeature={PlanFeature.OfflineSync} />}>
                                        <Route path="/sync-dashboard" element={<SyncDashboardPage />} />
                                    </Route>
                                    <Route path="/subscription/plans" element={<SubscriptionPlansPage />} />
                                    <Route path="/support" element={<SupportPage />} />
                                </Route>

                                {/* Operations / Dispatch - Admin/Manager */}
                                <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                                    <Route path="/assets" element={<AssetsPage />} />
                                    <Route path="/work-orders" element={<WorkOrdersPage />} />
                                    <Route path="/inventory" element={<InventoryPage />} />
                                    <Route path="/procurement" element={<ProcurementPage />} />
                                </Route>

                                {/* Finance - Admin/Manager */}
                                <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                                    <Route path="/invoices" element={<InvoicesPage />} />
                                    <Route path="/weekly-report" element={<WeeklyReportPage />} />
                                </Route>

                                {/* Field Services - all staff */}
                                <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager", "Engineer", "Worker", "Technician"]} />}>
                                    <Route path="/my-jobs" element={<MyJobsPage />} />
                                    <Route path="/job/:id" element={<JobExecutionPage />} />
                                </Route>
                            </Route>

                            {/* Subscription full-screen routes (no sidebar) */}
                            <Route element={<RoleProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                                <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
                                <Route path="/subscription/cancel" element={<SubscriptionCancelPage />} />
                            </Route>
                        </Route>

                        {/* ── Customer Portal ── */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<RoleProtectedRoute allowedRoles={["Customer"]} />}>
                                <Route element={<CustomerPortalLayout />}>
                                    <Route path="/portal" element={<CustomerPortalDashboardPage />} />
                                    <Route path="/portal/invoices" element={<CustomerInvoicesPage />} />
                                </Route>
                            </Route>
                        </Route>
                    </Routes>
                </Router>

                <SyncStatusWidget />

                {/* Toast — bottom-center, above BottomNav on mobile */}
                <Toaster
                    position="bottom-center"
                    gutter={8}
                    containerStyle={{ bottom: '5rem' }}
                    toastOptions={{
                        className: 'bg-card text-foreground border border-border shadow-lg rounded-xl text-sm font-medium',
                        duration: 3500,
                        style: { maxWidth: '380px' },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
            </SyncProvider>
        </AuthProvider>
    );
}

export default App;

