import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Users, 
  ExternalLink, 
  Briefcase, 
  ShieldCheck, 
  Search, 
  Filter,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { CompanyDirectoryItem } from '../types';
import { COMPANIES_DIRECTORY } from '../data/mockData';

interface CompanyDirectoryProps {
  onSelectCompanyInternships: (companyName: string) => void;
  onOpenChatWithFounder: (companyId: string) => void;
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({
  onSelectCompanyInternships,
  onOpenChatWithFounder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('All');

  const areas = [
    'All',
    'Johar Town (near UMT)',
    'Gulberg III',
    'Arfa Software Park',
    'Model Town',
    'DHA Phase 5'
  ];

  const filteredCompanies = COMPANIES_DIRECTORY.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      comp.founderName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesArea =
      selectedArea === 'All' ||
      (selectedArea.includes('Johar') && comp.locationArea.toLowerCase().includes('johar')) ||
      (selectedArea.includes('Gulberg') && comp.locationArea.toLowerCase().includes('gulberg')) ||
      (selectedArea.includes('Arfa') && comp.locationArea.toLowerCase().includes('arfa')) ||
      (selectedArea.includes('Model') && comp.locationArea.toLowerCase().includes('model')) ||
      (selectedArea.includes('DHA') && comp.locationArea.toLowerCase().includes('dha'));

    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                LAHORE TECH ECOSYSTEM
              </span>
              <span className="text-xs text-slate-500">Johar Town • Gulberg • Arfa Tower</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Startups & Software Houses Partnered with UMT
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Directory of software houses in Johar Town (within 1 km of UMT Campus) and central Lahore that evaluate candidates based on GitHub proof-of-work instead of legacy CGPA cutoffs.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 shrink-0">
            <span>{COMPANIES_DIRECTORY.length} Vetted Companies</span>
            <span>·</span>
            <span className="text-emerald-700">100% Paid Milestones</span>
          </div>
        </div>

        {/* Search & Area Filter */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies by name, tech stack (Node.js, React, Python), or founder..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs font-medium text-slate-700 outline-none"
            >
              {areas.map((area) => (
                <option key={area} value={area}>
                  Location: {area}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompanies.map((comp) => (
          <div
            key={comp.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 hover:shadow-2xs transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-2xl shrink-0">
                    {comp.logo}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">
                      {comp.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5">
                      <span>{comp.industry}</span>
                      <span>·</span>
                      <span className="font-mono">{comp.teamSize}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wide shrink-0">
                  {comp.openInternshipsCount} Roles Open
                </span>
              </div>

              {/* Location & Distance from UMT */}
              <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-[#ff6600] shrink-0" />
                <span className="font-medium text-slate-900">{comp.locationArea}</span>
                <span>·</span>
                <span className="font-mono text-emerald-700 font-bold">{comp.distanceFromUmt}</span>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {comp.description}
              </p>

              {/* Tech Stack Tags */}
              <div className="mt-3 flex flex-wrap gap-1">
                {comp.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Founder kicker */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Engineering Lead: <strong className="text-slate-800">{comp.founderName}</strong>
                </span>
                {comp.acceptsLowGpa && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Shield Approved
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => onSelectCompanyInternships(comp.name)}
                className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>View {comp.name} Roles</span>
              </button>

              <button
                onClick={() => onOpenChatWithFounder(comp.id.replace('comp-', 'startup-'))}
                className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Message Engineering Lead"
              >
                Chat Lead
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
