import React, { useState } from 'react';
import { 
  PlusCircle, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2,
  Building2,
  Calendar
} from 'lucide-react';
import { InternshipProject } from '../types';

interface PostRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostRole: (newProject: any) => void;
}

export const PostRoleModal: React.FC<PostRoleModalProps> = ({
  isOpen,
  onClose,
  onPostRole,
}) => {
  const [title, setTitle] = useState('');
  const [startupName, setStartupName] = useState('FinFlow Pakistan');
  const [location, setLocation] = useState('Johar Town, Lahore (0.4 km from UMT)');
  const [remotePolicy, setRemotePolicy] = useState('Hybrid (Johar Town) / Remote PK');
  const [durationWeeks, setDurationWeeks] = useState(6);
  const [stipendTotal, setStipendTotal] = useState('PKR 60,000');
  const [requiredSkills, setRequiredSkills] = useState('React, Node.js, PostgreSQL');
  const [summary, setSummary] = useState('');
  const [objective, setObjective] = useState('');
  const [milestones, setMilestones] = useState([
    {
      title: 'Milestone 1: Schema Architecture & Core API',
      payoutAmount: 'PKR 25,000',
      targetDuration: 'Weeks 1-2',
      description: 'Design database schema and implement foundational service endpoints.'
    },
    {
      title: 'Milestone 2: Frontend Integration & Benchmarks',
      payoutAmount: 'PKR 35,000',
      targetDuration: 'Weeks 3-4',
      description: 'Ship responsive UI dashboard with 90%+ test coverage assertions.'
    }
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject = {
      id: `proj-${Date.now()}`,
      startupId: 'startup-finflow',
      startup: {
        id: 'startup-finflow',
        name: startupName,
        tagline: 'Johar Town engineering studio partner',
        logo: '⚡',
        location,
        industry: 'Software & Cloud Engineering',
        stage: 'Seed / Profitable',
        teamSize: '15 Engineers',
        founderName: 'Tariq Masood',
        founderRole: 'CTO & Co-Founder',
        founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        founderBio: 'We hire based on proven code commits, not GPA transcripts.',
        remotePolicy,
      },
      title,
      track: 'Full-Stack Modern Web',
      summary: summary || 'Develop production-ready modules with milestone escrow protection.',
      objective: objective || 'Hands-on architectural delivery with direct engineering lead mentorship.',
      durationWeeks: Number(durationWeeks),
      commitmentHours: '15-20 hrs/week',
      stipendTotal,
      stipendModel: 'Milestone-based Escrow in PKR',
      requiredSkills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
      preferredSkills: ['Docker', 'Git PR hygiene'],
      graduatePriority: true,
      activeApplicantsCount: 0,
      milestones: milestones.map((m, idx) => ({
        id: `ms-${Date.now()}-${idx}`,
        stepNumber: idx + 1,
        title: m.title,
        description: m.description,
        targetDuration: m.targetDuration,
        payoutAmount: m.payoutAmount,
        status: 'pending',
        deliverablesSummary: ['Git commit PR', 'Documentation & demo preview']
      })),
    };

    onPostRole(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#ff6600]">
              EMPLOYER PORTAL
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Post Paid Internship with Milestone Escrow
            </h3>
            <p className="text-[11px] text-slate-500">
              Only verified paid milestones permitted. Zero unpaid labor policy.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Internship Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Junior Node.js / React Engineer (Payment Webhooks)"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Name:</label>
              <input
                type="text"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Location / Locality:</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Total Stipend (Escrow):</label>
              <input
                type="text"
                value={stipendTotal}
                onChange={(e) => setStipendTotal(e.target.value)}
                placeholder="e.g. PKR 60,000"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs font-mono outline-none"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Duration (Weeks):</label>
              <input
                type="number"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(Number(e.target.value))}
                min={1}
                max={16}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Required Tech Stack (comma separated):</label>
            <input
              type="text"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="e.g. React, Node.js, PostgreSQL, Docker"
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Role Summary & Objective:</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Explain the architectural challenge and codebase the graduate will work on..."
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:border-[#ff6600] text-xs outline-none"
              required
            />
          </div>

          {/* Milestone Escrow Breakdown */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 block text-[11px] uppercase font-mono">
              Milestone Escrow Structure:
            </span>
            {milestones.map((ms, idx) => (
              <div key={idx} className="p-2 bg-white rounded border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>M{idx + 1}: {ms.title}</span>
                  <span className="text-[#ff6600] font-mono">{ms.payoutAmount}</span>
                </div>
                <p className="text-[11px] text-slate-500">{ms.description} ({ms.targetDuration})</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer shadow-xs"
            >
              Publish Role to UMT Feed
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
