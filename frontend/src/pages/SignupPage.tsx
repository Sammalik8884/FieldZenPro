import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Briefcase, Phone, User, Users, FileText, Zap, ShieldCheck, CheckCircle } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface FormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  numberOfUsers: string;
  details: string;
}

export const SignupPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: OTP, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    numberOfUsers: '1-5',
    details: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/leads/send-otp', formData);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send verification code. Please check your email format.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiClient.post('/leads/verify-and-submit', {
        email: formData.email,
        otpCode: otp,
        requestData: formData
      });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel: Value Prop */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary p-12 text-primary-foreground flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">FieldZenPro</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">
            Built <span className="text-blue-200">Exclusively</span> For Your Workflow.
          </h1>
          <p className="text-lg text-primary-foreground/90 mb-12 max-w-md font-medium leading-relaxed">
            Stop forcing your business into rigid software. We design, build, and deploy a customized ERP system tailored perfectly to how you operate.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Zero Upfront Risk</h3>
                <p className="text-primary-foreground/80 text-sm mt-1">You don't pay a dime until you are completely satisfied with the product we build.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Lightning Fast Turnaround</h3>
                <p className="text-primary-foreground/80 text-sm mt-1">Our engineering team moves as fast as you can imagine. Get your system online in days, not months.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-tight text-foreground">Request Your Custom ERP</h2>
                <p className="text-muted-foreground mt-2">Fill out the details below. Our team will contact you immediately.</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> {error}
                </div>
              )}

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Contact Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input required name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Company Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input required name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="Acme HVAC" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Work Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="john@example.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-foreground">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all" placeholder="(555) 123-4567" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">Estimated Users</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select name="numberOfUsers" value={formData.numberOfUsers} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer">
                      <option value="1-5">1 - 5 Users</option>
                      <option value="6-15">6 - 15 Users</option>
                      <option value="16-50">16 - 50 Users</option>
                      <option value="50+">50+ Users</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">What do you need the system to do?</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <textarea required name="details" value={formData.details} onChange={handleChange} rows={4} className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none" placeholder="E.g., I need to track technicians, generate custom PDF invoices, and integrate with my parts supplier..." />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2 mt-2">
                  {loading ? <span className="animate-spin text-xl">⏳</span> : 'Continue to Verification'}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                Already have a portal? <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-black tracking-tight text-foreground">Verify Your Email</h2>
                <p className="text-muted-foreground mt-2">
                  We just sent a 6-digit verification code to <strong className="text-foreground">{formData.email}</strong>. 
                  Please enter it below to confirm your request.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl tracking-[1em] py-4 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono"
                    placeholder="••••••"
                  />
                </div>

                <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70">
                  {loading ? 'Verifying...' : 'Verify & Send Request'}
                </button>
              </form>
              
              <div className="mt-6 text-center">
                <button type="button" onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground underline">
                  Back to Form
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 text-center">
              <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground mb-4">Request Received!</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Thank you, <strong>{formData.contactPerson}</strong>. Your request has been securely sent to our engineering team. 
                We are reviewing your requirements and will reach out to you at <strong>{formData.phoneNumber}</strong> shortly to discuss your custom build.
              </p>
              <div className="p-6 bg-muted rounded-2xl">
                <h3 className="font-bold text-foreground mb-2">Next Steps</h3>
                <p className="text-sm text-muted-foreground mb-1">1. We analyze your workflow requirements.</p>
                <p className="text-sm text-muted-foreground mb-1">2. We contact you to clarify any details.</p>
                <p className="text-sm text-muted-foreground">3. We deliver a custom system for you to review risk-free.</p>
              </div>
              <Link to="/" className="inline-block mt-8 text-primary font-bold hover:underline">
                Return to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
