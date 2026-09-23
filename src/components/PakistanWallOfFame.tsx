import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  GraduationCap, 
  Building2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  Quote, 
  TrendingUp, 
  ThumbsUp, 
  Users,
  Search,
  ExternalLink
} from 'lucide-react';
import { ReviewTestimonial } from '../types';

interface PakistanWallOfFameProps {
  testimonials: ReviewTestimonial[];
  onOpenProjectModal?: (projectId: string) => void;
}

export const PakistanWallOfFame: React.FC<PakistanWallOfFameProps> = ({ testimonials }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'graduates' | 'founders'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchUniversity, setSearchUniversity] = useState<string>('');

  const filteredTestimonials = testimonials.filter((item) => {
    if (activeFilter === 'graduates' && item.type !== 'graduate') return false;
    if (activeFilter === 'founders' && item.type !== 'founder') return false;
    if (selectedCity !== 'all' && !item.location.toLowerCase().includes(selectedCity.toLowerCase())) return false;
    if (searchUniversity.trim()) {
      const q = searchUniversity.toLowerCase();
      const matchesUni = item.university?.toLowerCase().includes(q);
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesCompany = item.companyName.toLowerCase().includes(q);
      if (!matchesUni && !matchesName && !matchesCompany) return false;
    }
    return true;
  });

  const graduateStoriesCount = testimonials.filter(t => t.type === 'graduate').length;
  const founderCount = testimonials.filter(t => t.type === 'founder').length;

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/40 p-6 sm:p-10 shadow-xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Pakistan Wall of Fame • Real Pakistani CS/IT Hires</span>
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans text-white">
            Unfiltered Proof: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Zero GPA Barriers.</span> Real Software. Real PKR Stipends.
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Pakistani graduates from <strong className="text-white">FAST, NUST, UET, COMSATS, NED, and ITU</strong> who were rejected by traditional ATS algorithms because of 2.1 – 2.8 GPAs. On WorkNest Ajao, they built live production software for Lahore, Karachi, and Islamabad startups, earned guaranteed milestone stipends, and converted into high-paying full-time engineering roles.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">Rs. 18.5M+</div>
              <div className="text-[11px] text-slate-400 font-medium">Stipends Disbursed in PKR</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">88.4%</div>
              <div className="text-[11px] text-slate-400 font-medium">Full-Time Conversion Rate</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-teal-300">2.1 - 2.8</div>
              <div className="text-[11px] text-slate-400 font-medium">Avg. Graduate Starting GPA</div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">140+</div>
              <div className="text-[11px] text-slate-400 font-medium">Pakistani Startups & SMEs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Stories ({testimonials.length})
          </button>
          <button
            onClick={() => setActiveFilter('graduates')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeFilter === 'graduates'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Graduates ({graduateStoriesCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('founders')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeFilter === 'founders'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Founders & CTOs ({founderCount})</span>
          </button>
        </div>

        {/* City and University filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search FAST, NUST, Devsinc..."
              value={searchUniversity}
              onChange={(e) => setSearchUniversity(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none w-48 sm:w-56"
            />
          </div>

          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-emerald-500 outline-none"
          >
            <option value="all">All Pakistani Cities</option>
            <option value="Lahore">Lahore (Gulberg, DHA, Johar Town)</option>
            <option value="Karachi">Karachi (Clifton, Shahrah-e-Faisal)</option>
            <option value="Islamabad">Islamabad (Blue Area, I-8)</option>
            <option value="Faisalabad">Faisalabad</option>
            <option value="Peshawar">Peshawar</option>
          </select>
        </div>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTestimonials.map((item) => {
          const isGraduate = item.type === 'graduate';

          return (
            <div
              key={item.id}
              id={`wall-review-${item.id}`}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {/* Card Accent Top Line */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isGraduate ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                }`} 
              />

              <div>
                {/* Header Profile Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-100 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isGraduate 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}>
                          {isGraduate ? 'CS/IT Graduate' : 'Pakistani Founder'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.role}</p>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 text-slate-400 mr-0.5" />
                          {item.location}
                        </span>
                        {item.university && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">{item.university}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center space-x-0.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Milestone Project & Stipend Pill (For Graduates) */}
                {isGraduate && (
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Milestone Completed:</span>
                      <strong className="text-slate-800 font-sans">{item.projectCompleted}</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                      <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                        <span className="text-slate-500 font-normal">Stipend Earned:</span>
                        <span>{item.stipendEarnedPkr}</span>
                      </div>
                      {item.originalGpa && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                          Previous GPA: {item.originalGpa}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Founder Company Banner (For Founders) */}
                {!isGraduate && (
                  <div className="mt-4 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.companyName}</div>
                      <div className="text-[11px] text-slate-600">{item.companyCategory}</div>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-indigo-600 text-white font-bold">
                      Hiring via WorkNest
                    </span>
                  </div>
                )}

                {/* Testimonial Quote */}
                <div className="mt-4 relative pl-3 border-l-2 border-emerald-500/60 text-xs text-slate-700 leading-relaxed italic">
                  "{item.testimonialQuote}"
                </div>

                {/* Verified Tech Badges */}
                {item.verifiedTechBadges && item.verifiedTechBadges.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.verifiedTechBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer / Outcome */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Outcome: <strong>{item.hiredOutcome}</strong></span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA for Pakistani Graduates */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <h4 className="text-base font-bold">Are you a recent Pakistani CS/IT graduate looking for your first paid role?</h4>
          <p className="text-xs text-slate-400 mt-1">
            Skip automated GPA rejection filters. Upload your code to our AI Verifier and get matched with startups in Lahore, Karachi & Islamabad.
          </p>
        </div>
        <a
          href="#explore"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shrink-0 transition-colors shadow-xs"
        >
          Explore Paid Projects
        </a>
      </div>
    </div>
  );
};
