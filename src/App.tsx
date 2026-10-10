import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  Layers, 
  DollarSign, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { 
  trackTabNavigation, 
  trackRoleSwitch, 
  trackProjectApplication 
} from './services/analytics';
import { 
  CandidateProfile, 
  InternshipProject, 
  ChatThread, 
  ChatMessage, 
  DocumentPortalItem, 
  InterviewBooking,
  VerificationBadge,
  TechSkill,
  MicroTask,
  RemoteJob,
  MobileAlert
} from './types';
import { 
  CURRENT_GRADUATE, 
  STARTUPS, 
  INTERNSHIP_PROJECTS, 
  CHAT_THREADS, 
  CHAT_MESSAGES_MAP, 
  DOCUMENT_PORTAL_ITEMS, 
  UPCOMING_INTERVIEWS,
  PAKISTAN_TESTIMONIALS,
  MICRO_TASKS,
  GLOBAL_REMOTE_JOBS,
  REMOTE_READINESS_METRICS,
  MOBILE_ALERTS
} from './data/mockData';
import { Header, NavigationTab } from './components/Header';
import { IndeedJobSearch } from './components/IndeedJobSearch';
import { CompanyDirectory } from './components/CompanyDirectory';
import { ResourcesHub } from './components/ResourcesHub';
import { StudentDashboard } from './components/StudentDashboard';
import { AuthModal } from './components/AuthModal';
import { PostRoleModal } from './components/PostRoleModal';
import { GraduateBanner } from './components/GraduateBanner';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { AiSkillVerifier } from './components/AiSkillVerifier';
import { MilestoneTracker } from './components/MilestoneTracker';
import { FounderChat } from './components/FounderChat';
import { DocumentPortal } from './components/DocumentPortal';
import { InterviewScheduler } from './components/InterviewScheduler';
import { FounderView } from './components/FounderView';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { PakistanWallOfFame } from './components/PakistanWallOfFame';
import { MicroTasksBoard } from './components/MicroTasksBoard';
import { RemoteCareerPathway } from './components/RemoteCareerPathway';
import { BackendApiExplorer } from './components/BackendApiExplorer';

