import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, HelpCircle } from 'lucide-react';
import { supportService, SupportRequest } from '../services/supportService';
import toast from 'react-hot-toast';

export const SupportPage: React.FC = () => {
    const [formData, setFormData] = useState<SupportRequest>({
        name: '',
        supportType: 'General Inquiry',
        description: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            await supportService.submitRequest(formData);
            toast.success('Your support request has been sent successfully.');
            setFormData({ name: '', supportType: 'General Inquiry', description: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to send support request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="mb-2 text-3xl font-extrabold tracking-tight lg:text-4xl flex items-center gap-3">
                    <HelpCircle className="h-8 w-8 text-primary" />
                    Support Center
                </h1>
                <p className="text-muted-foreground text-lg">
                    Need help? Fill out the form below and our team will get back to you shortly.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border bg-card p-6 shadow-sm md:p-10"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Your Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Type of Support *</label>
                            <select
                                value={formData.supportType}
                                onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="General Inquiry">General Inquiry</option>
                                <option value="Technical Issue">Technical Issue</option>
                                <option value="Billing">Billing Question</option>
                                <option value="Feature Request">Feature Request</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Description *</label>
                        <textarea
                            required
                            rows={6}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Please describe your issue or query in detail..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-bold text-white transition-all hover:bg-primary/90 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-5 w-5" />
                                    Send Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};