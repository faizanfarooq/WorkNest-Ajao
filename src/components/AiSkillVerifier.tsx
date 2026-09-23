import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  Cpu, 
  Layers, 
  ArrowRight,
  RefreshCw,
  Copy,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { CandidateProfile, SkillAuditResult, TechSkill, VerificationBadge } from '../types';
import { SAMPLE_PORTFOLIO_SUBMISSIONS } from '../data/mockData';
import { auditPortfolioSkills } from '../services/geminiService';

interface AiSkillVerifierProps {
  candidate: CandidateProfile;
  onBadgeAwarded: (badge: VerificationBadge, newSkill: TechSkill) => void;
  onExploreMatchedProjects: () => void;
}

export const AiSkillVerifier: React.FC<AiSkillVerifierProps> = ({
  candidate,
  onBadgeAwarded,
  onExploreMatchedProjects,
}) => {
  const [projectTitle, setProjectTitle] = useState('Distributed Raft KV Storage Engine');
  const [techStackInput, setTechStackInput] = useState('Go, gRPC, Protobuf, Docker, Concurrency');
  const [projectOverview, setProjectOverview] = useState('Fault-tolerant key-value store in Go implementing Raft leader leases and quorum-based log compaction.');
  const [codeSnippet, setCodeSnippet] = useState(SAMPLE_PORTFOLIO_SUBMISSIONS[0].snippet);
  
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState('');
  const [auditResult, setAuditResult] = useState<SkillAuditResult | null>(null);
  const [badgeSaved, setBadgeSaved] = useState(false);

  // Quick challenge tab state
  const [activeSubTab, setActiveSubTab] = useState<'code_audit' | 'interactive_challenge'>('code_audit');
  const [selectedChallengeAnswer, setSelectedChallengeAnswer] = useState<number | null>(null);
  const [challengeEvaluated, setChallengeEvaluated] = useState(false);

  const handleSelectSample = (sample: typeof SAMPLE_PORTFOLIO_SUBMISSIONS[0]) => {
    setProjectTitle(sample.title);
    setCodeSnippet(sample.snippet);
    if (sample.title.includes('Go')) {
      setTechStackInput('Go, gRPC, Raft, Concurrency, Docker');
      setProjectOverview('Fault-tolerant key-value store in Go implementing Raft leader leases and quorum log compaction.');
    } else if (sample.title.includes('TypeScript')) {
      setTechStackInput('TypeScript, Node.js, Redis Streams, BullMQ, PostgreSQL');
      setProjectOverview('Distributed event ingestion proxy processing 15k req/sec with HMAC signature verification and idempotency.');
    } else {
      setTechStackInput('Python, AWS IAM, Terraform, AST, Cloud Security');
      setProjectOverview('Automated CI/CD security bot auditing AWS IAM policies and Terraform modules for least privilege.');
    }
  };

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setAuditResult(null);
    setBadgeSaved(false);

    // Dynamic scanning progress steps
    setAuditStep('Parsing Abstract Syntax Tree (AST) and modular boundaries...');
    await new Promise(r => setTimeout(r, 600));
    setAuditStep('Auditing concurrency primitives, race condition hazards, and memory leases...');
    await new Promise(r => setTimeout(r, 700));
    setAuditStep('Evaluating defensive error escalation and unit test coverage heuristics...');
    await new Promise(r => setTimeout(r, 600));
    setAuditStep('Engaging Gemini Systems Architect model for production rating...');

    const stackList = techStackInput.split(',').map(s => s.trim()).filter(Boolean);
    const result = await auditPortfolioSkills({
      projectTitle,
      codeSnippet,
      techStack: stackList,
      projectOverview,
    });

    setAuditResult(result);
    setIsAuditing(false);
  };

  const handleSaveBadgeToProfile = () => {
    if (!auditResult) return;
    const newBadge: VerificationBadge = {
      id: `badge-${Date.now()}`,
      title: auditResult.awardedBadges[0]?.title || 'Verified Systems Engineer',
      issuer: 'WorkFest AI Verifier',
      category: 'System Architecture',
      level: auditResult.overallVerdict === 'Production-Ready' ? 'Production-Grade' : 'High-Competency',
      score: auditResult.candidateScore,
      earnedAt: new Date().toISOString().split('T')[0],
      verificationHash: `0x${Math.random().toString(16).substring(2, 8)}...${Math.random().toString(16).substring(2, 6)}`
    };

    const newSkill: TechSkill = {
      name: techStackInput.split(',')[0] || 'Verified Systems',
      category: 'Languages',
      verifiedLevel: 'Verified Production',
      score: auditResult.candidateScore,
      evidenceProject: projectTitle
    };

    onBadgeAwarded(newBadge, newSkill);
    setBadgeSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI-Driven Proof-of-Work Verification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
            Replace GPA Transcripts with Verifiable Code Audits
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Startup founders don't care if you took an abstract exam three years ago. They care if you can handle 
            concurrency, write clean tests, and structure microservices. Submit your GitHub repository or code snippet to earn cryptographic Proof-of-Skill Badges.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
          <button
            id="subtab-audit-btn"
            onClick={() => setActiveSubTab('code_audit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'code_audit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Code Repository Audit
          </button>
          <button
            id="subtab-challenge-btn"
            onClick={() => setActiveSubTab('interactive_challenge')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'interactive_challenge'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive CS/IT Quiz
          </button>
        </div>
      </div>

      {activeSubTab === 'code_audit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Form & Sample Code */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Production Example or Custom Code
                </span>
                <span className="text-[11px] text-slate-500 font-medium">CS / IT Specializations</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {SAMPLE_PORTFOLIO_SUBMISSIONS.map((sample, idx) => (
                  <button
                    key={idx}
                    id={`sample-preset-${idx}`}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2 rounded-xl text-left border text-[11px] font-semibold transition-all cursor-pointer ${
                      projectTitle === sample.title
                        ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 ring-1 ring-indigo-400'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="truncate font-bold">{sample.title.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {sample.title.includes('Go') ? 'Go • Raft' : sample.title.includes('TypeScript') ? 'TS • Queues' : 'Python • IAM'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Project / Repository Title
                  </label>
                  <input
                    id="audit-project-title-input"
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Distributed Cache Proxy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Claimed Tech Stack (Comma separated)
                  </label>
                  <input
                    id="audit-tech-stack-input"
                    type="text"
                    value={techStackInput}
                    onChange={(e) => setTechStackInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="Go, Docker, Redis, gRPC"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    System Architecture / Core Implementation Code Snippet
                  </label>
                  <div className="relative">
                    <textarea
                      id="audit-code-snippet-textarea"
                      value={codeSnippet}
                      onChange={(e) => setCodeSnippet(e.target.value)}
                      rows={10}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 font-mono bg-slate-950 text-emerald-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed"
                      placeholder="Paste Go, Python, TypeScript, or Terraform code snippet here..."
                    />
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        {codeSnippet.split('\n').length} lines
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  id="run-gemini-audit-btn"
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer disabled:opacity-75"
                >
                  {isAuditing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      <span>Gemini AI Inspecting Architecture...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Run Gemini Proof-of-Skill Audit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Verification Report */}
          <div className="lg:col-span-6 space-y-4">
            {isAuditing ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs flex flex-col items-center justify-center text-center min-h-[420px]">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                  <Cpu className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Gemini Engine Running Proof-of-Work Diagnostics</h3>
                <p className="text-xs text-indigo-600 font-mono mt-2 animate-bounce">
                  {auditStep}
                </p>
                <div className="w-48 bg-slate-100 rounded-full h-1.5 mt-4 overflow-hidden">
                  <div className="bg-indigo-600 h-full w-2/3 animate-pulse rounded-full"></div>
                </div>
              </div>
            ) : auditResult ? (
              <div 
                id="audit-result-container"
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in"
              >
                {/* Result Top Badge */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                        WorkFest Official Proof Verified
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      {projectTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Audit ID: WF-{(Math.random() * 100000).toFixed(0)} • Evaluated via Gemini
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-slate-900 font-mono">
                      {auditResult.candidateScore}<span className="text-sm font-normal text-slate-400">/100</span>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold mt-1">
                      {auditResult.overallVerdict}
                    </span>
                  </div>
                </div>

                {/* Summary */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Architectural Verdict:</p>
                  {auditResult.summary}
                </div>

                {/* Category Dimension Metrics */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Competency Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Clean Code & Modular AST</span>
                        <span className="text-emerald-700 font-mono">{auditResult.categoryBreakdown.cleanCodeAndArchitecture.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {auditResult.categoryBreakdown.cleanCodeAndArchitecture.feedback}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Systems & Concurrency</span>
                        <span className="text-emerald-700 font-mono">{auditResult.categoryBreakdown.systemsAndScalability.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {auditResult.categoryBreakdown.systemsAndScalability.feedback}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Testing & Reliability</span>
                        <span className="text-emerald-700 font-mono">{auditResult.categoryBreakdown.testingAndDevOps.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {auditResult.categoryBreakdown.testingAndDevOps.feedback}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>Security & Robustness</span>
                        <span className="text-emerald-700 font-mono">{auditResult.categoryBreakdown.securityAndRobustness.score}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {auditResult.categoryBreakdown.securityAndRobustness.feedback}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Strengths & Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="border border-emerald-100 bg-emerald-50/50 p-3 rounded-xl">
                    <span className="font-bold text-emerald-900 block mb-1">Key Verified Strengths:</span>
                    <ul className="space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
                      {auditResult.keyStrengths.map((str, i) => (
                        <li key={i}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-indigo-100 bg-indigo-50/50 p-3 rounded-xl">
                    <span className="font-bold text-indigo-900 block mb-1">Matched Startup Milestones:</span>
                    <ul className="space-y-1 text-[11px] text-indigo-800 list-disc list-inside">
                      {auditResult.matchedProjectRecommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    id="save-verified-badge-btn"
                    onClick={handleSaveBadgeToProfile}
                    disabled={badgeSaved}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      badgeSaved 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{badgeSaved ? 'Badge Saved to Candidate Profile' : 'Add Verified Badge to My Profile'}</span>
                  </button>

                  <button
                    id="explore-matched-projects-btn"
                    onClick={onExploreMatchedProjects}
                    className="py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>View Matched Startups</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-12 h-12 rounded-xl bg-slate-200/80 flex items-center justify-center mb-3">
                  <Terminal className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">No Audit Run Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Choose one of the production presets on the left or paste your own code, then click "Run Gemini Proof-of-Skill Audit".
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Interactive CS/IT Quiz Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Real-World Systems Debugging Diagnostic</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Question: Concurrency & Lease Invalidation in Go
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Suppose two distributed nodes hold an in-memory cache replica. Node A updates a user record and broadcasts a pub/sub invalidation event over Redis. Under heavy load, Node B serves stale data for 400ms. Which architectural pattern permanently eliminates this race condition?
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 0, text: 'Increase Redis pub/sub buffer size and add a 500ms sleep in the client driver.' },
              { id: 1, text: 'Use RESP3 Client-Side Tracking with invalidation keys and atomic read-through CAS (Check-And-Set).' },
              { id: 2, text: 'Rely on DNS TTL round-robin to evenly spread load to the primary node.' },
              { id: 3, text: 'Disable caching completely and direct 100% of read queries to the master database.' }
            ].map((option) => (
              <button
                key={option.id}
                id={`quiz-option-${option.id}`}
                onClick={() => {
                  setSelectedChallengeAnswer(option.id);
                  setChallengeEvaluated(false);
                }}
                className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all flex items-start space-x-3 cursor-pointer ${
                  selectedChallengeAnswer === option.id
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  {String.fromCharCode(65 + option.id)}
                </span>
                <span className="leading-relaxed">{option.text}</span>
              </button>
            ))}
          </div>

          {challengeEvaluated && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              selectedChallengeAnswer === 1
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center space-x-2 font-bold mb-1">
                {selectedChallengeAnswer === 1 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct! Verified Architectural Reasoning</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Incorrect Option</span>
                  </>
                )}
              </div>
              <p>
                Option B is the production standard. Redis RESP3 client-side tracking sends server-assisted invalidation messages directly on the client connection, preventing stale reads during high throughput bursts without arbitrary sleeps or crippling the primary database.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Verified outcomes automatically link to HyperFlow Milestone 1.
            </span>
            <button
              id="evaluate-challenge-btn"
              onClick={() => setChallengeEvaluated(true)}
              disabled={selectedChallengeAnswer === null}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Verify My Reasoning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
