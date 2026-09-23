import React, { useState } from 'react';
import { 
  X, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Award, 
  Code2, 
  ShieldCheck, 
  GraduationCap, 
  Layers,
  Sparkles,
  EyeOff,
  Eye,
  Mail,
  Users,
  GitPullRequest,
  Star,
  Globe2
} from 'lucide-react';
import { CandidateProfile } from '../types';

interface CandidateProfileModalProps {
  candidate: CandidateProfile;
  isOpen: boolean;
  onClose: () => void;
  onRunAudit: () => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onRunAudit,
}) => {
  const [hideGpa, setHideGpa] = useState<boolean>(candidate.hideGpaFromRecruiter ?? true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-start space-x-4">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500 shadow-xs"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-extrabold text-slate-900">{candidate.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>{candidate.portfolioReliabilityScore}% Code Reliability Score</span>
                </span>
              </div>
              <p className="text-xs text-indigo-700 font-semibold flex items-center space-x-1">
                <GraduationCap className="w-4 h-4" />
                <span>{candidate.degreeInfo} • {candidate.university} ({candidate.graduationYear})</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                <span className="flex items-center space-x-1 text-slate-700 font-medium">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{candidate.email}</span>
                </span>
                <span>•</span>
                <span>Status: <strong className="text-amber-800">{candidate.graduationStatus}</strong></span>
                <span>•</span>
                <span>{candidate.location}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* GPA Shield Banner & Toggle */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                {hideGpa ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div>
                <div className="font-extrabold text-xs text-white flex items-center space-x-1.5">
                  <span>WorkNest GPA Shield:</span>
                  <span className={hideGpa ? 'text-emerald-400' : 'text-amber-400'}>
                    {hideGpa ? 'Active (Concealed from Recruiters)' : 'Visible (2.4 CGPA)'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  {hideGpa 
                    ? 'Pakistani software houses and US clients only see your AST Code Audits & Merged Pull Requests.'
                    : 'Your raw academic GPA is visible alongside your portfolio.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setHideGpa(!hideGpa)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-[11px] transition-colors cursor-pointer shrink-0"
            >
              {hideGpa ? 'Toggle GPA Public' : 'Hide GPA from Recruiters'}
            </button>
          </div>

          {/* Post-Grad Launchpad Highlight */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Graduate Proof-over-Pedigree Philosophy</span>
            </span>
            <p className="text-amber-950 leading-relaxed">
              "{candidate.unplacedGraduateStory}"
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Reliability Score</span>
              <span className="text-lg font-extrabold text-emerald-700">{candidate.portfolioReliabilityScore}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Paid Milestones</span>
              <span className="text-lg font-extrabold text-indigo-700">{candidate.completedMilestonesCount} Done</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Internship</span>
              <span className="text-lg font-extrabold text-slate-800">{candidate.activeInternshipsCount} (FinFlow)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Remote Roles</span>
              <span className="text-lg font-extrabold text-purple-700">{candidate.remoteApplicationsCount} Applied</span>
            </div>
          </div>

          {/* AI Verified Badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>AI-Verified Competency Badges ({candidate.verifiedBadges.length})</span>
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onRunAudit();
                }}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audit New Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {candidate.verifiedBadges.map((badge) => (
                <div key={badge.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">{badge.category}</span>
                    <span className="font-mono text-emerald-700 font-bold text-xs">{badge.score}%</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">{badge.title}</h4>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                    <span>{badge.level}</span>
                    <span>{badge.verificationHash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Peer Review Squad Feedback */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Peer Review Squad Code Audits (Senior Pakistani Engineers)</span>
            </h3>

            <div className="space-y-3">
              {candidate.peerReviewSquads?.map((squad) => (
                <div key={squad.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{squad.title}</h4>
                      <p className="text-[11px] text-indigo-700 font-medium mt-0.5">
                        Reviewed by {squad.reviewerName} ({squad.reviewerRole})
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {squad.score}/100 Score
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 italic">
                    "{squad.feedbackSummary}"
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-400 font-mono">{squad.date}</span>
                    <a
                      href={squad.githubPrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                    >
                      <GitPullRequest className="w-3 h-3" />
                      <span>View Merged PR</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluated Portfolio Repositories */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center space-x-1.5">
              <Github className="w-4 h-4 text-slate-900" />
              <span>Evaluated Portfolio Repositories (Proof of Work)</span>
            </h3>

            <div className="space-y-3">
              {candidate.projects.map((p) => (
                <div key={p.id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{p.title}</h4>
                      <p className="text-slate-600 mt-0.5">{p.description}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200 shrink-0">
                      Score: {p.complexityScore}/100
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1">
                    {p.architectureHighlights.map((hl, i) => (
                      <div key={i} className="flex items-center space-x-2 text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>

                  {/* Code metrics */}
                  {p.codeMetrics && (
                    <div className="p-2.5 bg-slate-50 rounded-lg flex flex-wrap gap-4 text-[11px] text-slate-600 font-mono">
                      <span>LOC: {p.codeMetrics.linesOfCode}</span>
                      <span>Branch Test Coverage: {p.codeMetrics.testCoverage}</span>
                      <span>Dockerized: {p.codeMetrics.dockerized ? 'Yes' : 'No'}</span>
                      <span>CI/CD Pipeline: {p.codeMetrics.cicdConfigured ? 'Active' : 'No'}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <div className="flex flex-wrap gap-1">
                      {p.techStack.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1"
                    >
                      <span>Inspect Code</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

