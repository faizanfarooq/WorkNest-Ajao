import React from 'react';
import { Award, Zap, ArrowRight, CheckCircle2, Sparkles, MapPin } from 'lucide-react';

interface GraduateBannerProps {
  onExploreProjects: () => void;
  onLaunchSkillAudit: () => void;
  onViewWallOfFame?: () => void;
}

export const GraduateBanner: React.FC<GraduateBannerProps> = ({
  onExploreProjects,
  onLaunchSkillAudit,
  onViewWallOfFame,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden my-6">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pakistan’s #1 Project-Based Career Platform for CS & IT Fresh Graduates</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans leading-tight">
            No GPA Required. <span className="text-emerald-400">Guaranteed Paid Milestones.</span> Build Real Software for Pakistani Startups.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            <strong>WorkNest Ajao</strong> breaks the post-graduation paradox for Pakistani CS/IT graduates unhired due to 2.2 - 2.8 GPAs or unreasonable experience filters. Connect directly with founders in <strong>Lahore, Karachi, Islamabad, and Faisalabad</strong>. Ship verified production milestones virtually and get paid guaranteed PKR stipends straight to your local bank account.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-slate-300">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero GPA or university transcript requirement</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI-audited code quality & Pakistani CV bullet points</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Guaranteed PKR milestone stipends (Rs. 30k – Rs. 75k)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct 1-on-1 chat with Pakistani CTOs & tech leads</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-3 justify-end">
          <button
            id="banner-verify-btn"
            onClick={onLaunchSkillAudit}
            className="w-full px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-sm flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <Zap className="w-4 h-4 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Audit My Code with AI Verifier</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            id="banner-explore-btn"
            onClick={onExploreProjects}
            className="w-full px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all border border-white/15 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Browse Paid Pakistani Projects (PKR)</span>
          </button>

          {onViewWallOfFame && (
            <button
              onClick={onViewWallOfFame}
              className="w-full text-center text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-4 font-medium transition-colors cursor-pointer py-1"
            >
              See Pakistani Wall of Fame (FAST, NUST, NED Alumni) →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
