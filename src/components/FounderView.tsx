import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  Layers, 
  MessageSquare, 
  FileCheck, 
  Plus, 
  X,
  ExternalLink,
  Award,
  Clock,
  UserCheck
} from 'lucide-react';
import { CandidateProfile, InternshipProject, Startup } from '../types';

interface FounderViewProps {
  startup: Startup;
  candidate: CandidateProfile;
  projects: InternshipProject[];
  onApproveMilestone: (projectId: string, milestoneId: string) => void;
  onOpenChat: (startupId: string) => void;
  onPostNewProject: (newProject: any) => void;
}

export const FounderView: React.FC<FounderViewProps> = ({
  startup,
  candidate,
  projects,
  onApproveMilestone,
  onOpenChat,
  onPostNewProject,
}) => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrack, setNewTrack] = useState<InternshipProject['track']>('CS Backend & Distributed Systems');
  const [newStipend, setNewStipend] = useState('$3,500');
  const [newDuration, setNewDuration] = useState(8);
  const [newSummary, setNewSummary] = useState('');
  const [newSkills, setNewSkills] = useState('Go, Redis, Docker, Concurrency');

  const activeProject = projects[0];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onPostNewProject({
      title: newTitle.trim(),
      track: newTrack,
      stipendTotal: newStipend,
      durationWeeks: newDuration,
      summary: newSummary || 'Real-world startup engineering milestone internship.',
      requiredSkills: newSkills.split(',').map(s => s.trim()).filter(Boolean),
    });

    setNewTitle('');
    setShowPostModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Founder Control Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={startup.founderAvatar}
              alt={startup.founderName}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Founder Dashboard Mode
                </span>
                <span className="text-xs text-slate-400">{startup.stage}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mt-1">
                {startup.founderName} • {startup.name}
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Evaluating candidate code artifacts without GPA bias. Fast-tracking qualified CS and IT graduates into high-impact virtual engineering milestones.
              </p>
            </div>
          </div>

          <button
            id="founder-post-project-btn"
            onClick={() => setShowPostModal(true)}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Milestone Project</span>
          </button>
        </div>
      </div>

      {/* Top Review Section: Incoming Portfolio-Matched Applicants */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Proof-of-Work Applicant Pipeline
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Matched Candidates (Ranked by Verified Code Quality, Not GPA)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">1 Qualified Applicant</span>
        </div>

        {/* Candidate card */}
        <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all bg-slate-50/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">{candidate.name}</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {candidate.overallMatchRating}% Verified Portfolio Match
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                    {candidate.graduationStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  {candidate.bio}
                </p>

                {/* Verified Badges */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {candidate.verifiedBadges.map((b) => (
                    <span key={b.id} className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{b.title} ({b.score}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 self-end md:self-center shrink-0">
              <button
                id="founder-chat-candidate-btn"
                onClick={() => onOpenChat(startup.id)}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Direct Chat</span>
              </button>

              <button
                id="founder-inspect-repo-btn"
                onClick={() => window.open(candidate.projects[0].repoUrl, '_blank')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Inspect Verified Repo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Milestone Deliverable Signoff Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Active Milestone Review & Escrow Release
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {activeProject.title}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-600">
            Escrow Escort: {activeProject.stipendTotal}
          </span>
        </div>

        <div className="space-y-3">
          {activeProject.milestones.map((ms) => (
            <div
              key={ms.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {ms.stepNumber}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{ms.title}</h4>
                  <span className="text-xs text-slate-500 font-mono">({ms.payoutAmount})</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{ms.description}</p>
              </div>

              <div className="shrink-0 flex items-center space-x-2">
                {ms.status === 'approved' ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Approved & Paid</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onApproveMilestone(activeProject.id, ms.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Deliverables & Release {ms.payoutAmount}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post New Milestone Project Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Post Milestone Virtual Internship
                </h3>
                <p className="text-xs text-slate-500">
                  No GPA filler. Define real engineering deliverables for CS/IT grads.
                </p>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Project Title / Engineering Focus
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Build Distributed CDC Sync Pipeline in Go"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Track
                  </label>
                  <select
                    value={newTrack}
                    onChange={(e) => setNewTrack(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="CS Backend & Distributed Systems">CS Backend & Distributed</option>
                    <option value="IT Cloud & Platform Engineering">IT Cloud & DevOps</option>
                    <option value="Full-Stack Modern Web">Full-Stack Web</option>
                    <option value="AI & LLM Data Engineering">AI & Data Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Total Escrow Stipend
                  </label>
                  <input
                    type="text"
                    value={newStipend}
                    onChange={(e) => setNewStipend(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none font-bold text-emerald-700"
                    placeholder="$3,200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Required Verified Stack (Comma separated)
                </label>
                <input
                  type="text"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none font-mono"
                  placeholder="Go, Redis, Docker, Concurrency"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Deliverable Summary & Outcome
                </label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
                  placeholder="Describe the real-world milestone goals the graduate will build..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Publish Project to Launchpad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
