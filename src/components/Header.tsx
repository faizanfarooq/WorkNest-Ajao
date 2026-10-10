import React, { useState } from 'react';
import { 
  Briefcase, 
  Globe2, 
  Building2, 
  Code2, 
  BookOpen, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  LogIn, 
  PlusCircle, 
  User, 
  Menu, 
  X, 
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import { CandidateProfile } from '../types';

export type NavigationTab = 
  | 'internships'     // "Find Internships" (Indeed-style 2-pane feed)
  | 'remote'          // "Remote USD Pathways"
  | 'companies'       // "Startups & Companies"
  | 'auditor'         // "AI Code Auditor"
  | 'resources'       // "Resources" (Resume Builder, Interview Guides, IELTS)
  | 'dashboard'       // Student or Employer Dashboard
  | 'chat'            // Direct Founder Chat
  | 'microtasks'      // 3-Day Micro-Tasks
  | 'milestones'      // Milestone Escrow Tracker
  | 'documents'       // Document Portal
  | 'interviews'      // Interview Scheduler
  | 'wall_of_fame'    // Wall of Fame
  | 'api_explorer';   // Backend REST API Explorer

interface HeaderProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  userRole: 'candidate' | 'founder';
  setUserRole: (role: 'candidate' | 'founder') => void;
  candidate: CandidateProfile;
  currency: 'PKR' | 'USD';
  onToggleCurrency: () => void;
  lowGpaShieldActive: boolean;
  onToggleLowGpaShield: () => void;
  onOpenAuthModal: () => void;
  onOpenPostRoleModal: () => void;
  onOpenProfileModal: () => void;
  unreadChatCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  candidate,
  currency,
  onToggleCurrency,
  lowGpaShieldActive,
  onToggleLowGpaShield,
  onOpenAuthModal,
  onOpenPostRoleModal,
  onOpenProfileModal,
  unreadChatCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/90 shadow-2xs font-sans">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setActiveTab('internships')}
              className="flex items-center space-x-2.5 cursor-pointer text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#09090B] text-emerald-400 flex items-center justify-center font-bold text-base shadow-xs tracking-tighter font-mono border border-emerald-500/30">
                W
              </div>
              <div>
                <div className="flex items-center space-x-1.5 leading-none">
                  <span className="font-extrabold text-[#09090B] text-lg tracking-tight">WorkNest</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center space-x-1">
                  <span>UMT Edition</span>
                  <span>·</span>
                  <span className="text-emerald-600 font-semibold">Johar Town Hub</span>
                </div>
              </div>
            </button>

            {/* Left Menu Links (Clean Text Navigation) */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                id="nav-internships-btn"
                onClick={() => setActiveTab('internships')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'internships'
                    ? 'text-zinc-950 bg-zinc-100 font-bold border-b-2 border-emerald-500'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Find Internships</span>
              </button>

              <button
                id="nav-remote-btn"
                onClick={() => setActiveTab('remote')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'remote'
                    ? 'text-zinc-950 bg-zinc-100 font-bold border-b-2 border-emerald-500'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Remote USD Pathways</span>
              </button>

              <button
                id="nav-companies-btn"
                onClick={() => setActiveTab('companies')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'companies'
                    ? 'text-zinc-950 bg-zinc-100 font-bold border-b-2 border-emerald-500'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Startups & Companies</span>
              </button>

              <button
                id="nav-auditor-btn"
                onClick={() => setActiveTab('auditor')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'auditor'
                    ? 'text-zinc-950 bg-zinc-100 font-bold border-b-2 border-emerald-500'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Code Auditor</span>
              </button>

              <button
                id="nav-resources-btn"
                onClick={() => setActiveTab('resources')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'resources'
                    ? 'text-zinc-950 bg-zinc-100 font-bold border-b-2 border-emerald-500'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Resources</span>
              </button>

              <button
                id="nav-dashboard-btn"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'text-zinc-950 bg-zinc-100 font-bold border-b-2 border-emerald-500'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{userRole === 'candidate' ? 'Student Hub' : 'Employer Pipeline'}</span>
              </button>

              <button
                id="nav-chat-btn"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer relative ${
                  activeTab === 'chat'
                    ? 'text-zinc-950 bg-zinc-100 font-bold border-b-2 border-emerald-500'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Founder Chat</span>
                {unreadChatCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                )}
              </button>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Low-GPA Shield Toggle */}
            <button
              id="low-gpa-shield-toggle-btn"
              onClick={onToggleLowGpaShield}
              title="Hides minimum academic CGPA filters and evaluates proof-of-work codebases"
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border ${
                lowGpaShieldActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {lowGpaShieldActive ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
              )}
              <span className="font-bold">Low-GPA Shield:</span>
              <span className={lowGpaShieldActive ? 'text-emerald-700 font-extrabold' : 'text-zinc-500'}>
                {lowGpaShieldActive ? 'ACTIVE' : 'OFF'}
              </span>
            </button>

            {/* Currency Switcher (PKR / USD) */}
            <button
              id="currency-switcher-btn"
              onClick={onToggleCurrency}
              title="Switch currency display between Pakistani Rupee (PKR) and US Dollar (USD)"
              className="px-2.5 py-1.5 rounded-md text-xs font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span>{currency}</span>
              <span className="text-[10px] text-zinc-400 font-sans">
                ({currency === 'PKR' ? '₨' : '$'})
              </span>
            </button>

            {/* Post a Role / Employer Button */}
            {userRole === 'founder' ? (
              <button
                id="post-role-header-btn"
                onClick={onOpenPostRoleModal}
                className="px-3.5 py-1.5 rounded-md text-xs font-bold bg-[#09090B] hover:bg-zinc-800 text-white transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs border border-zinc-800"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Post a Role</span>
              </button>
            ) : (
              <button
                id="employer-switch-btn"
                onClick={() => setUserRole('founder')}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer border border-zinc-200"
              >
                Employers / Post Role
              </button>
            )}

            {/* User Profile / Auth Button */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-2 pr-2.5 rounded-md border border-zinc-200 hover:border-zinc-300 bg-white transition-colors cursor-pointer"
              >
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-6 h-6 rounded-full object-cover border border-zinc-300"
                />
                <div className="text-left leading-none hidden xl:block">
                  <div className="text-xs font-bold text-zinc-900 truncate max-w-[110px]">
                    {userRole === 'candidate' ? 'Faizan Farooq' : 'Tariq Masood'}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {userRole === 'candidate' ? 'UMT CS \'26' : 'FinFlow CTO'}
                  </div>
                </div>
              </button>

              {/* Role Dropdown */}
              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-zinc-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <p className="font-bold text-zinc-900">{candidate.name}</p>
                    <p className="text-[11px] text-zinc-500 font-mono">UMT Lahore Campus</p>
                  </div>

                  <button
                    onClick={() => {
                      onOpenProfileModal();
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-zinc-700 hover:bg-zinc-50 flex items-center space-x-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>View Student Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenAuthModal();
                      setRoleDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-zinc-700 hover:bg-zinc-50 flex items-center space-x-2 cursor-pointer border-t border-zinc-100"
                  >
                    <LogIn className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Sign In / Switch Account</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={onToggleLowGpaShield}
              className={`p-1.5 rounded-md border text-xs ${
                lowGpaShieldActive ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-zinc-100 border-zinc-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => { setActiveTab('internships'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-zinc-900 hover:bg-zinc-100"
          >
            Find Internships (Indeed Feed)
          </button>
          <button
            onClick={() => { setActiveTab('remote'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-emerald-700 hover:bg-emerald-50"
          >
            Remote USD Pathways
          </button>
          <button
            onClick={() => { setActiveTab('companies'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-zinc-900 hover:bg-zinc-100"
          >
            Startups & Companies (Johar Town / Gulberg)
          </button>
          <button
            onClick={() => { setActiveTab('auditor'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-emerald-700 hover:bg-emerald-50"
          >
            AI Code Auditor (Gemini AST)
          </button>
          <button
            onClick={() => { setActiveTab('resources'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-zinc-900 hover:bg-zinc-100"
          >
            Resources (Resume Builder & Guides)
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-zinc-900 hover:bg-zinc-100"
          >
            {userRole === 'candidate' ? 'Student Applications Dashboard' : 'Employer Pipeline'}
          </button>
          <button
            onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded text-xs font-bold text-zinc-900 hover:bg-zinc-100"
          >
            Direct Founder Chat
          </button>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
            <button
              onClick={onToggleCurrency}
              className="text-xs font-mono font-bold px-3 py-1.5 bg-zinc-100 rounded border border-zinc-200"
            >
              Currency: {currency}
            </button>
            <button
              onClick={() => {
                setUserRole(userRole === 'candidate' ? 'founder' : 'candidate');
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold px-3 py-1.5 bg-[#09090B] text-white rounded"
            >
              Role: {userRole === 'candidate' ? 'Student' : 'Employer'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
