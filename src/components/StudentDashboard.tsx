import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  ExternalLink, 
  FileText, 
  Github, 
  Layers, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Wallet,
  ArrowUpRight,
  Send,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { CandidateProfile, StudentApplication } from '../types';
import { STUDENT_APPLICATIONS } from '../data/mockData';

interface StudentDashboardProps {
  candidate: CandidateProfile;
  currency: 'PKR' | 'USD';
  onOpenChat: (startupId: string) => void;
  onOpenCodeAuditor: () => void;
  onNavigateToResources: () => void;
  onNavigateToInternships: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  candidate,
  currency,
  onOpenChat,
  onOpenCodeAuditor,
  onNavigateToResources,
  onNavigateToInternships,
}) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'wallet' | 'portfolio'>('applications');
  const [applications, setApplications] = useState<StudentApplication[]>(STUDENT_APPLICATIONS);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<'raast' | 'jazzcash' | 'nayapay' | 'wise'>('raast');
  const [accountNumber, setAccountNumber] = useState('+923004810928');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleSimulateWithdrawal = () => {
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawModalOpen(false);
    }, 2500);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Student Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {candidate.name}
              </h1>
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-[#ff6600]/10 text-[#ff6600]">
                UMT LAHORE
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {candidate.degreeInfo} · {candidate.location}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>AST Reliability Score: 96%</span>
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-600 font-mono">
                Academic GPA (2.4) Shielded
              </span>
              <span className="text-slate-400">·</span>
              <a
                href={`https://${candidate.githubHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 hover:text-slate-900 font-mono flex items-center space-x-1"
              >
                <Github className="w-3.5 h-3.5" />
                <span>github.com/{candidate.githubHandle}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Quick Wallet Metric */}
        <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Earned Milestone Escrow
            </span>
            <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
              PKR 65,000 <span className="text-xs text-slate-500 font-sans">($250 USD)</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1 mt-0.5">
              <span>●</span>
              <span>Available for instant Raast payout</span>
            </span>
          </div>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'applications'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>My Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'wallet'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-emerald-600" />
          <span>Milestone Escrow Wallet</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'portfolio'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-indigo-600" />
          <span>Verified Repositories & AST Badges</span>
        </button>
      </div>

      {/* TAB 1: APPLICATIONS TRACKER */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tracking status across Lahore & remote startup partners</span>
            <button
              onClick={onNavigateToInternships}
              className="text-[#ff6600] font-bold hover:underline cursor-pointer"
            >
              Browse More Internships →
            </button>
          </div>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xl shrink-0">
                      {app.companyLogo}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                        {app.internshipTitle}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-600 mt-0.5">
                        <span className="font-bold text-slate-900">{app.companyName}</span>
                        <span>·</span>
                        <span className="text-slate-500">{app.location}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-400">Applied {app.appliedDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        app.status === 'Milestone Active'
                          ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                          : app.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : app.status === 'Interview Scheduled'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>

                    <span className="text-xs font-mono font-black text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      {app.stipendTotal}
                    </span>
                  </div>
                </div>

                {/* Founder Feedback or Milestone progress */}
                {app.founderFeedback && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase font-mono">
                      <span>Founder Note:</span>
                      <span className="text-emerald-700">Escrow: {app.escrowStatus}</span>
                    </div>
                    <p className="italic text-slate-800">"{app.founderFeedback}"</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                      {app.matchScore}% Match
                    </span>
                    {app.currentMilestone && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        Active: {app.currentMilestone}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenChat(app.internshipId.replace('project-', 'startup-'))}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Message Engineering Lead</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONE ESCROW WALLET */}
      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Escrow Wallet Summary</h3>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="text-xs text-emerald-800 font-bold block">Available Balance:</span>
              <div className="text-2xl font-black text-slate-900 font-mono">
                PKR 65,000
              </div>
              <span className="text-xs text-slate-500 font-mono block">
                ≈ $250.00 USD (Remote export exempt)
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Locked in Milestone 2:</span>
                <span className="font-bold text-slate-800 font-mono">PKR 30,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Lifetime Earned:</span>
                <span className="font-bold text-emerald-800 font-mono">PKR 95,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PSEB Tech Export Tax:</span>
                <span className="font-bold text-emerald-700 font-mono">0.25% (PSEB Registered)</span>
              </div>
            </div>

            <button
              onClick={() => setWithdrawModalOpen(true)}
              className="w-full py-2.5 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Transfer Funds to Local Account
            </button>
          </div>

          <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Escrow Release Ledger</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Milestone 1 Release: Raast Webhook Ingestion</span>
                  <span className="text-slate-500 text-[11px]">Approved by Tariq Masood · FinFlow Pakistan</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 font-mono block">+PKR 25,000</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ref: WN-PK-98124</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">3-Day Micro-Task: MongoDB Compound Indexes Benchmark</span>
                  <span className="text-slate-500 text-[11px]">Verified GitHub PR #3 · FinFlow Pakistan</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 font-mono block">+PKR 15,000</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ref: WN-PK-88210</span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">Global Remote US Sprint: Task Runner Async S3</span>
                  <span className="text-slate-500 text-[11px]">Vanguard Software Global (Wise Deposit)</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-700 font-mono block">+$150 USD (PKR 42,000)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Ref: WN-US-10291</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VERIFIED REPOSITORIES & AST BADGES */}
      {activeTab === 'portfolio' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Repositories analyzed by WorkNest AST analyzer</span>
            <button
              onClick={onOpenCodeAuditor}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold hover:bg-indigo-100 cursor-pointer"
            >
              + Audit New Repository with Gemini
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidate.projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{proj.title}</h3>
                    <a
                      href={proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#ff6600] font-mono hover:underline inline-flex items-center space-x-1 mt-0.5"
                    >
                      <Github className="w-3 h-3" />
                      <span>{proj.repoUrl.replace('https://', '')}</span>
                    </a>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    AST: {proj.complexityScore}%
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 block">Verified Highlights:</span>
                  {proj.architectureHighlights.map((hl, i) => (
                    <div key={i} className="text-slate-700 text-[11px] flex items-start space-x-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Lines: {proj.codeMetrics?.linesOfCode}</span>
                  <span>Coverage: {proj.codeMetrics?.testCoverage}</span>
                  <span className="text-emerald-700 font-bold">CI/CD: Passed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Withdraw Escrow Funds
                </h3>
                <p className="text-xs text-slate-500">
                  Instant local disbursement via State Bank Raast or digital wallet
                </p>
              </div>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Disbursement Completed</h4>
                <p className="text-xs text-emerald-700">
                  PKR 65,000 has been transferred to your {withdrawMethod.toUpperCase()} account ({accountNumber}).
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 text-[11px] block">Amount to withdraw:</span>
                  <span className="text-xl font-black text-slate-900 font-mono">PKR 65,000</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Transfer Gateway:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('raast')}
                      className={`p-2 rounded-lg border text-xs font-bold text-left cursor-pointer ${
                        withdrawMethod === 'raast' ? 'border-[#ff6600] bg-orange-50/50 text-[#ff6600]' : 'border-slate-200'
                      }`}
                    >
                      Raast ID (0% Fee)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('jazzcash')}
                      className={`p-2 rounded-lg border text-xs font-bold text-left cursor-pointer ${
                        withdrawMethod === 'jazzcash' ? 'border-[#ff6600] bg-orange-50/50 text-[#ff6600]' : 'border-slate-200'
                      }`}
                    >
                      JazzCash Wallet
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('nayapay')}
                      className={`p-2 rounded-lg border text-xs font-bold text-left cursor-pointer ${
                        withdrawMethod === 'nayapay' ? 'border-[#ff6600] bg-orange-50/50 text-[#ff6600]' : 'border-slate-200'
                      }`}
                    >
                      NayaPay / SadaPay
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('wise')}
                      className={`p-2 rounded-lg border text-xs font-bold text-left cursor-pointer ${
                        withdrawMethod === 'wise' ? 'border-[#ff6600] bg-orange-50/50 text-[#ff6600]' : 'border-slate-200'
                      }`}
                    >
                      Wise / Payoneer (USD)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone / Account Number / IBAN:
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs font-mono outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSimulateWithdrawal}
                  className="w-full py-2.5 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Confirm Withdrawal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
