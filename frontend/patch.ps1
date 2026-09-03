$path = "src/pages/JobExecutionPage.tsx"
$content = Get-Content $path -Raw

# 1. Imports
$oldImports = "import { useAuth } from `"../auth/AuthContext`";`r`nimport { PlanFeature } from `"../types/auth`";"
$newImports = "import { useAuth } from `"../auth/AuthContext`";`r`nimport { PlanFeature } from `"../types/auth`";`r`nimport { CreateInvoiceModal } from `"../components/CreateInvoiceModal`";`r`nimport { invoiceService } from `"../services/invoiceService`";`r`nimport { Receipt } from `"lucide-react`";"
$content = $content.Replace($oldImports, $newImports)
$oldImports2 = "import { useAuth } from `"../auth/AuthContext`";`nimport { PlanFeature } from `"../types/auth`";"
$newImports2 = "import { useAuth } from `"../auth/AuthContext`";`nimport { PlanFeature } from `"../types/auth`";`nimport { CreateInvoiceModal } from `"../components/CreateInvoiceModal`";`nimport { invoiceService } from `"../services/invoiceService`";`nimport { Receipt } from `"lucide-react`";"
$content = $content.Replace($oldImports2, $newImports2)

# 2. State
$oldState = "const [result, setResult] = useState(1); // 1=Pass`r`n`r`n // Modal State"
$newState = "const [result, setResult] = useState(1); // 1=Pass`r`n`r`n // Modal State`r`n const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);`r`n const [invoiceModalProps, setInvoiceModalProps] = useState<{workOrderId?: number, customerId?: number, laborCost?: number}>({});"
$content = $content.Replace($oldState, $newState)
$oldState2 = "const [result, setResult] = useState(1); // 1=Pass`n`n // Modal State"
$newState2 = "const [result, setResult] = useState(1); // 1=Pass`n`n // Modal State`n const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);`n const [invoiceModalProps, setInvoiceModalProps] = useState<{workOrderId?: number, customerId?: number, laborCost?: number}>({});"
$content = $content.Replace($oldState2, $newState2)

# 3. Toast bypass
$content = $content.Replace("toast.success(`"Job marked as Complete — pending manager review.`");", "toast.success(`"Job completed! You can now generate an invoice.`");")

# 4. handleGenerateInvoice
$oldReopen = "    const handleReopen = async () => {"
$newGenerate = @"
    const handleGenerateInvoice = async () => {
        try {
            setActionLoading(true);
            const preview = await invoiceService.getPreviewFromJob(Number(id));
            setInvoiceModalProps({ workOrderId: Number(id), customerId: preview.customerId, laborCost: preview.laborCost });
            setInvoiceModalOpen(true);
        } catch (error: any) {
            toast.error(extractApiError(error, "Failed to prepare invoice."));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReopen = async () => {
"@
$content = $content.Replace($oldReopen, $newGenerate)

# 5. JSX
$oldJsx = @"
                        {job.completedDate && (
                            <div>
                                <span className="font-semibold text-muted-foreground block mb-1">Completed On:</span>
                                <span>{new Date(job.completedDate).toLocaleString()}</span>
                            </div>
                        )}
                        {job.status === 'PendingApproval' && (
"@
$newJsx = @"
                        {job.completedDate && (
                            <div>
                                <span className="font-semibold text-muted-foreground block mb-1">Completed On:</span>
                                <span>{new Date(job.completedDate).toLocaleString()}</span>
                            </div>
                        )}
                        {job.status === 'Completed' && (
                            <div className="pt-4 border-t border-border mt-4">
                                <button
                                    type="button"
                                    onClick={handleGenerateInvoice}
                                    disabled={actionLoading}
                                    className="w-full bg-green-500/10 text-green-500 font-semibold py-3 flex items-center justify-center gap-2 rounded-xl hover:bg-green-500/20 transition-all border border-green-500/30 disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Receipt className="h-5 w-5" />}
                                    <span>Generate Invoice & Collect Payment</span>
                                </button>
                            </div>
                        )}
                        {job.status === 'PendingApproval' && (
"@

$content = $content.Replace($oldJsx.Replace("`r`n", "`n"), $newJsx.Replace("`r`n", "`n"))
$content = $content.Replace($oldJsx.Replace("`n", "`r`n"), $newJsx.Replace("`n", "`r`n"))


# 6. Modal
$oldModal = @"
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                confirmText="Confirm"
            />
        </div>
    );
};
"@
$newModal = @"
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                confirmText="Confirm"
            />
            {invoiceModalOpen && (
                <CreateInvoiceModal
                    isOpen={invoiceModalOpen}
                    onClose={() => setInvoiceModalOpen(false)}
                    onSuccess={() => {
                        setInvoiceModalOpen(false);
                    }}
                    initialCustomerId={invoiceModalProps.customerId}
                    initialLaborCost={invoiceModalProps.laborCost}
                    workOrderId={invoiceModalProps.workOrderId}
                />
            )}
        </div>
    );
};
"@

$content = $content.Replace($oldModal.Replace("`r`n", "`n"), $newModal.Replace("`r`n", "`n"))
$content = $content.Replace($oldModal.Replace("`n", "`r`n"), $newModal.Replace("`n", "`r`n"))

Set-Content -Path $path -Value $content
