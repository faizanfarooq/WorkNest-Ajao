import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  MapPin, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Github, 
  Calendar,
  MessageSquare,
  Award,
  ChevronRight
} from 'lucide-react';
import { InternshipProject, CandidateProfile } from '../types';

interface ProjectDetailModalProps {
  project: InternshipProject | null;
  candidate: CandidateProfile;
  isOpen: boolean;
  onClose: () => void;
  onApply: (project: InternshipProject, customNote: string) => void;
  onStartChat: (startupId: string) => void;
  hasApplied?: boolean;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  candidate,
  isOpen,
  onClose,
  onApply,
  onStartChat,
  hasApplied = false,
}) => {
  const [customNote, setCustomNote] = useState('');
  const [activeTab, setActiveTab] = useState<'milestones' | 'founder' | 'apply'>('milestones');

  if (!isOpen || !project) return null;

  const candidateSkillNames = candidate.skills.map(s => s.name.toLowerCase());
  const matchedSkills = project.requiredSkills.filter(req => 
    candidateSkillNames.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs.split(' ')[0]))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="project-detail-modal-container"
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-3xl">
              {project.startup.logo}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-bold text-slate-900 text-base">{project.startup.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                  {project.startup.stage}
                </span>
                {project.graduatePriority && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                    Post-Grad Priority Launchpad
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {project.title}
              </h2>
              <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                  {project.startup.location}
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">{project.startup.remotePolicy}</span>
                <span>•</span>
                <span>{project.commitmentHours}</span>
              </div>
            </div>
          </div>

          <button
            id="close-project-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'milestones'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Milestone Deliverables ({project.milestones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('founder')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'founder'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Founder & Mentorship</span>
          </button>
          <button
            onClick={() => setActiveTab('apply')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'apply'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Proof-of-Work Match</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeTab === 'milestones' && (
            <div className="space-y-6">
              {/* Objective Box */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1">
                  Project Objective & Commercial Outcome
                </h3>
                <p className="text-xs text-indigo-950 leading-relaxed">
                  {project.objective}
                </p>
                <div className="mt-3 pt-3 border-t border-indigo-200/60 flex items-center justify-between text-xs font-semibold text-indigo-900">
                  <span>Total Escrow Stipend: <strong className="text-emerald-700 font-bold">{project.stipendTotal}</strong></span>
                  <span>Model: {project.stipendModel}</span>
                </div>
              </div>

              {/* What will go on your resume */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-900 mb-1">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Resume & Commercial Portfolio Impact (Guaranteed)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {project.outcomeExperience}
                </p>
              </div>

              {/* Milestones Timeline */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <span>Step-by-Step Project Milestones</span>
                  <span className="text-xs font-normal text-slate-500">(Payout released after founder signoff)</span>
                </h3>

                <div className="space-y-4">
                  {project.milestones.map((ms) => (
                    <div 
                      key={ms.id} 
                      className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 bg-white transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                            {ms.stepNumber}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{ms.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                            {ms.targetDuration}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                            {ms.payoutAmount}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2">
                        {ms.description}
                      </p>

                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Key Deliverables
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ms.deliverablesSummary.map((deliv, idx) => (
                            <span 
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center space-x-1"
                            >
                              <CheckCircle2 className="w-3 h-3 text-slate-500" />
                              <span>{deliv}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'founder' && (
            <div className="space-y-6">
              <div className="flex items-start space-x-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <img 
                  src={project.startup.founderAvatar} 
                  alt={project.startup.founderName}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200 shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{project.startup.founderName}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{project.startup.founderRole} at {project.startup.name}</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    "{project.startup.founderBio}"
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Direct Founder Communication & Mentorship
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Unlike traditional corporate internships where interns are lost in massive hierarchies, WorkFest Ajao places you directly in communication with startup founders and technical architects. You participate in real asynchronous architecture reviews, PR comments, and sprint demos.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    id="founder-tab-chat-btn"
                    onClick={() => {
                      onClose();
                      onStartChat(project.startup.id);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Message to {project.startup.founderName}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apply' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Your Proof-of-Work Portfolio Profile</span>
                </div>
                <p className="text-xs text-emerald-800">
                  This application attaches your verified GitHub repos, live deployments, and AI skill verification audit. No resume screening bots.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Portfolio Artifacts Transmitted with Application
                </h4>
                {candidate.projects.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{p.title}</span>
                      <p className="text-[11px] text-slate-500">{p.techStack.join(' • ')}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                      Verified {p.complexityScore}/100
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Optional Note to Founder {project.startup.founderName}
                </label>
                <textarea
                  id="application-note-textarea"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. As a recent CS graduate, I specialize in Go concurrency and have built a Raft storage engine. I am ready to start Milestone 1 immediately."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {project.spotsAvailable} spot{project.spotsAvailable > 1 ? 's' : ''} available • {project.activeApplicantsCount} portfolio applicants
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onStartChat(project.startup.id)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct Chat</span>
            </button>

            <button
              id="submit-modal-apply-btn"
              onClick={() => onApply(project, customNote)}
              disabled={hasApplied}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                hasApplied
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
              }`}
            >
              {hasApplied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Application Submitted</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Submit Proof-of-Work Application</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
