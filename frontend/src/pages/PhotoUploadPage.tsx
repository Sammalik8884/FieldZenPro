import { useState, useRef } from "react";
import { Camera, Search, Upload, CheckCircle2, Loader2, X } from "lucide-react";
import { workOrderService } from "../services/workOrderService";
import { WorkOrderDto } from "../types/field";
import { apiClient } from "../services/apiClient";
import { toast } from "react-hot-toast";

export const PhotoUploadPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WorkOrderDto[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedJob, setSelectedJob] = useState<WorkOrderDto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const all = await workOrderService.getMyJobs();
      const q = searchQuery.toLowerCase();
      const results = all.filter(w =>
        w.customerName?.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q) ||
        w.id.toString().includes(q)
      );
      setSearchResults(results.slice(0, 10));
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || !selectedJob) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        await apiClient.post(`/WorkOrders/${selectedJob.id}/evidence`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        uploaded.push(file.name);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    if (uploaded.length > 0) {
      setUploaded(prev => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} uploaded!`);
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start p-4 pt-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Photo Upload</h1>
        <p className="text-muted-foreground mt-1">Search for a job, then upload photos</p>
      </div>

      {/* Job Search */}
      {!selectedJob ? (
        <div className="w-full space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Search by customer, WO#, or description..."
              className="flex-1 bg-card border-2 border-border rounded-2xl px-4 py-4 text-base text-foreground focus:outline-none focus:border-primary min-h-[56px]"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-primary text-primary-foreground rounded-2xl px-5 py-4 font-bold min-h-[56px] min-w-[56px] flex items-center justify-center active:scale-95 transition-all"
            >
              {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium px-1">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
              {searchResults.map(job => (
                <button
                  key={job.id}
                  onClick={() => { setSelectedJob(job); setUploaded([]); }}
                  className="w-full bg-card border-2 border-border hover:border-primary/50 rounded-2xl p-4 text-left transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-primary/10 text-primary text-sm font-bold px-2 py-0.5 rounded-lg">WO-{job.id.toString().padStart(4, '0')}</span>
                    <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full border-border">{job.status}</span>
                  </div>
                  <p className="font-bold text-foreground">{job.customerName}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{job.description}</p>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !searching && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
              No jobs found. Try a different search.
            </div>
          )}
        </div>
      ) : (
        /* Upload Screen */
        <div className="w-full space-y-5">
          {/* Selected Job */}
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-lg">WO-{selectedJob.id.toString().padStart(4, '0')}</span>
                <p className="font-bold text-foreground text-lg mt-2">{selectedJob.customerName}</p>
                <p className="text-sm text-muted-foreground">{selectedJob.description}</p>
              </div>
              <button onClick={() => { setSelectedJob(null); setSearchResults([]); setSearchQuery(""); }} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Upload Buttons */}
          <div className="grid grid-cols-1 gap-4">
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} />

            <button
              onClick={() => cameraRef.current?.click()}
              disabled={uploading}
              className="w-full py-6 bg-primary text-primary-foreground rounded-2xl text-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all min-h-[80px] disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <Camera className="h-7 w-7" />}
              Take Photo
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-5 border-2 border-border text-foreground rounded-2xl text-lg font-bold flex items-center justify-center gap-3 active:scale-95 transition-all min-h-[68px] hover:border-primary/40 disabled:opacity-50"
            >
              <Upload className="h-6 w-6" />
              Choose from Gallery
            </button>
          </div>

          {/* Uploaded count */}
          {uploaded.length > 0 && (
            <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-emerald-600">{uploaded.length} photo{uploaded.length > 1 ? 's' : ''} uploaded</p>
                <p className="text-sm text-muted-foreground">Great job! You can upload more or search for another job.</p>
              </div>
            </div>
          )}

          <button
            onClick={() => { setSelectedJob(null); setSearchResults([]); setSearchQuery(""); setUploaded([]); }}
            className="w-full py-4 text-muted-foreground font-semibold text-base hover:text-foreground transition-colors"
          >
            ← Search for another job
          </button>
        </div>
      )}
    </div>
  );
};
