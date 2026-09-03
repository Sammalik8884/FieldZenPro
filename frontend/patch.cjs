const fs = require('fs');
let content = fs.readFileSync('src/pages/JobExecutionPage.tsx', 'utf8');

// 1. Imports
content = content.replace(
  'import { useAuth } from "../auth/AuthContext";\r\nimport { PlanFeature } from "../types/auth";',
  'import { useAuth } from "../auth/AuthContext";\r\nimport { PlanFeature } from "../types/auth";\r\nimport { CreateInvoiceModal } from "../components/CreateInvoiceModal";\r\nimport { invoiceService } from "../services/invoiceService";\r\nimport { Receipt } from "lucide-react";'
);
content = content.replace( // Try both newline types just in case
  'import { useAuth } from "../auth/AuthContext";\nimport { PlanFeature } from "../types/auth";',
  'import { useAuth } from "../auth/AuthContext";\nimport { PlanFeature } from "../types/auth";\nimport { CreateInvoiceModal } from "../components/CreateInvoiceModal";\nimport { invoiceService } from "../services/invoiceService";\nimport { Receipt } from "lucide-react";'
);

// 2. States
content = content.replace(
  'const [result, setResult] = useState(1); // 1=Pass\r\n\r\n    // Modal State',
  'const [result, setResult] = useState(1); // 1=Pass\r\n\r\n    // Modal State\r\n    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);\r\n    const [invoiceModalProps, setInvoiceModalProps] = useState<{workOrderId?: number, customerId?: number, laborCost?: number}>({});'
);
content = content.replace(
  'const [result, setResult] = useState(1); // 1=Pass\n\n    // Modal State',
  'const [result, setResult] = useState(1); // 1=Pass\n\n    // Modal State\n    const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);\n    const [invoiceModalProps, setInvoiceModalProps] = useState<{workOrderId?: number, customerId?: number, laborCost?: number}>({});'
);

// 3. handleComplete bypass and toast
content = content.replace(
  'toast.success("Job marked as Complete — pending manager review.");',
  'toast.success("Job completed! You can now generate an invoice.");'
);

// 4. Add handleGenerateInvoice
const handleReopen = `    const handleReopen = async () => {`;
const generateFunc = `    const handleGenerateInvoice = async () => {
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

    const handleReopen = async () => {`;
content = content.replace(handleReopen, generateFunc);

// 5. Add button and modal
const jsxFind = `                        {job.completedDate && (
                            <div>
                                <span className="font-semibold text-muted-foreground block mb-1">Completed On:</span>
                                <span>{new Date(job.completedDate).toLocaleString()}</span>
                            </div>
                        )}
                        {job.status === 'PendingApproval' && (`.replace(/\n/g, '\r\n');

const jsxReplace = `                        {job.completedDate && (
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
                        {job.status === 'PendingApproval' && (`.replace(/\n/g, '\r\n');
content = content.replace(jsxFind, jsxReplace);
content = content.replace(jsxFind.replace(/\r\n/g, '\n'), jsxReplace.replace(/\r\n/g, '\n'));

const modalFind = `            <ConfirmModal
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
};`.replace(/\n/g, '\r\n');

const modalReplace = `            <ConfirmModal
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
};`.replace(/\n/g, '\r\n');
content = content.replace(modalFind, modalReplace);
content = content.replace(modalFind.replace(/\r\n/g, '\n'), modalReplace.replace(/\r\n/g, '\n'));

fs.writeFileSync('src/pages/JobExecutionPage.tsx', content);
