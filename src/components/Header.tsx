import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  MessageSquare, 
  FileText, 
  Calendar, 
  UserCheck, 
  ArrowRightLeft,
  GraduationCap,
  Globe2,
  Zap,
  Bell,
  Check,
  DollarSign
} from 'lucide-react';
import { CandidateProfile, MobileAlert } from '../types';

export type NavigationTab = 
  | 'projects' 
  | 'microtasks'
  | 'remote' 
  | 'verifier' 
  | 'milestones' 
  | 'chat' 
  | 'documents' 
  | 'interviews' 
  | 'wall_of_fame';

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  userRole: 'candidate' | 'founder';
  setUserRole: (role: 'candidate' | 'founder') => void;
  candidate: CandidateProfile;
  unreadChatCount: number;
  onOpenProfile: () => void;
  currency: 'PKR' | 'USD';
  onToggleCurrency: () => void;
  alerts: MobileAlert[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  candidate,
  unreadChatCount,
  onOpenProfile,
  currency,
  onToggleCurrency,
  alerts,
}) => {
  const [showAlertsMenu, setShowAlertsMenu] = useState<boolean>(false);
  const unreadAlertsCount = alerts.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-slate-950 text-white flex items-center justify-center font-bold text-xl shadow-sm border border-emerald-500/30">
              <span className="text-emerald-300 font-mono">W</span>N
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  WorkNest <span className="text-emerald-600">Ajao</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Pakistan Tech
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                No GPA Required • Paid Pakistani Startups & US Remote • Lahore • Karachi • Islamabad
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1">
            <button
              id="nav-projects-btn"
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Paid Internships</span>
            </button>

            <button
              id="nav-microtasks-btn"
              onClick={() => setActiveTab('microtasks')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'microtasks'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>3-Day Micro-Tasks</span>
            </button>

            <button
              id="nav-remote-btn"
              onClick={() => setActiveTab('remote')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'remote'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-emerald-700 font-bold hover:text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <Globe2 className="w-4 h-4 text-emerald-500" />
              <span>Global Remote</span>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[9px] font-extrabold">
                USD
              </span>
            </button>

            <button
              id="nav-verifier-btn"
              onClick={() => setActiveTab('verifier')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'verifier'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Skill Verifier</span>
            </button>

            <button
              id="nav-wall-btn"
              onClick={() => setActiveTab('wall_of_fame')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'wall_of_fame'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <span>Wall of Fame</span>
            </button>

            <button
              id="nav-chat-btn"
              onClick={() => setActiveTab('chat')}
              className={`relative px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Founder Chat</span>
              {unreadChatCount > 0 && (
                <span className="w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button
              id="nav-documents-btn"
              onClick={() => setActiveTab('documents')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'documents'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Document Vault</span>
            </button>

            <button
              id="nav-interviews-btn"
              onClick={() => setActiveTab('interviews')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'interviews'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Interviews</span>
            </button>
          </nav>

          {/* Right Action: Currency Switcher, Mobile Alerts & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Currency Toggle */}
            <button
              onClick={onToggleCurrency}
              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 flex items-center space-x-1 cursor-pointer transition-all"
              title="Toggle PKR / USD display"
            >
              <span className={currency === 'PKR' ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>PKR</span>
              <span className="text-slate-300">/</span>
              <span className={currency === 'USD' ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>USD</span>
            </button>

            {/* Mobile Alerts Bell (Jazz/Zong/WhatsApp) */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsMenu(!showAlertsMenu)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 relative cursor-pointer"
                title="Cellular & WhatsApp Alerts (Jazz, Zong, WhatsApp)"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>

              {showAlertsMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-fade-in space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-extrabold text-xs text-slate-900 flex items-center space-x-1.5">
                      <span>Pakistan Cellular & WhatsApp Alerts</span>
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Live Gateways
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2.5">
                    {alerts.map((al) => (
                      <div key={al.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-700 px-1.5 py-0.5 rounded bg-white border border-slate-200">
                            {al.telco} • {al.sender}
                          </span>
                          <span className="text-slate-400">{al.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-800 leading-snug">
                          {al.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowAlertsMenu(false)}
                    className="w-full py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close Alerts
                  </button>
                </div>
              )}
            </div>

            {/* View Switcher Toggle */}
            <div className="hidden lg:flex bg-slate-100 p-1 rounded-xl items-center border border-slate-200">
              <button
                id="toggle-candidate-role-btn"
                onClick={() => setUserRole('candidate')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                  userRole === 'candidate'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View platform as CS/IT Graduate"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>CS Graduate</span>
              </button>
              <button
                id="toggle-founder-role-btn"
                onClick={() => setUserRole('founder')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                  userRole === 'founder'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="View platform as Startup Founder"
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pakistani Founder</span>
              </button>
            </div>

            {/* Candidate Profile Pill */}
            <button
              id="open-profile-btn"
              onClick={onOpenProfile}
              className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
            >
              <img
                src={candidate.avatar}
                alt={candidate.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-400"
              />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-slate-900">{candidate.name}</span>
                  <UserCheck className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-[10px] text-slate-500 leading-none">
                  FAST '25 • {candidate.portfolioReliabilityScore}% Score
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="xl:hidden flex items-center space-x-2 py-2 overflow-x-auto border-t border-slate-100 no-scrollbar">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'projects' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Paid Internships
          </button>
          <button
            onClick={() => setActiveTab('microtasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'microtasks' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            ⚡ 3-Day Micro-Tasks
          </button>
          <button
            onClick={() => setActiveTab('remote')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
              activeTab === 'remote' ? 'bg-emerald-700 text-white' : 'text-emerald-700 bg-emerald-50'
            }`}
          >
            🌐 Global Remote (USD)
          </button>
          <button
            onClick={() => setActiveTab('verifier')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'verifier' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            AI Verifier
          </button>
          <button
            onClick={() => setActiveTab('wall_of_fame')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'wall_of_fame' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Wall of Fame
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'chat' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Chat {unreadChatCount > 0 && `(${unreadChatCount})`}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'documents' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Document Vault
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
              activeTab === 'interviews' ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            Interviews
          </button>
        </div>
      </div>
    </header>
  );
};
