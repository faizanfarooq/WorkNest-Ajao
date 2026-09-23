import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  Github, 
  Send, 
  Award, 
  AlertCircle,
  FileCheck,
  Sparkles,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { InternshipProject, Milestone } from '../types';

interface MilestoneTrackerProps {
  project: InternshipProject;
  onUpdateMilestone: (milestoneId: string, submission: any) => void;
  onFounderApproveMilestone: (milestoneId: string) => void;
  onOpenChat: (startupId: string) => void;
  onViewDocuments: () => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  project,
  onUpdateMilestone,
  onFounderApproveMilestone,
  onOpenChat,
  onViewDocuments,
}) => {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(project.milestones[1].id);
  const [prUrl, setPrUrl] = useState('https://github.com/hyperflow-oss/cache-mesh/pull/29');
  const [demoUrl, setDemoUrl] = useState('https://loom.com/share/hyperflow-go-driver-demo');
  const [notes, setNotes] = useState('Completed the core Go client connection pool with RESP3 client tracking. Benchmarks show sub-0.8ms read latency under 15k concurrent goroutines.');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const selectedMilestone = project.milestones.find(m => m.id === selectedMilestoneId) || project.milestones[0];

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMilestone(selectedMilestone.id, {
      prUrl,
      demoUrl,
      architectureNotes: notes,
      submittedAt: new Date().toISOString().split('T')[0]
    });
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const totalEarned = project.milestones
    .filter(m => m.status === 'approved')
    .reduce((acc, curr) => acc + parseInt(curr.payoutAmount.replace(/\D/g, '') || '0'), 0);

  return (
    <div className="space-y-6">
      {/* Top Project Status Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl shrink-0 shadow-xs">
              {project.startup.logo}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Virtual Internship
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Milestone Driven
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {project.title}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Startup: <strong className="text-slate-800 font-semibold">{project.startup.name}</strong> • Founder: {project.startup.founderName} ({project.startup.location})
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-4 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 block">Total Escrow</span>
              <span className="text-sm font-extrabold text-slate-900">{project.stipendTotal}</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[11px] text-slate-500 block">Released Payout</span>
              <span className="text-sm font-extrabold text-emerald-700">PKR {totalEarned.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <span className="text-[11px] text-slate-500 block">Progress</span>
              <span className="text-sm font-extrabold text-indigo-600">
                {project.milestones.filter(m => m.status === 'approved').length}/{project.milestones.length} Sprints
              </span>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <span>Primary Focus: <strong>Real-World Code Artifacts & Commercial Proof</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="milestone-chat-founder-btn"
              onClick={() => onOpenChat(project.startup.id)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ping Founder ({project.startup.founderName.split(' ')[0]})</span>
            </button>
            <button
              id="milestone-view-docs-btn"
              onClick={onViewDocuments}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Signed Agreements & NDAs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Milestones List + Submission Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Milestones Stepper List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1">
            Project Collaboration Roadmap
          </h3>

          <div className="space-y-3">
            {project.milestones.map((ms) => {
              const isSelected = ms.id === selectedMilestoneId;
              return (
                <div
                  key={ms.id}
                  id={`milestone-step-${ms.id}`}
                  onClick={() => setSelectedMilestoneId(ms.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-indigo-600 ring-2 ring-indigo-600/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        ms.status === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : ms.status === 'under_review'
                          ? 'bg-amber-500 text-white'
                          : ms.status === 'in_progress'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {ms.status === 'approved' ? '✓' : ms.stepNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{ms.title}</h4>
                    </div>

                    <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      ms.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : ms.status === 'under_review'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : ms.status === 'in_progress'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ms.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {ms.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">{ms.targetDuration}</span>
                    <span className="font-extrabold text-emerald-700">{ms.payoutAmount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Milestone Detail & Submission Box */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Milestone #{selectedMilestone.stepNumber} Focus
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedMilestone.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Expected Timeline: {selectedMilestone.targetDuration} • Escrow Payout: {selectedMilestone.payoutAmount}
                </p>
              </div>

              {selectedMilestone.status === 'in_progress' && (
                <button
                  id="simulate-founder-approve-btn"
                  onClick={() => onFounderApproveMilestone(selectedMilestone.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                  title="Simulate Founder Signoff & Escrow Release"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Founder Approval</span>
                </button>
              )}
            </div>

            {/* Description & Deliverables */}
            <div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedMilestone.description}
              </p>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Expected Proof-of-Work Deliverables
                </span>
                <div className="space-y-1.5">
                  {selectedMilestone.deliverablesSummary.map((d, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* If approved, show Founder Feedback review */}
            {selectedMilestone.founderFeedback && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Founder Sign-off & Escrow Released ({selectedMilestone.payoutAmount})</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    Reviewed: {selectedMilestone.founderFeedback.reviewedAt}
                  </span>
                </div>
                <p className="text-xs text-emerald-950 italic">
                  "{selectedMilestone.founderFeedback.comment}"
                </p>
                <div className="text-[11px] text-emerald-800 font-medium">
                  Verified rating: ⭐⭐⭐⭐⭐ 5/5
                </div>
              </div>
            )}

            {/* Deliverable Submission Form */}
            {selectedMilestone.status !== 'approved' ? (
              <form onSubmit={handleSubmitDeliverable} className="space-y-4 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Submit Deliverable for Founder Review
                </h4>

                {submitSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Deliverables transmitted to founder {project.startup.founderName} for review!</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    GitHub Pull Request / Branch URL
                  </label>
                  <div className="relative">
                    <Github className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id="deliverable-pr-input"
                      type="url"
                      value={prUrl}
                      onChange={(e) => setPrUrl(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                      placeholder="https://github.com/..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Demo Video / Live Staging URL (Loom or Web)
                  </label>
                  <input
                    id="deliverable-demo-input"
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="https://loom.com/..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Architecture Implementation Notes & Benchmark Findings
                  </label>
                  <textarea
                    id="deliverable-notes-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="Explain architectural decisions, test coverage results, and how you validated performance..."
                    required
                  />
                </div>

                <button
                  id="submit-deliverable-btn"
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Milestone Deliverable & Request Escrow Payout</span>
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-900">Milestone Completed & Verified</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Deliverables signed by founder {project.startup.founderName}. Milestone stipend released to your linked Pakistani bank account.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
