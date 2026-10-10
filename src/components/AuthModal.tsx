import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Building2,
  GraduationCap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'candidate' | 'founder') => void;
  currentRole: 'candidate' | 'founder';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  currentRole,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'candidate' | 'founder'>(currentRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoCandidateLogin = () => {
    onSelectRole('candidate');
    setStatusMessage('Logged in as Muhammad Faizan Farooq (UMT Lahore CS)');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1000);
  };

  const handleDemoFounderLogin = () => {
    onSelectRole('founder');
    setStatusMessage('Logged in as Tariq Masood (FinFlow Johar Town CTO)');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectRole(role);
    setStatusMessage(`Successfully authenticated as ${role === 'candidate' ? 'Student' : 'Employer'}`);
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#ff6600]">
              WORKNEST AJAO AUTH
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {mode === 'signin' ? 'Sign In to Your Account' : 'Create WorkNest Account'}
            </h3>
            <p className="text-[11px] text-slate-500">
              JWT authentication with role-based access control
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-bold flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 1-Click Instant Demo Login Buttons */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <span className="font-bold text-slate-700 block text-[11px]">
            ⚡ Instant 1-Click Demo Profiles:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={handleDemoCandidateLogin}
              className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-[#ff6600]" />
                <span>Faizan Farooq (UMT CS Graduate · 96% AST)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Student</span>
            </button>

            <button
              type="button"
              onClick={handleDemoFounderLogin}
              className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Tariq Masood (FinFlow Johar Town CTO)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Employer</span>
            </button>
          </div>
        </div>

        {/* Regular Sign in / Sign up form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Role selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Role:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('candidate')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                  role === 'candidate'
                    ? 'border-[#ff6600] bg-orange-50/40 text-[#ff6600]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                UMT Student
              </button>
              <button
                type="button"
                onClick={() => setRole('founder')}
                className={`py-2 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                  role === 'founder'
                    ? 'border-[#ff6600] bg-orange-50/40 text-[#ff6600]'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Lahore Employer
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hamza Ali"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'candidate' ? 'student@umt.edu.pk' : 'founder@startup.pk'}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none font-mono"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            {mode === 'signin' ? 'Sign In & Authenticate' : 'Create New Account'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          {mode === 'signin' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-[#ff6600] font-bold hover:underline cursor-pointer"
              >
                Register here
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-[#ff6600] font-bold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
