import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Award, 
  Globe2, 
  Copy, 
  Check, 
  Sparkles, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  ArrowRight,
  Download,
  Lightbulb
} from 'lucide-react';
import { CandidateProfile } from '../types';

interface ResourcesHubProps {
  candidate: CandidateProfile;
  onOpenCodeAuditor: () => void;
}

export const ResourcesHub: React.FC<ResourcesHubProps> = ({
  candidate,
  onOpenCodeAuditor,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'resume' | 'interview' | 'ielts'>('resume');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Resume builder states
  const [projectTitle, setProjectTitle] = useState('Raast Instant Webhook & Reconciliation Service');
  const [projectTech, setProjectTech] = useState('Python, FastAPI, Redis Streams, PostgreSQL, Docker');
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([
    'Architected high-throughput Raast webhook ingestion pipeline in FastAPI processing State Bank instant payment notifications with 0 double-spends.',
    'Engineered sub-millisecond Redis distributed locking to enforce strict idempotency during simulated 2,000 req/sec concurrent webhook bursts.',
    'Designed modular PostgreSQL double-entry settlement ledger with automated Alembic database migrations and 94.5% unit test coverage.',
    'Earned 96% AST code audit reliability score on WorkNest, overriding traditional 3.0 CGPA academic filters through production-grade repository architecture.'
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGenerateBullets = () => {
    const bullets = [
      `Engineered modular ${projectTech.split(',')[0] || 'software'} backend for ${projectTitle}, achieving sub-second API response latency.`,
      `Implemented defensive validation and transactional rollbacks adhering to ACID principles and SOLID software design patterns.`,
      `Integrated containerized Docker workflow and automated CI/CD pipeline validated with 92%+ test suite assertion coverage.`,
      `Verified via WorkNest AST automated code audit (96% reliability score) to demonstrate production competency beyond academic GPA metrics.`
    ];
    setGeneratedBullets(bullets);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono uppercase bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                UMT LAHORE CAREER LAUNCHPAD
              </span>
              <span className="text-xs text-slate-500">Curated Tools for CS & IT Graduates</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Career Acceleration & Technical Resources
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Equipping UMT graduates to bypass legacy GPA screening, ace technical system design interviews, and communicate asynchronously with North American remote clients.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenCodeAuditor}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Portfolio AST</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="mt-4 flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('resume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'resume'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AI Resume Builder (GPA-Shielded)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('interview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'interview'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Lahore & Remote Interview Guides</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ielts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'ielts'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>IELTS & Async Remote English</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: AI Resume Builder */}
      {activeSubTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Project-to-Resume Bullet Point Generator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Translates your GitHub codebase into high-impact bullets that focus on concurrency, throughput, and error boundaries rather than academic grades.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Name / Repository:</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
                  placeholder="e.g. Raast Webhook Ingestion Engine"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Technologies Used:</label>
                <input
                  type="text"
                  value={projectTech}
                  onChange={(e) => setProjectTech(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none font-mono"
                  placeholder="e.g. React, Node.js, PostgreSQL, Docker"
                />
              </div>

              <button
                onClick={handleGenerateBullets}
                className="w-full py-2.5 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Verified Resume Bullets</span>
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold flex items-center space-x-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>Why this works for UMT Graduates:</span>
              </span>
              <p className="leading-relaxed">
                Recruiters at fast-growing software houses in Johar Town and US remote clients care about production ownership. Action verbs with exact metric proof (e.g. "0 double-spends", "2,000 req/sec") bypass transcript screenings.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Generated Resume Bullets (Ready to Paste)
                </h3>
                <p className="text-xs text-slate-500">Formatted for 1-page modern developer resumes</p>
              </div>

              <button
                onClick={() => copyToClipboard(generatedBullets.join('\n• '), 'all-bullets')}
                className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedId === 'all-bullets' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'all-bullets' ? 'Copied All!' : 'Copy All'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {generatedBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-2">
                    <span className="font-bold text-[#ff6600] mt-0.5">•</span>
                    <p className="text-slate-800 leading-relaxed">{bullet}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bullet, `b-${idx}`)}
                    className="text-slate-400 hover:text-slate-700 shrink-0 p-1 cursor-pointer"
                    title="Copy bullet"
                  >
                    {copiedId === `b-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Resume Structure Template */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                Recommended Resume Section Order (Bypassing GPA)
              </h4>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
                <div className="p-2 bg-emerald-50 text-emerald-900 rounded border border-emerald-200">
                  <span className="font-bold block">1. Proof of Work</span>
                  <span className="text-[10px] text-emerald-700">AST Verified Projects</span>
                </div>
                <div className="p-2 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  <span className="font-bold block">2. Tech Stack</span>
                  <span className="text-[10px] text-slate-600">Frameworks & Tools</span>
                </div>
                <div className="p-2 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  <span className="font-bold block">3. Paid Milestones</span>
                  <span className="text-[10px] text-slate-600">WorkNest Escrow</span>
                </div>
                <div className="p-2 bg-slate-50 text-slate-600 rounded border border-slate-200">
                  <span className="font-bold block">4. Education</span>
                  <span className="text-[10px] text-slate-500">UMT Lahore (No GPA)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Technical Interview Guides */}
      {activeSubTab === 'interview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              LAHORE FINTECH SPRINT
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              Pakistani Banking & Raast System Design Prep
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Asked routinely by FinFlow, NayaPay, SadaPay, and Systems Ltd during technical interviews for junior and associate backend engineers.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">Q: How to prevent double-spending during Raast webhook retries?</span>
                <span className="text-slate-600 text-[11px] mt-0.5 block">
                  A: Implement idempotent requests using unique bank transaction reference numbers with Redis distributed SETNX keys and DB unique constraints.
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">Q: Double-entry ledger invariant validation?</span>
                <span className="text-slate-600 text-[11px] mt-0.5 block">
                  A: Debit sum must strictly equal credit sum within a serializable database transaction session.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
              GLOBAL REMOTE STANDARDS
            </span>
            <h3 className="font-extrabold text-slate-900 text-base">
              Asynchronous Git PR & Code Review Fluency
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Foreign engineering managers evaluate recent graduates based on their GitHub pull request hygiene and ability to self-review before submitting.
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">Atomic Commits & Conventional Commits:</span>
                <span className="text-slate-600 text-[11px] mt-0.5 block font-mono">
                  feat(auth): add JWT multi-tenant claim validation<br />
                  fix(wallet): resolve race condition on concurrent balance deduction
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">Self-Contained Loom Demos:</span>
                <span className="text-slate-600 text-[11px] mt-0.5 block">
                  A 90-second video demonstrating your staging environment eliminates timezone delay with US clients.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: IELTS & Asynchronous Remote English */}
      {activeSubTab === 'ielts' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Asynchronous Remote English & IELTS Technical Writing
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Templates to help Pakistani CS graduates sound crisp, authoritative, and professional in async Slack channels and GitHub PR descriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Daily Standup Update (Slack Template)</span>
                <button
                  onClick={() => copyToClipboard('1. Yesterday: Completed Raast webhook deduplication with 94% test assertions.\n2. Today: Integrating merchant reconciliation CSV export.\n3. Blockers: Waiting for staging API key from DevOps lead.', 'slack-standup')}
                  className="text-xs text-[#ff6600] font-bold hover:underline cursor-pointer"
                >
                  {copiedId === 'slack-standup' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
{`1. Yesterday: Completed Raast webhook deduplication with 94% test assertions.
2. Today: Integrating merchant reconciliation CSV export.
3. Blockers: Waiting for staging API credentials.`}
              </pre>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Polite Disagreement on Code Architecture</span>
                <button
                  onClick={() => copyToClipboard('Thanks for the feedback! I considered approach A, but benchmarked approach B which yielded 40% lower memory allocation under load. Here is the profiling benchmark link:', 'pr-disagree')}
                  className="text-xs text-[#ff6600] font-bold hover:underline cursor-pointer"
                >
                  {copiedId === 'pr-disagree' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
{`Thanks for the feedback! I considered approach A, but benchmarked approach B which yielded 40% lower memory allocation under load. Here is the profiling benchmark link:`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
