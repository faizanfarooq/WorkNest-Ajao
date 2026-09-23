import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  MapPin, 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  MessageSquare,
  Award
} from 'lucide-react';
import { InternshipProject, CandidateProfile } from '../types';

interface ProjectCardProps {
  project: InternshipProject;
  candidate: CandidateProfile;
  onSelectProject: (project: InternshipProject) => void;
  onQuickApply: (project: InternshipProject) => void;
  onStartChat: (startupId: string) => void;
  hasApplied?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  candidate,
  onSelectProject,
  onQuickApply,
  onStartChat,
  hasApplied = false,
}) => {
  // Calculate dynamic match score based on candidate skills vs required
  const candidateSkillNames = candidate.skills.map(s => s.name.toLowerCase());
  const matchedSkills = project.requiredSkills.filter(req => 
    candidateSkillNames.some(cs => cs.includes(req.toLowerCase()) || req.toLowerCase().includes(cs.split(' ')[0]))
  );
  
  const matchRatio = Math.round((matchedSkills.length / Math.max(1, project.requiredSkills.length)) * 100);
  // Blend with portfolio verified score
  const portfolioMatchScore = Math.min(99, Math.max(78, Math.round(matchRatio * 0.4 + candidate.overallMatchRating * 0.6)));

  return (
    <div 
      id={`project-card-${project.id}`}
      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
    >
      <div className="p-6">
        {/* Top bar: Startup & Match Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shadow-xs">
              {project.startup.logo}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm">{project.startup.name}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {project.startup.stage}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                  {project.startup.location}
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">
                  {project.startup.remotePolicy}
                </span>
              </div>
            </div>
          </div>

          {/* Portfolio Match Badge */}
          <div className="flex flex-col items-end">
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{portfolioMatchScore}% Portfolio Match</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">Based on verified code</span>
          </div>
        </div>

        {/* Project Title & Track */}
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {project.track}
            </span>
            {project.graduatePriority && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
                <Award className="w-3 h-3 mr-1 text-amber-600" />
                Post-Grad Priority Launchpad
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
            {project.title}
          </h2>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
        </div>

        {/* Milestones & Compensation pill stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <div>
            <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Duration</span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{project.durationWeeks} Weeks</p>
          </div>
          <div className="border-x border-slate-200">
            <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
              <Layers className="w-3 h-3" />
              <span>Milestones</span>
            </div>
            <p className="text-xs font-bold text-slate-800 mt-0.5">{project.milestones.length} Sprints</p>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span>Stipend</span>
            </div>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">{project.stipendTotal}</p>
          </div>
        </div>

        {/* Required Skills with matched indicator */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            Verified Stack Alignment
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.requiredSkills.map((skill) => {
              const isMatched = matchedSkills.includes(skill);
              return (
                <span
                  key={skill}
                  className={`text-xs px-2.5 py-0.5 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    isMatched
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  {isMatched && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  <span>{skill}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Founder Context snippet */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <img 
              src={project.startup.founderAvatar} 
              alt={project.startup.founderName}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="text-slate-600">
              Founder: <strong className="text-slate-800 font-semibold">{project.startup.founderName}</strong>
            </span>
          </div>
          <button
            id={`quick-chat-${project.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onStartChat(project.startup.id);
            }}
            className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <button
          id={`view-milestones-${project.id}`}
          onClick={() => onSelectProject(project)}
          className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center space-x-1 cursor-pointer"
        >
          <span>Milestone Roadmap</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <button
          id={`apply-project-${project.id}`}
          onClick={() => onQuickApply(project)}
          disabled={hasApplied}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
            hasApplied
              ? 'bg-emerald-100 text-emerald-800 cursor-default'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
          }`}
        >
          {hasApplied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Applied with Portfolio</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Portfolio Apply</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
