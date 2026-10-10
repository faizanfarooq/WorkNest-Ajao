import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  MessageSquare, 
  Send, 
  Bookmark, 
  Sparkles, 
  Filter, 
  Layers, 
  ChevronRight, 
  Award, 
  AlertCircle,
  Code2,
  Users,
  Compass,
  Zap,
  ArrowRight
} from 'lucide-react';
import { InternshipProject, CandidateProfile, Startup } from '../types';

interface IndeedJobSearchProps {
  projects: InternshipProject[];
  candidate: CandidateProfile;
  currency: 'PKR' | 'USD';
  lowGpaShieldActive: boolean;
  onQuickApply: (project: InternshipProject, customNote?: string) => void;
  appliedProjectIds: Set<string>;
  onOpenChatWithFounder: (startupId: string) => void;
  onOpenCodeAuditor: () => void;
}

export const IndeedJobSearch: React.FC<IndeedJobSearchProps> = ({
  projects,
  candidate,
  currency,
  lowGpaShieldActive,
  onQuickApply,
  appliedProjectIds,
  onOpenChatWithFounder,
  onOpenCodeAuditor,
}) => {
  // Dual-input search states (Indeed style)
  const [whatKeyword, setWhatKeyword] = useState('');
  const [whereLocation, setWhereLocation] = useState('Johar Town, Lahore');

  // Sidebar Filter states
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [minStipendFilter, setMinStipendFilter] = useState<number>(0);
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [onlyUmtPriority, setOnlyUmtPriority] = useState(false);

  // Selected job for right-hand pane
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [applyNoteModalOpen, setApplyNoteModalOpen] = useState(false);
  const [customCoverNote, setCustomCoverNote] = useState('');
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set());

  // Quick location suggestions
  const popularLocations = [
    'Johar Town (near UMT)',
    'Gulberg III',
    'Arfa Software Park',
    'DHA Phase 5',
    'Remote Pakistan',
    'Global Remote (USD)',
  ];

  // Helper to convert stipend for display
  const formatStipend = (stipendStr: string) => {
    if (currency === 'USD') {
      if (stipendStr.includes('$')) return stipendStr;
      // Convert PKR to USD (approx 280 PKR = 1 USD)
      const numeric = parseInt(stipendStr.replace(/\D/g, '') || '0', 10);
      const usdVal = Math.round(numeric / 280);
      return `$${usdVal} USD / Milestone`;
    }
    if (stipendStr.includes('$')) {
      const numericUsd = parseInt(stipendStr.replace(/\D/g, '') || '0', 10);
      const pkrVal = numericUsd * 280;
      return `PKR ${pkrVal.toLocaleString()} (USD Remote)`;
    }
    return stipendStr;
  };

  // Filter logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // "What" keyword match (Title, techStack, summary, startup name)
      const whatQuery = whatKeyword.toLowerCase().trim();
      const matchesWhat =
        !whatQuery ||
        project.title.toLowerCase().includes(whatQuery) ||
        project.startup.name.toLowerCase().includes(whatQuery) ||
        project.requiredSkills.some((s) => s.toLowerCase().includes(whatQuery)) ||
        project.summary.toLowerCase().includes(whatQuery);

      // "Where" location match
      const whereQuery = whereLocation.toLowerCase().trim();
      const isAllLocation = whereQuery === 'all' || whereQuery === '' || whereQuery.includes('all');
      const matchesWhere =
        isAllLocation ||
        project.startup.location.toLowerCase().includes(whereQuery) ||
        (whereQuery.includes('johar') && (project.startup.location.toLowerCase().includes('lahore') || project.startup.location.toLowerCase().includes('gulberg') || project.startup.location.toLowerCase().includes('johar'))) ||
        (whereQuery.includes('remote') && project.startup.remotePolicy.toLowerCase().includes('remote'));

      // Internship Type
      const matchesType =
        selectedType === 'All' ||
        (selectedType === 'Micro-Task' && project.durationWeeks <= 2) ||
        (selectedType === 'Full' && project.durationWeeks > 2);

      // Work Mode
      const matchesMode =
        selectedMode === 'All' ||
        (selectedMode === 'Remote' && project.startup.remotePolicy.toLowerCase().includes('virtual') || project.startup.remotePolicy.toLowerCase().includes('remote')) ||
        (selectedMode === 'On-site' && project.startup.remotePolicy.toLowerCase().includes('on-site')) ||
        (selectedMode === 'Hybrid' && project.startup.remotePolicy.toLowerCase().includes('hybrid'));

      // Tech Stack
      const matchesTech =
        selectedTech === 'All' ||
        project.requiredSkills.some((s) => s.toLowerCase().includes(selectedTech.toLowerCase()));

      // UMT Graduate Priority
      const matchesPriority = !onlyUmtPriority || project.graduatePriority;

      return matchesWhat && matchesWhere && matchesType && matchesMode && matchesTech && matchesPriority;
    });
  }, [projects, whatKeyword, whereLocation, selectedType, selectedMode, selectedTech, onlyUmtPriority]);

  // Selected project reference
  const selectedProject = useMemo(() => {
    return filteredProjects.find((p) => p.id === selectedProjectId) || filteredProjects[0] || null;
  }, [filteredProjects, selectedProjectId]);

  // Calculate Match Score between candidate skills and selected project
  const skillMatch = useMemo(() => {
    if (!selectedProject) return { score: 90, matched: [], toLearn: [] };
    const candidateSkillNames = candidate.skills.map((s) => s.name.toLowerCase());
    const matched: string[] = [];
    const toLearn: string[] = [];

    selectedProject.requiredSkills.forEach((req) => {
      const isMatch = candidateSkillNames.some((cs) => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs));
      if (isMatch) matched.push(req);
      else toLearn.push(req);
    });

    const ratio = matched.length / (selectedProject.requiredSkills.length || 1);
    const score = Math.min(98, Math.max(78, Math.round(ratio * 30 + 68)));

    return { score, matched, toLearn };
  }, [selectedProject, candidate]);

  const handleApplyClick = () => {
    if (!selectedProject) return;
    setCustomCoverNote(
      `Salam ${selectedProject.startup.founderName}! I am ${candidate.name} from UMT Lahore. My AST code reliability score is 96%, with production experience in ${selectedProject.requiredSkills.slice(0, 3).join(', ')}. I would love to tackle the milestones for ${selectedProject.title}.`
    );
    setApplyNoteModalOpen(true);
  };

  const handleConfirmApply = () => {
    if (selectedProject) {
      onQuickApply(selectedProject, customCoverNote);
      setApplyNoteModalOpen(false);
    }
  };

  const toggleSaveProject = (id: string) => {
    setSavedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* UMT Lahore Student Hero Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                UMT LAHORE PORTAL
              </span>
              <span className="text-xs text-zinc-500">
                Johar Town Campus • FAST & UET Partner Software Houses
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#09090B] tracking-tight mt-1">
              Find Verified Paid Internships & Micro-Tasks
            </h1>
            <p className="text-xs text-zinc-600 mt-1 max-w-2xl">
              Apply directly to engineering teams in Johar Town, Gulberg, and international remote squads.
              {lowGpaShieldActive && (
                <span className="text-emerald-800 font-bold ml-1">
                  🛡️ Low-GPA Shield Active: Minimum CGPA cutoffs bypassed via verified GitHub code.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onOpenCodeAuditor}
              className="px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Audit Portfolio (AST Score)</span>
            </button>
          </div>
        </div>

        {/* Dual-Input Search Bar (Indeed Style) */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-2">
          {/* What: Role / Tech Stack */}
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-400" />
            </div>
            <input
              id="indeed-what-search-input"
              type="text"
              value={whatKeyword}
              onChange={(e) => setWhatKeyword(e.target.value)}
              placeholder="What: Job title, tech stack (e.g. React, Node.js, Python, Raast)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E4E4E7] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-all"
            />
          </div>

          {/* Where: Locality in Lahore */}
          <div className="md:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <input
              id="indeed-where-search-input"
              type="text"
              value={whereLocation}
              onChange={(e) => setWhereLocation(e.target.value)}
              placeholder="Where: Johar Town, Gulberg, Arfa Tower, Remote..."
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#E4E4E7] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-all font-mono"
            />
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              id="indeed-search-submit-btn"
              onClick={() => {}}
              className="w-full h-full min-h-[40px] px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Roles</span>
            </button>
          </div>
        </div>

        {/* Quick Location Chips */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-zinc-500">
          <span className="font-bold text-[11px] text-zinc-700 shrink-0">Popular Near UMT:</span>
          {popularLocations.map((loc) => (
            <button
              key={loc}
              onClick={() => setWhereLocation(loc.replace(' (near UMT)', '').replace(' (USD)', ''))}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 cursor-pointer border ${
                whereLocation.toLowerCase().includes(loc.toLowerCase().split(' ')[0])
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {loc}
            </button>
          ))}
          <button
            onClick={() => setWhereLocation('All')}
            className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-900 underline shrink-0 cursor-pointer"
          >
            Clear Location
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Segmented Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedType('All')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('Full')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'Full' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Internships
            </button>
            <button
              onClick={() => setSelectedType('Micro-Task')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'Micro-Task' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ 3-Day Micro-Tasks
            </button>
          </div>

          {/* Mode Filter */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none"
          >
            <option value="All">Mode: All</option>
            <option value="On-site">On-site (Johar Town / Gulberg)</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Remote">100% Remote</option>
          </select>

          {/* Tech Stack Filter */}
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 outline-none"
          >
            <option value="All">Tech Stack: All</option>
            <option value="React">React / Next.js</option>
            <option value="Node">Node.js / Express</option>
            <option value="Python">Python / Django / FastAPI</option>
            <option value="PostgreSQL">PostgreSQL / SQL</option>
            <option value="Docker">Docker & DevOps</option>
          </select>
        </div>

        {/* UMT Priority & Low-GPA Checkbox */}
        <label className="flex items-center space-x-2 cursor-pointer font-medium text-slate-700 select-none">
          <input
            type="checkbox"
            checked={onlyUmtPriority}
            onChange={(e) => setOnlyUmtPriority(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
          />
          <span className="text-xs">UMT Priority Roles Only</span>
        </label>
      </div>

      {/* Main Two-Pane Split Dashboard (Indeed Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Scrollable Job Feed List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
            <span>{filteredProjects.length} internships found</span>
            <span>Sorted by relevance to UMT CS</span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">No roles match your filters</p>
              <p className="mt-1">Try resetting the location or keyword to view all Lahore internships.</p>
              <button
                onClick={() => {
                  setWhatKeyword('');
                  setWhereLocation('All');
                  setSelectedType('All');
                  setSelectedMode('All');
                }}
                className="mt-3 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isSelected = selectedProject?.id === project.id;
              const isApplied = appliedProjectIds.has(project.id);
              const isSaved = savedProjectIds.has(project.id);

              return (
                <div
                  key={project.id}
                  id={`job-card-${project.id}`}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm bg-emerald-50/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Selected Accent Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r"></div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xl shrink-0">
                        {project.startup.logo}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 hover:text-emerald-600 transition-colors">
                          {project.title}
                        </h3>
                        <div className="flex items-center space-x-1.5 text-xs text-slate-600 mt-0.5">
                          <span className="font-medium text-slate-900">{project.startup.name}</span>
                          <span>·</span>
                          <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {project.startup.location.split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveProject(project.id);
                      }}
                      className="text-slate-400 hover:text-emerald-600 p-1 cursor-pointer"
                      title={isSaved ? 'Saved' : 'Save role'}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                    </button>
                  </div>

                  {/* Locality & Distance kicker */}
                  <div className="mt-2.5 flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    <span>
                      {project.startup.location.includes('Johar')
                        ? 'Johar Town (0.4 km from UMT Campus)'
                        : project.startup.location.includes('Gulberg')
                        ? 'Gulberg III (MM Alam Road)'
                        : project.startup.location.includes('Arfa')
                        ? 'Arfa Software Park (Ferozepur Rd)'
                        : project.startup.location}
                    </span>
                  </div>

                  {/* Stipend & Escrow */}
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-black text-slate-900 font-mono text-sm">
                        {formatStipend(project.stipendTotal)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Escrow
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-500">
                      {project.durationWeeks} weeks · {project.commitmentHours.split('(')[0]}
                    </span>
                  </div>

                  {/* Badges without generic pills: unboxed tags */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {project.graduatePriority && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        UMT Priority
                      </span>
                    )}
                    {lowGpaShieldActive && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>GPA Waived</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono">
                      {project.startup.remotePolicy.split(' ')[0]}
                    </span>

                    {isApplied && (
                      <span className="ml-auto text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                        <span>Applied</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT PANE: Sticky Detailed Job Breakdown (7 Cols) */}
        <div className="lg:col-span-7 sticky top-20">
          {selectedProject ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Header Box */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-3xl shadow-xs shrink-0">
                      {selectedProject.startup.logo}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 leading-snug">
                        {selectedProject.title}
                      </h2>
                      <div className="flex items-center space-x-2 text-xs text-slate-600 mt-1">
                        <span className="font-bold text-slate-900">{selectedProject.startup.name}</span>
                        <span>·</span>
                        <span className="text-slate-500">{selectedProject.startup.stage}</span>
                        <span>·</span>
                        <span className="text-slate-500 font-mono">{selectedProject.startup.teamSize}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedProject.startup.location}</span>
                        <span>·</span>
                        <span className="text-slate-700 font-medium">
                          {selectedProject.startup.remotePolicy}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stipend Banner */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Guaranteed Milestone Stipend
                    </div>
                    <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
                      {formatStipend(selectedProject.stipendTotal)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      State Bank Raast Escrow
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {selectedProject.milestones.length} Deliverable Milestones
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  {appliedProjectIds.has(selectedProject.id) ? (
                    <div className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Application Submitted (Under Founder Review)</span>
                    </div>
                  ) : (
                    <button
                      id="easy-apply-btn"
                      onClick={handleApplyClick}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                    >
                      <Zap className="w-4 h-4 text-emerald-200" />
                      <span>Easy Apply with UMT Portfolio</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenChatWithFounder(selectedProject.startup.id)}
                    className="py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chat Founder</span>
                  </button>

                  <button
                    onClick={() => toggleSaveProject(selectedProject.id)}
                    className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer"
                    title="Bookmark Role"
                  >
                    <Bookmark className={`w-4 h-4 ${savedProjectIds.has(selectedProject.id) ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* UMT Profile Skill Match Meter */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-950">
                      Skill Compatibility with {candidate.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-indigo-700 font-mono text-sm">
                    {skillMatch.score}% Match
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-indigo-200/60 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${skillMatch.score}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block">Matched In Your Portfolio:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skillMatch.matched.map((s) => (
                        <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block">Skills to Learn:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skillMatch.toLearn.length > 0 ? (
                        skillMatch.toLearn.map((s) => (
                          <span key={s} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            + {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold">100% stack mastered</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Low-GPA Shield Proof-of-Work Comparison */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>WorkNest Low-GPA Shield In Action</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white/70 rounded border border-amber-200/60">
                    <span className="font-bold text-slate-500 block">Old Corporate Filter:</span>
                    <span className="text-slate-700 line-through">Requires 3.0+ CGPA transcript cutoff</span>
                  </div>
                  <div className="p-2 bg-white/90 rounded border border-emerald-300">
                    <span className="font-bold text-emerald-800 block">WorkNest Code-First Filter:</span>
                    <span className="text-emerald-950 font-bold">
                      AST verified GitHub code replaces GPA (Score: 96%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Milestone Escrow Schedule */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Milestone Escrow Schedule & Payouts
                  </h3>
                  <span className="text-[11px] text-slate-500">Funds locked in escrow before you start</span>
                </div>

                <div className="space-y-2">
                  {selectedProject.milestones.map((ms, idx) => (
                    <div
                      key={ms.id}
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                            M{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900">{ms.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 pl-7">{ms.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 font-mono text-xs block">
                          {formatStipend(ms.payoutAmount)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{ms.targetDuration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Role Summary & Objective */}
              <div className="space-y-2 text-xs text-slate-700">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                  Role Objective & Architecture
                </h3>
                <p className="leading-relaxed">{selectedProject.objective}</p>
                <p className="leading-relaxed text-slate-600">{selectedProject.summary}</p>
              </div>

              {/* Required & Preferred Skills */}
              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                  Tech Stack & Skill Requirements
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-mono text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                  {selectedProject.preferredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded bg-slate-50 text-slate-500 font-mono text-xs border border-dashed border-slate-300"
                    >
                      +{skill} (Preferred)
                    </span>
                  ))}
                </div>
              </div>

              {/* Company & Founder Section */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedProject.startup.founderAvatar}
                    alt={selectedProject.startup.founderName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedProject.startup.founderName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {selectedProject.startup.founderRole} · {selectedProject.startup.name}
                    </p>
                  </div>
                </div>
                <blockquote className="italic text-slate-700 text-[11px] border-l-2 border-[#ff6600] pl-3 py-0.5">
                  "{selectedProject.startup.founderBio}"
                </blockquote>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>📍 Office: {selectedProject.startup.location}</span>
                  <button
                    onClick={() => onOpenChatWithFounder(selectedProject.startup.id)}
                    className="text-[#ff6600] font-bold hover:underline cursor-pointer"
                  >
                    Open Direct Chat →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-sm">Select an internship to view details</p>
              <p className="mt-1">Click on any role in the left feed to see full technical requirements and milestone breakdown.</p>
            </div>
          )}
        </div>
      </div>

      {/* Easy Apply Note Modal */}
      {applyNoteModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-[#ff6600]">
                  1-Click Proof-of-Work Application
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Apply to {selectedProject.title}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {selectedProject.startup.name} · {selectedProject.startup.location.split(',')[0]}
                </p>
              </div>
              <button
                onClick={() => setApplyNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile snapshot sent with application */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>{candidate.name} (UMT Lahore CS '26)</span>
                <span className="text-emerald-700">AST Score: 96%</span>
              </div>
              <p className="text-slate-600">
                GitHub: <span className="font-mono text-slate-900">github.com/{candidate.githubHandle}</span>
              </p>
              <p className="text-slate-500">
                Verified Skills: {selectedProject.requiredSkills.slice(0, 3).join(', ')} · Raast Webhooks & Microservices
              </p>
            </div>

            {/* Note to Founder */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Note to Engineering Lead ({selectedProject.startup.founderName}):
              </label>
              <textarea
                value={customCoverNote}
                onChange={(e) => setCustomCoverNote(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] focus:ring-1 focus:ring-[#ff6600] text-xs outline-none"
                placeholder="Highlight your relevant repository, milestone availability, or final-year project..."
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setApplyNoteModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                className="px-4 py-2 rounded-lg bg-[#ff6600] hover:bg-[#e55c00] text-white font-bold transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Proof-of-Work Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
