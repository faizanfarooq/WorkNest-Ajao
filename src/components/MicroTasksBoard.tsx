import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  GitPullRequest, 
  Zap, 
  Filter, 
  Send, 
  BookmarkCheck, 
  ExternalLink,
  DollarSign,
  AlertCircle,
  Tag
} from 'lucide-react';
import { MicroTask } from '../types';

interface MicroTasksBoardProps {
  tasks: MicroTask[];
  currency: 'PKR' | 'USD';
  onClaimTask?: (taskId: string, githubPrUrl: string) => void;
}

export const MicroTasksBoard: React.FC<MicroTasksBoardProps> = ({
  tasks,
  currency,
  onClaimTask
}) => {
  const [taskList, setTaskList] = useState<MicroTask[]>(tasks);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [prUrlInput, setPrUrlInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['all', 'Backend Optimization', 'Frontend UI/UX', 'DevOps & Reliability', 'QA Automation', 'Database Architecture', 'Full-Stack Modern Web'];

  const filteredTasks = taskList.filter((task) => {
    const matchDiff = selectedDifficulty === 'all' || task.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchCat = selectedCategory === 'all' || task.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchDiff && matchCat;
  });

  const handleClaim = (taskId: string) => {
    setActiveTaskId(taskId);
  };

  const handleSubmitPr = (taskId: string) => {
    if (!prUrlInput.trim()) {
      alert('Please provide your GitHub PR or branch repository link.');
      return;
    }

    setTaskList(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'claimed', claimedByYou: true, spotsLeft: Math.max(0, t.spotsLeft - 1) };
      }
      return t;
    }));

    setToastMessage('🎉 Micro-Task Claimed & PR Submitted! Escrow funds locked. Founder notification dispatched.');
    setTimeout(() => setToastMessage(null), 5000);
    setActiveTaskId(null);
    setPrUrlInput('');

    if (onClaimTask) onClaimTask(taskId, prUrlInput);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl border border-emerald-500/20 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>3-Day Paid Sprints • Instant Escrow Payout</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              3-Day Micro-Tasks: Quick Production Proof-of-Work
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Don't have time for a 6-week internship? Solve concrete tickets for Pakistani software houses in 48-72 hours. Earn PKR 7,500 to PKR 14,000 per merged PR.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-center space-y-1">
            <span className="text-[10px] text-slate-300 uppercase tracking-wider block font-bold">
              Escrow Guaranteed
            </span>
            <div className="text-xl font-extrabold text-emerald-400">
              100% Locked Payout
            </div>
            <span className="text-[10px] text-slate-300 block">
              Paid directly via JazzCash / Raast
            </span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center space-x-2 shadow-sm animate-fade-in">
          <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Difficulty:</span>
          {['all', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diff === 'all' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5 items-center text-xs">
          <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-hidden"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Task Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => {
          const isClaimedByMe = task.claimedByYou;
          const isModalOpen = activeTaskId === task.id;

          const diffColor = 
            task.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            task.difficulty === 'Intermediate' ? 'bg-blue-50 text-blue-800 border-blue-200' :
            'bg-purple-50 text-purple-800 border-purple-200';

          return (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl p-1 bg-slate-50 rounded-lg border border-slate-100">{task.startupLogo}</span>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {task.category}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{task.startupName}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${diffColor}`}>
                    {task.difficulty}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm leading-snug">
                  {task.title}
                </h3>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Fast Payout</span>
                    <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{task.durationDays} Days Sprint</span>
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-emerald-800 font-mono">
                    {currency === 'PKR' ? `PKR ${task.payoutPkr.toLocaleString()}` : `$${task.payoutUsd}`}
                    <span className="text-[10px] font-normal text-slate-500 ml-1.5">
                      (≈ {currency === 'PKR' ? `$${task.payoutUsd}` : `PKR ${task.payoutPkr.toLocaleString()}`})
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deliverable</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {task.deliverable}
                  </p>
                </div>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {task.techStack.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-slate-100">
                {isClaimedByMe ? (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                      <span>Sprint In Review</span>
                    </span>
                    <span className="text-[10px] text-emerald-700">PR Submitted</span>
                  </div>
                ) : isModalOpen ? (
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-700 block">
                      Submit Your PR / GitHub Branch Link:
                    </span>
                    <input
                      type="text"
                      placeholder="https://github.com/faizanfarooq-dev/..."
                      value={prUrlInput}
                      onChange={(e) => setPrUrlInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 outline-hidden focus:border-emerald-500"
                    />
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setActiveTaskId(null)}
                        className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitPr(task.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Confirm Claim
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {task.spotsLeft > 0 ? `${task.spotsLeft} spot remaining` : 'Full'}
                    </span>
                    <button
                      onClick={() => handleClaim(task.id)}
                      disabled={task.spotsLeft <= 0}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Claim Sprint Ticket</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
