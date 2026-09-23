import React, { useState } from 'react';
import { 
  Globe2, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight, 
  Clock, 
  Send, 
  FileText, 
  ExternalLink,
  Percent,
  Coins,
  Cpu,
  BookmarkCheck,
  Building2,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { RemoteJob, RemoteReadinessScore, CandidateProfile } from '../types';

interface RemoteCareerPathwayProps {
  jobs: RemoteJob[];
  metrics: RemoteReadinessScore;
  candidate: CandidateProfile;
  currency: 'PKR' | 'USD';
  onApplyJob?: (jobId: string) => void;
  onOpenAudit?: () => void;
}

export const RemoteCareerPathway: React.FC<RemoteCareerPathwayProps> = ({
  jobs,
  metrics,
  candidate,
  currency,
  onApplyJob,
  onOpenAudit,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedStack, setSelectedStack] = useState<string>('all');
  const [usdSalaryInput, setUsdSalaryInput] = useState<number>(1600);
  const [exchangeRate, setExchangeRate] = useState<number>(278.5); // 1 USD = 278.5 PKR
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({
    'rj-01': true, // HyperMatrix applied by Faizan
  });
  const [activeSubTab, setActiveSubTab] = useState<'jobs' | 'readiness' | 'calculator' | 'tax_shield'>('jobs');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredJobs = jobs.filter((job) => {
    const matchCountry = selectedCountry === 'all' || job.companyCountry.toLowerCase().includes(selectedCountry.toLowerCase());
    const matchStack = selectedStack === 'all' || job.techStack.some(t => t.toLowerCase().includes(selectedStack.toLowerCase()));
    return matchCountry && matchStack;
  });

  const handleApply = (job: RemoteJob) => {
    setAppliedJobs(prev => ({ ...prev, [job.id]: true }));
    setNotification(`Proof-of-Work Portfolio transmitted to ${job.hiringManager} at ${job.companyName}!`);
    setTimeout(() => setNotification(null), 4000);
    if (onApplyJob) onApplyJob(job.id);
  };

  // Calculator figures
  const grossPkr = Math.round(usdSalaryInput * exchangeRate);
  const psebTaxPkr = Math.round(grossPkr * 0.01); // 1% FBR Section 154A
  const normalTaxPkr = Math.round(grossPkr * 0.28); // Standard 28% without PSEB
  const taxSavingsPkr = normalTaxPkr - psebTaxPkr;

  const withdrawalMethods = [
    {
      name: 'Wise (Direct to HBL / Nayapay)',
      feeRate: '1.2% fee',
      speed: 'Instant (15 mins)',
      netPkr: Math.round(grossPkr * 0.988 - psebTaxPkr),
      recommended: true,
      features: 'Best mid-market exchange rate with State Bank PRC certificate'
    },
    {
      name: 'Payoneer to Pakistani Bank',
      feeRate: '2.5% fee + $3 flat',
      speed: '24 Hours',
      netPkr: Math.round(grossPkr * 0.975 - psebTaxPkr),
      recommended: false,
      features: 'High availability, direct integration with JazzCash'
    },
    {
      name: 'Direct SWIFT Wire (HBL / Meezan)',
      feeRate: '$25 flat fee',
      speed: '2-3 Business Days',
      netPkr: Math.round((usdSalaryInput - 25) * exchangeRate - psebTaxPkr),
      recommended: false,
      features: 'Best for large retainers ($2,500+), requires bank branch PRC submission'
    },
    {
      name: 'Nayapay Freelancer Account',
      feeRate: '1.4% fee',
      speed: 'Instant Real-time',
      netPkr: Math.round(grossPkr * 0.986 - psebTaxPkr),
      recommended: true,
      features: 'Direct Raast integration, zero physical paperwork, digital SBP PRC'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 sm:p-8 border border-emerald-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Pakistan ➔ Global Remote Corridor (US • UK • EU • UAE)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bypass Pakistani GPA Barriers. <span className="text-emerald-400">Earn in USD & EUR</span> from Pakistan.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Global tech startups do not care about Pakistani university GPA cutoffs. They hire based on verified GitHub code, asynchronous English documentation, and Dockerized microservices.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 text-center space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-300 block">
              Faizan's Remote Readiness
            </span>
            <div className="text-3xl font-extrabold text-white flex items-center justify-center space-x-1">
              <span>{metrics.overallScore}%</span>
              <span className="text-emerald-400 text-sm font-semibold">Ready</span>
            </div>
            <span className="text-[10px] text-slate-300 block">
              High Overlap with US EST (5-9 PM PKT)
            </span>
            <button
              onClick={() => setActiveSubTab('readiness')}
              className="text-[11px] font-bold text-emerald-300 hover:text-emerald-200 underline cursor-pointer"
            >
              View Readiness Diagnostic
            </button>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveSubTab('jobs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'jobs'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Global Remote Roles ({jobs.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('readiness')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'readiness'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Remote Readiness Index (92%)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('calculator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'calculator'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>USD ➔ PKR Payout & Bank Calculator</span>
          </button>
          <button
            onClick={() => setActiveSubTab('tax_shield')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeSubTab === 'tax_shield'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PSEB & FBR 1% Tax Shield Guide</span>
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-fade-in shadow-sm">
          <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Sub-tab 1: Global Remote Jobs */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Filter Region:</span>
              {['all', 'US', 'UK', 'EU', 'UAE / Gulf', 'Canada'].map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedCountry(region)}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                    selectedCountry === region
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {region === 'all' ? 'All Global' : region}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center text-xs">
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">Tech Stack:</span>
              {['all', 'Next.js', 'Python', 'Flutter', 'Docker'].map((stack) => (
                <button
                  key={stack}
                  onClick={() => setSelectedStack(stack)}
                  className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                    selectedStack === stack
                      ? 'bg-emerald-700 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {stack}
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredJobs.map((job) => {
              const isApplied = !!appliedJobs[job.id];
              return (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-900 text-white text-xl flex items-center justify-center font-bold shadow-xs">
                          {job.companyLogo}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm">{job.title}</h3>
                          <div className="flex items-center space-x-1.5 text-slate-500 text-xs mt-0.5">
                            <span className="font-semibold text-slate-700">{job.companyName}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{job.companyCountry}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {job.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          Fast-Track Hire
                        </span>
                      )}
                    </div>

                    {/* Salary & Timezone */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Stipend / Salary</span>
                        <div className="text-sm font-extrabold text-emerald-700">
                          ${job.salaryUsdMonthly.toLocaleString()} / mo
                          <span className="text-[11px] font-normal text-slate-500 ml-1.5">
                            (≈ PKR {job.salaryPkrEquivalent.toLocaleString()})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">PKT Overlap</span>
                        <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1 justify-end">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{job.timezoneRequirement}</span>
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Requirements checklist */}
                    <div className="space-y-1">
                      {job.requirements.map((req, i) => (
                        <div key={i} className="text-[11px] text-slate-600 flex items-start space-x-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.techStack.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-medium">
                      <span>Recruiter: {job.hiringManager}</span>
                    </div>

                    {isApplied ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center space-x-1">
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Proof-of-Work Sent</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApply(job)}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>1-Click Proof-of-Work Apply</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Remote Readiness Index */}
      {activeSubTab === 'readiness' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Muhammad Faizan Farooq's Remote Readiness Diagnostic
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated based on Git commit message clarity, AST test assertions, and timezone adaptability from Lahore, Pakistan.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Certified Status: {metrics.readyStatus}</span>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="font-extrabold text-indigo-700 text-sm">{metrics.timezoneCompatibilityScore}%</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Timezone Overlap (EST/GMT)</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                4-hour daily overlap with US East Coast (5:00 PM - 9:00 PM PKT). 6-hour overlap with London & Berlin.
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${metrics.timezoneCompatibilityScore}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-emerald-700 text-sm">{metrics.asyncCommScore}%</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Async Communication & PRs</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Concise architectural walkthroughs, clear reproduction steps, and self-documenting code comments.
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${metrics.asyncCommScore}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <Globe2 className="w-5 h-5 text-blue-600" />
                <span className="font-extrabold text-blue-700 text-sm">{metrics.englishTechFluencyScore}%</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Technical English Fluency</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Tested via simulated technical interview and written design docs. Rated CEFR C1 Professional Proficiency.
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${metrics.englishTechFluencyScore}%` }}></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <Cpu className="w-5 h-5 text-purple-600" />
                <span className="font-extrabold text-purple-700 text-sm">{metrics.gitCicdScore}%</span>
              </div>
              <h4 className="font-bold text-slate-900 text-xs">Git & Automated CI/CD</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Verified automated GitHub Actions workflows, multi-stage Docker builds, and semantic commit history.
              </p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${metrics.gitCicdScore}%` }}></div>
              </div>
            </div>
          </div>

          {/* Action Callout */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-extrabold text-emerald-950 text-sm">Want to boost your score to 98%?</h4>
              <p className="text-xs text-emerald-800">
                Run an AST code audit on your latest repository to verify edge-case coverage and Docker isolation.
              </p>
            </div>
            {onOpenAudit && (
              <button
                onClick={onOpenAudit}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                Run Code Audit Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Payout & Currency Calculator */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Remote Income Estimator</h3>
              <p className="text-xs text-slate-500">
                Calculate net PKR take-home after local banking fees & PSEB tax incentives.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Monthly USD Salary ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={usdSalaryInput}
                    onChange={(e) => setUsdSalaryInput(Number(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  USD to PKR Exchange Rate (Interbank)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rs.</span>
                  <input
                    type="number"
                    step="0.5"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value) || 278)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Live State Bank interbank reference: ~Rs. 278.50</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Gross Pakistani Rupees</span>
              <div className="text-2xl font-extrabold text-emerald-900 font-mono">
                PKR {grossPkr.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-700 leading-snug">
                Under SBP IT export guidelines, you retain 100% foreign exchange in a Specialized Foreign Currency (FCY) account or convert to PKR.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">PSEB 1% Tax Shield</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">Withholding Tax (1%):</span>
                <span className="font-bold text-emerald-700">PKR {psebTaxPkr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600">You Save vs Normal Tax:</span>
                <span className="font-extrabold text-indigo-700">PKR {taxSavingsPkr.toLocaleString()}/mo</span>
              </div>
            </div>
          </div>

          {/* Methods Comparison */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Pakistani Remittance Methods Comparison</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {withdrawalMethods.map((method, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    method.recommended 
                      ? 'border-emerald-500/50 bg-emerald-50/20 shadow-xs' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between">
                      <h4 className="font-extrabold text-slate-900 text-xs">{method.name}</h4>
                      {method.recommended && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Top Choice
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-3">
                      <span>Fee: <strong className="text-slate-800">{method.feeRate}</strong></span>
                      <span>•</span>
                      <span>Speed: <strong className="text-slate-800">{method.speed}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{method.features}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Net Received in PKR</span>
                      <span className="text-sm font-extrabold text-emerald-800 font-mono">
                        PKR {method.netPkr.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">Monthly</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <h5 className="font-bold text-slate-800 flex items-center space-x-1.5">
                <Percent className="w-3.5 h-3.5 text-indigo-600" />
                <span>State Bank PRC (Proceeds Realization Certificate) Note:</span>
              </h5>
              <p className="text-[11px] text-slate-500">
                Always request an automated Electronic PRC (e-PRC) from Wise, Payoneer, or your local Pakistani bank. You will upload this into your FBR IRIS portal to claim the 1% final tax rate under Code 9187.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Tax Shield & Compliance */}
      {activeSubTab === 'tax_shield' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Pakistani IT Exporter & Freelancer Tax Shield (FBR & PSEB)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official legal pathways designed by the Ministry of IT and State Bank of Pakistan for remote software engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                01
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs">PSEB Freelancer Registration</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Register on <strong>pseb.org.pk</strong> as an IT Freelancer (Annual fee: Rs. 1,000 for fresh graduates). This issues you an official IT Exporter ID that entitles your bank to grant 0% to 1% tax withholding.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                02
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs">FBR Section 154A (1% Final Tax)</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Income Tax Ordinance Section 154A levies a nominal <strong>1% final tax</strong> on export of computer software and IT services brought into Pakistan through official banking channels. No audit scrutiny.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                03
              </div>
              <h4 className="font-extrabold text-slate-900 text-xs">IRS Form W-8BEN for US Clients</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                US companies require you to sign a Form W-8BEN declaring you are a Pakistani tax resident. This waives the standard 30% US IRS withholding tax under the US-Pakistan Double Tax Treaty.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-emerald-400">Download Pre-filled W-8BEN & Tax Templates</h4>
              <p className="text-xs text-slate-300">
                WorkNest Ajao auto-fills your National Tax Number (NTN) and Pakistani address into compliant forms.
              </p>
            </div>
            <a
              href="#documents"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shrink-0 flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Go to Document Vault</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
