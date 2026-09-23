import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  User, 
  X,
  MapPin,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { InterviewBooking, Startup } from '../types';

interface InterviewSchedulerProps {
  interviews: InterviewBooking[];
  startups: Startup[];
  onBookInterview: (booking: Omit<InterviewBooking, 'id' | 'status'>) => void;
  onJoinMeeting: (meetUrl: string) => void;
}

export const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  interviews,
  startups,
  onBookInterview,
  onJoinMeeting,
}) => {
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState(startups[0].id);
  const [selectedDate, setSelectedDate] = useState('2026-09-24');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('03:30 PM - 04:15 PM PKT');
  const [agendaText, setAgendaText] = useState('Walkthrough of Milestone 2 API endpoints, Redis cache invalidation, and automated testing suite.');
  const [platform, setPlatform] = useState<'Google Meet' | 'WorkFest Virtual Room'>('Google Meet');

  const availableSlots = [
    '11:00 AM - 11:45 AM PKT',
    '02:00 PM - 02:45 PM PKT',
    '03:30 PM - 04:15 PM PKT',
    '05:00 PM - 05:45 PM PKT',
    '08:00 PM - 08:45 PM PKT (Evening Tech Sync)',
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startup = startups.find(s => s.id === selectedStartupId) || startups[0];

    onBookInterview({
      startupId: startup.id,
      startupName: startup.name,
      founderName: startup.founderName,
      founderAvatar: startup.founderAvatar,
      projectTitle: 'Technical Milestone & Architecture Review',
      date: selectedDate,
      time: selectedTimeSlot,
      timezone: 'PKT (Pakistan Standard Time, UTC+5)',
      durationMinutes: 45,
      platform: platform,
      meetUrl: platform === 'Google Meet' ? 'https://meet.google.com/wfa-lahore-tech' : 'https://worknest.pk/virtual-room/wfa-live',
      agenda: agendaText,
    });

    setShowBookModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-2">
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Virtual Project Kickoffs & Architecture Deep-Dives</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-sans">
            Technical Interview & Sprint Review Scheduling
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Meet directly with startup founders and lead architects to review technical RFCs, demo milestone deliverables, and clarify requirements. No generic HR screenings.
          </p>
        </div>

        <button
          id="open-book-interview-btn"
          onClick={() => setShowBookModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Book Technical Review Session</span>
        </button>
      </div>

      {/* Upcoming Interviews Cards */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider px-1">
          Scheduled Virtual Sessions ({interviews.length})
        </h3>

        {interviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No upcoming sessions scheduled yet. Click "Book Technical Review Session" to schedule with a founder.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map((inv) => (
              <div
                key={inv.id}
                id={`interview-card-${inv.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={inv.founderAvatar}
                        alt={inv.founderName}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{inv.founderName}</h4>
                        <p className="text-xs text-indigo-600 font-semibold">{inv.startupName}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      Confirmed
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Topic: <span className="font-normal text-slate-600">{inv.projectTitle}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-600 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{inv.date} • {inv.time}</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-900 block mb-0.5">Discussion Agenda:</span>
                      {inv.agenda}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <Video className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{inv.platform}</span>
                  </div>

                  <a
                    id={`join-meet-btn-${inv.id}`}
                    href={inv.meetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs"
                  >
                    <span>Join Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Schedule Technical Review Session
                </h3>
                <p className="text-xs text-slate-500">
                  Connect with founder on milestone architecture & expectations
                </p>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Select Startup / Founder
                </label>
                <select
                  value={selectedStartupId}
                  onChange={(e) => setSelectedStartupId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none bg-white font-semibold"
                >
                  {startups.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — Founder: {s.founderName} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Virtual Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none bg-white"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="WorkFest Virtual Room">WorkFest Virtual Room</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Select Available Founder Time Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`p-2 rounded-xl text-left text-xs font-mono border transition-all cursor-pointer ${
                        selectedTimeSlot === slot
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Agenda & Technical Talking Points
                </label>
                <textarea
                  value={agendaText}
                  onChange={(e) => setAgendaText(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-indigo-500 outline-none"
                  placeholder="Outline the milestone deliverables or architectural trade-offs you want to discuss..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="confirm-schedule-session-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Confirm & Sync Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
