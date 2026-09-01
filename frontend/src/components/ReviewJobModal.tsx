import { X } from "lucide-react";
import { WorkOrderDto } from "../types/field";

interface ReviewJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    workOrder: WorkOrderDto | null;
}

export const ReviewJobModal = ({ isOpen, onClose, workOrder }: ReviewJobModalProps) => {
    if (!isOpen || !workOrder) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-secondary w-full max-w-3xl rounded-xl shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">Review Work Order</h2>
                    <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Technician</p>
                            <p className="font-medium text-foreground">{workOrder.technicianName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Result</p>
                            <p className="font-medium text-foreground">{workOrder.result || 'Unknown'}</p>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-foreground mb-2">Technician Notes</p>
                        <div className="p-4 rounded-lg bg-black/20 border border-border text-sm text-muted-foreground min-h-[100px]">
                            {workOrder.technicianNotes || "No notes provided."}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-foreground mb-2">Evidences / Photos ({workOrder.evidences?.length || 0})</p>
                        {workOrder.evidences && workOrder.evidences.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {workOrder.evidences.map(ev => (
                                    <a key={ev.id} href={ev.fileUrl} target="_blank" rel="noopener noreferrer" className="block border border-border rounded-lg overflow-hidden group">
                                        <div className="aspect-square bg-black/40 flex items-center justify-center p-2 relative">
                                            {ev.fileType.startsWith('image/') ? (
                                                <img src={ev.fileUrl} alt={ev.fileName} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="text-xs text-center text-muted-foreground break-all">{ev.fileName}</div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-xs font-medium text-white">Click to view</span>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">No evidence uploaded.</p>
                        )}
                    </div>
                </div>
                
                <div className="p-6 border-t border-border flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-foreground font-medium rounded-lg transition-colors border border-border">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