export default function App() {
  // Navigation & Role state
  const [activeTab, setActiveTab] = useState<NavigationTab>('internships');
  const [userRole, setUserRole] = useState<'candidate' | 'founder'>('candidate');
  const [currency, setCurrency] = useState<'PKR' | 'USD'>('PKR');
  const [lowGpaShieldActive, setLowGpaShieldActive] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [postRoleModalOpen, setPostRoleModalOpen] = useState<boolean>(false);

  // Core Data state
  const [candidate, setCandidate] = useState<CandidateProfile>(CURRENT_GRADUATE);
  const [projects, setProjects] = useState<InternshipProject[]>(INTERNSHIP_PROJECTS);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>(CHAT_THREADS);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(CHAT_MESSAGES_MAP);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-finflow');
  const [documents, setDocuments] = useState<DocumentPortalItem[]>(DOCUMENT_PORTAL_ITEMS);
  const [interviews, setInterviews] = useState<InterviewBooking[]>(UPCOMING_INTERVIEWS);
  const [microTasks, setMicroTasks] = useState<MicroTask[]>(MICRO_TASKS);
  const [remoteJobs, setRemoteJobs] = useState<RemoteJob[]>(GLOBAL_REMOTE_JOBS);
  const [mobileAlerts, setMobileAlerts] = useState<MobileAlert[]>(MOBILE_ALERTS);

  // Interaction State
  const [appliedProjectIds, setAppliedProjectIds] = useState<Set<string>>(new Set(['project-fin-01']));
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<InternshipProject | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [onlyGraduatePriority, setOnlyGraduatePriority] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter projects based on search and tags
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.startup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proj.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTrack = selectedTrack === 'All' || proj.track === selectedTrack;
    const matchesPriority = !onlyGraduatePriority || proj.graduatePriority;
    const matchesLocation = selectedLocation === 'All' || proj.startup.location.includes(selectedLocation);

    return matchesSearch && matchesTrack && matchesPriority && matchesLocation;
  });

  // Google Analytics Tracking on Tab Navigation & Role Switch
  useEffect(() => {
    trackTabNavigation(activeTab);
  }, [activeTab]);

  useEffect(() => {
    trackRoleSwitch(userRole);
  }, [userRole]);

  // Action: 1-Click Apply with Portfolio
  const handleQuickApply = (project: InternshipProject, customNote?: string) => {
    if (appliedProjectIds.has(project.id)) return;

    setAppliedProjectIds(prev => new Set(prev).add(project.id));
    setSelectedProjectForModal(null);
    showToast(`Proof-of-Work Application submitted to ${project.startup.name}! Founder ${project.startup.founderName} notified.`);

    // Track application submission in Google Analytics
    trackProjectApplication({
      projectId: project.id,
      projectTitle: project.title,
      startupName: project.startup.name,
      stipendTotal: project.stipendTotal,
    });

    // Automatically ensure chat thread exists
    const threadId = `thread-${project.startup.id.replace('startup-', '')}`;
    if (!messagesMap[threadId]) {
      const newThread: ChatThread = {
        id: threadId,
        startupId: project.startup.id,
        startupName: project.startup.name,
        founderName: project.startup.founderName,
        founderAvatar: project.startup.founderAvatar,
        projectId: project.id,
        projectTitle: project.title,
        lastMessageText: customNote || `Applied with verified portfolio for ${project.title}`,
        lastMessageTimestamp: 'Just now',
        unreadCount: 0
      };
      setChatThreads(prev => [newThread, ...prev]);

      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        threadId,
        senderId: candidate.id,
        senderName: candidate.name,
        senderRole: 'candidate',
        senderAvatar: candidate.avatar,
        text: customNote || `Hello ${project.startup.founderName}, I have applied for "${project.title}". My verified GitHub code and AI Proof-of-Skill audit are attached. Ready to start Milestone 1!`,
        timestamp: 'Just now'
      };
      setMessagesMap(prev => ({ ...prev, [threadId]: [initialMessage] }));
    }
  };

  // Action: Claim or Submit Micro Task
  const handleClaimMicroTask = (taskId: string, githubPrUrl: string) => {
    setMicroTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'submitted',
          claimantName: candidate.name,
          githubPrUrl: githubPrUrl || 'https://github.com/m-faizan-farooq/pull/4'
        };
      }
      return t;
    }));

    const claimedTask = microTasks.find(t => t.id === taskId);
    const payout = currency === 'PKR' ? claimedTask?.payoutPkr : claimedTask?.payoutUsd;

    showToast(`Micro-Task submitted with GitHub PR! Escrow payout (${payout}) will disburse upon review.`);

    // Add alert notification
    const newAlert: MobileAlert = {
      id: `al-${Date.now()}`,
      channel: 'sms',
      telco: 'Jazz',
      sender: 'WorkNest-Escrow',
      message: `PR received for task "${claimedTask?.title.substring(0, 30)}...". Escrow release queued upon code merge.`,
      timestamp: 'Just now',
      type: 'escrow_deposit',
      read: false
    };
    setMobileAlerts(prev => [newAlert, ...prev]);
  };

  // Action: Apply to Global Remote Job
  const handleApplyRemoteJob = (jobId: string) => {
    const job = remoteJobs.find(j => j.id === jobId);
    if (!job) return;

    setRemoteJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return { ...j, applicantsCount: j.applicantsCount + 1, applied: true };
      }
      return j;
    }));

    showToast(`Portfolio Proof submitted to ${job.companyName} (${job.companyCountry}) for ${job.title}!`);

    // Add notification alert
    const newAlert: MobileAlert = {
      id: `al-${Date.now()}`,
      channel: 'whatsapp',
      telco: 'WhatsApp',
      sender: `${job.companyName} Talent`,
      message: `Hi Faizan! Your verified AST benchmark of 96% and FastAPI async repos were received for ${job.title}. Scheduling US screening!`,
      timestamp: 'Just now',
      type: 'remote_offer',
      read: false
    };
    setMobileAlerts(prev => [newAlert, ...prev]);
  };

  // Action: Open Chat with Startup
  const handleStartChat = (startupId: string) => {
    const thread = chatThreads.find(t => t.startupId === startupId);
    if (thread) {
      setActiveThreadId(thread.id);
    }
    setActiveTab('chat');
  };

  // Action: Send Chat Message
  const handleSendMessage = (threadId: string, text: string, codeSnippet?: { language: string; code: string }) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: candidate.id,
      senderName: candidate.name,
      senderRole: 'candidate',
      senderAvatar: candidate.avatar,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      codeSnippet
    };

    setMessagesMap(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), newMessage]
    }));

    // Update last message in thread list
    setChatThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          lastMessageText: text || 'Sent a code snippet',
          lastMessageTimestamp: 'Just now'
        };
      }
      return t;
    }));
  };

  // Action: Update Milestone Deliverable
  const handleUpdateMilestone = (milestoneId: string, submission: any) => {
    setProjects(prev => prev.map(p => {
      const updatedMilestones = p.milestones.map(m => {
        if (m.id === milestoneId) {
          return {
            ...m,
            status: 'under_review' as const,
            submission
          };
        }
        return m;
      });
      return { ...p, milestones: updatedMilestones };
    }));
    showToast('Milestone deliverable submitted for founder code review.');
  };

  // Action: Founder Sign-off on Milestone
  const handleFounderApproveMilestone = (milestoneId: string) => {
    let approvedAmount = 'PKR 45,000';
    setProjects(prev => prev.map(p => {
      const updatedMilestones = p.milestones.map(m => {
        if (m.id === milestoneId) {
          approvedAmount = m.payoutAmount;
          return {
            ...m,
            status: 'approved' as const,
            founderFeedback: {
              approved: true,
              rating: 5,
              comment: 'Exceptional deliverable! Clean connection pool abstractions and test suite passed flawlessly. Released escrow.',
              reviewedAt: new Date().toISOString().split('T')[0]
            }
          };
        }
        return m;
      });
      return { ...p, milestones: updatedMilestones };
    }));

    // Add certified experience document
    const newDoc: DocumentPortalItem = {
      id: `doc-cert-${Date.now()}`,
      title: `Verified Milestone Sign-off Credential (${approvedAmount})`,
      type: 'experience_verification',
      startupName: 'FinFlow Pakistan & WorkNest Ajao',
      fileSize: '740 KB',
      uploadedDate: new Date().toISOString().split('T')[0],
      status: 'verified_issued',
      confidentiality: 'Public Verifiable Credential',
      hashDigest: `sha256:${Math.random().toString(16).substring(2, 12)}...`
    };
    setDocuments(prev => [newDoc, ...prev]);

    showToast(`Founder Tariq Masood (CTO) approved Milestone! ${approvedAmount} Escrow released & Verified Credential generated.`);
  };

  // Action: Document E-Signature
  const handleSignDocument = (docId: string) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === docId) {
        return { ...d, status: 'signed_by_both' as const };
      }
      return d;
    }));
    showToast('Document electronically signed and registered in tamper-resistant vault.');
  };

  // Action: Book Interview
  const handleBookInterview = (booking: Omit<InterviewBooking, 'id' | 'status'>) => {
    const newInv: InterviewBooking = {
      ...booking,
      id: `inv-${Date.now()}`,
      status: 'upcoming'
    };
    setInterviews(prev => [newInv, ...prev]);

    // Send calendar invite card into founder chat
    const thread = chatThreads.find(t => t.startupId === booking.startupId);
    if (thread) {
      const inviteMsg: ChatMessage = {
        id: `msg-inv-${Date.now()}`,
        threadId: thread.id,
        senderId: candidate.id,
        senderName: candidate.name,
        senderRole: 'candidate',
        senderAvatar: candidate.avatar,
        text: `Scheduled a technical review session on ${booking.date} at ${booking.time}.`,
        timestamp: 'Just now',
        scheduleInvite: {
          interviewId: newInv.id,
          dateTime: `${booking.date} • ${booking.time}`,
          topic: booking.agenda,
          meetUrl: booking.meetUrl,
          status: 'accepted'
        }
      };
      setMessagesMap(prev => ({
        ...prev,
        [thread.id]: [...(prev[thread.id] || []), inviteMsg]
      }));
    }

    showToast(`Technical review scheduled for ${booking.date} at ${booking.time}.`);
  };

  // Action: Save Verified Badge from AI Verifier
  const handleBadgeAwarded = (badge: VerificationBadge, newSkill: TechSkill) => {
    setCandidate(prev => ({
      ...prev,
      portfolioReliabilityScore: Math.min(99, (prev.portfolioReliabilityScore ?? 96) + 1),
      overallMatchRating: Math.min(99, prev.overallMatchRating + 2),
      verifiedBadges: [badge, ...prev.verifiedBadges],
      skills: [newSkill, ...prev.skills.filter(s => s.name !== newSkill.name)]
    }));
    showToast(`Proof-of-Skill Badge "${badge.title}" added to your verified portfolio!`);
  };

  // Action: Founder posts new project
  const handlePostNewProject = (newProjectData: any) => {
    const newProj: InternshipProject = {
      id: `proj-${Date.now()}`,
      startupId: STARTUPS[0].id,
      startup: STARTUPS[0],
      title: newProjectData.title,
      track: newProjectData.track,
      summary: newProjectData.summary,
      objective: newProjectData.summary,
      durationWeeks: newProjectData.durationWeeks,
      commitmentHours: '15-20 hrs/week',
      stipendTotal: newProjectData.stipendTotal,
      stipendModel: 'Milestone-based Escrow',
      requiredSkills: newProjectData.requiredSkills,
      preferredSkills: ['Git', 'Docker'],
      graduatePriority: true,
      activeApplicantsCount: 1,
      spotsAvailable: 2,
      outcomeExperience: 'Shipped production features directly to startup codebases without GPA gatekeeping.',
      milestones: [
        {
          id: `ms-new-1`,
          stepNumber: 1,
          title: 'RFC Spec & Sandbox Setup',
          description: 'Define technical design and initialize containerized dev environment.',
          targetDuration: 'Week 1-2',
          payoutAmount: 'PKR 35,000',
          status: 'pending',
          deliverablesSummary: ['RFC Document', 'Docker compose setup']
        },
        {
          id: `ms-new-2`,
          stepNumber: 2,
          title: 'Core Implementation & CI Integration',
          description: 'Develop main feature with unit and integration tests.',
          targetDuration: 'Week 3-5',
          payoutAmount: 'PKR 45,000',
          status: 'pending',
          deliverablesSummary: ['Tested code', 'GitHub Actions workflow']
        }
      ]
    };

    setProjects(prev => [newProj, ...prev]);
    showToast('New milestone project published to WorkNest Ajao launchpad!');
  };

  const unreadChatCount = chatThreads.reduce((acc, t) => acc + t.unreadCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header (YC-Inspired) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        candidate={candidate}
        currency={currency}
        onToggleCurrency={() => setCurrency((prev) => (prev === 'PKR' ? 'USD' : 'PKR'))}
        lowGpaShieldActive={lowGpaShieldActive}
        onToggleLowGpaShield={() => {
          setLowGpaShieldActive((prev) => !prev);
          showToast(
            lowGpaShieldActive
              ? 'Low-GPA Shield deactivated.'
              : 'Low-GPA Shield activated: Minimum CGPA cutoffs bypassed via verified GitHub code.'
          );
        }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenPostRoleModal={() => setPostRoleModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        unreadChatCount={unreadChatCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Indeed-Style 2-Pane Job Search Feed */}
        {activeTab === 'internships' && (
          <IndeedJobSearch
            projects={projects}
            candidate={candidate}
            currency={currency}
            lowGpaShieldActive={lowGpaShieldActive}
            onQuickApply={(p, note) => handleQuickApply(p, note)}
            appliedProjectIds={appliedProjectIds}
            onOpenChatWithFounder={(sId) => handleStartChat(sId)}
            onOpenCodeAuditor={() => setActiveTab('auditor')}
          />
        )}

        {/* TAB 2: Remote USD Pathways */}
        {activeTab === 'remote' && (
          <RemoteCareerPathway
            jobs={remoteJobs}
            metrics={REMOTE_READINESS_METRICS}
            candidate={candidate}
            currency={currency}
            onApplyJob={handleApplyRemoteJob}
            onOpenAudit={() => setActiveTab('auditor')}
          />
        )}

        {/* TAB 3: Startups & Companies Directory */}
        {activeTab === 'companies' && (
          <CompanyDirectory
            onSelectCompanyInternships={(compName) => {
              setActiveTab('internships');
              showToast(`Displaying internships for ${compName}`);
            }}
            onOpenChatWithFounder={(sId) => handleStartChat(sId)}
          />
        )}

        {/* TAB 4: AI Code Auditor */}
        {activeTab === 'auditor' && (
          <AiSkillVerifier
            candidate={candidate}
            onBadgeAwarded={handleBadgeAwarded}
            onExploreMatchedProjects={() => setActiveTab('internships')}
          />
        )}

        {/* TAB 5: Resources (Resume Builder, Interview Guides, IELTS) */}
        {activeTab === 'resources' && (
          <ResourcesHub
            candidate={candidate}
            onOpenCodeAuditor={() => setActiveTab('auditor')}
          />
        )}

        {/* TAB 6: Student & Employer Dashboards */}
        {activeTab === 'dashboard' && (
          userRole === 'candidate' ? (
            <StudentDashboard
              candidate={candidate}
              currency={currency}
              onOpenChat={(sId) => handleStartChat(sId)}
              onOpenCodeAuditor={() => setActiveTab('auditor')}
              onNavigateToResources={() => setActiveTab('resources')}
              onNavigateToInternships={() => setActiveTab('internships')}
            />
          ) : (
            <FounderView
              startup={STARTUPS[0]}
              candidate={candidate}
              projects={projects}
              onApproveMilestone={(projId, msId) => handleFounderApproveMilestone(msId)}
              onOpenChat={(startupId) => handleStartChat(startupId)}
              onPostNewProject={handlePostNewProject}
            />
          )
        )}

        {/* TAB 7: Founder Chat */}
        {activeTab === 'chat' && (
          <FounderChat
            threads={chatThreads}
            messagesMap={messagesMap}
            activeThreadId={activeThreadId}
            onSelectThread={(id) => setActiveThreadId(id)}
            onSendMessage={handleSendMessage}
            onOpenScheduleModal={(sId, sName, fName) => setActiveTab('interviews')}
            candidate={candidate}
          />
        )}

        {/* Additional Specialty Tabs */}
        {activeTab === 'microtasks' && (
          <MicroTasksBoard
            tasks={microTasks}
            currency={currency}
            onClaimTask={handleClaimMicroTask}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestoneTracker
            project={projects[0]}
            onUpdateMilestone={handleUpdateMilestone}
            onFounderApproveMilestone={handleFounderApproveMilestone}
            onOpenChat={(startupId) => handleStartChat(startupId)}
            onViewDocuments={() => setActiveTab('documents')}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentPortal
            documents={documents}
            onSignDocument={handleSignDocument}
            onUploadDocument={(newDocData) => {
              const newDoc: DocumentPortalItem = {
                ...newDocData,
                id: `doc-${Date.now()}`,
                uploadedDate: new Date().toISOString().split('T')[0],
                hashDigest: `sha256:${Math.random().toString(16).substring(2, 12)}...`
              };
              setDocuments((prev) => [newDoc, ...prev]);
              showToast(`Document "${newDoc.title}" securely uploaded.`);
            }}
          />
        )}

        {activeTab === 'interviews' && (
          <InterviewScheduler
            interviews={interviews}
            startups={STARTUPS}
            onBookInterview={handleBookInterview}
            onJoinMeeting={(url) => window.open(url, '_blank')}
          />
        )}

        {activeTab === 'wall_of_fame' && (
          <PakistanWallOfFame
            testimonials={PAKISTAN_TESTIMONIALS}
            onOpenProjectModal={(projectId) => {
              const found = projects.find((p) => p.id === projectId);
              if (found) {
                setSelectedProjectForModal(found);
              } else {
                setSelectedProjectForModal(projects[0]);
              }
            }}
          />
        )}

        {activeTab === 'api_explorer' && (
          <BackendApiExplorer />
        )}
      </main>

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSelectRole={(r) => {
          setUserRole(r);
          showToast(`Authenticated as ${r === 'candidate' ? 'Student' : 'Employer'}`);
        }}
        currentRole={userRole}
      />

      {/* Post Role Modal (Employers) */}
      <PostRoleModal
        isOpen={postRoleModalOpen}
        onClose={() => setPostRoleModalOpen(false)}
        onPostRole={(newRole) => {
          handlePostNewProject(newRole);
          showToast(`Internship "${newRole.title}" published to UMT feed!`);
        }}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProjectForModal}
        candidate={candidate}
        isOpen={!!selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
        onApply={(p, note) => handleQuickApply(p, note)}
        onStartChat={(startupId) => handleStartChat(startupId)}
        hasApplied={selectedProjectForModal ? appliedProjectIds.has(selectedProjectForModal.id) : false}
      />

      {/* Candidate Profile Modal */}
      <CandidateProfileModal
        candidate={candidate}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onRunAudit={() => {
          setIsProfileModalOpen(false);
          setActiveTab('auditor');
        }}
      />
    </div>
  );
}

