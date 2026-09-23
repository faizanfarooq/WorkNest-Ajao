export type GraduationStatus = 
  | 'Recent CS Graduate (Seeking First Role)'
  | 'Recent IT Graduate (Seeking First Role)'
  | 'Final-Year Undergraduate (CS/IT)'
  | 'Master of Science in CS/IT'
  | 'Self-Taught / Career Transitioner';

export interface TechSkill {
  name: string;
  category: 'Languages' | 'Backend & DBs' | 'Cloud & DevOps' | 'Frontend' | 'AI & Data';
  verifiedLevel: 'Verified Production' | 'Verified Advanced' | 'Verified Intermediate';
  score: number; // 0-100
  evidenceProject: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  repoUrl: string;
  liveUrl?: string;
  architectureHighlights: string[];
  complexityScore: number; // 1-100
  aiVerified: boolean;
  aiVerificationDate?: string;
  codeMetrics?: {
    linesOfCode: number;
    testCoverage: string;
    cicdConfigured: boolean;
    dockerized: boolean;
  };
}

export interface VerificationBadge {
  id: string;
  title: string;
  issuer: 'WorkFest AI Verifier';
  category: 'Clean Code' | 'System Architecture' | 'Cloud Reliability' | 'Security & Auth' | 'Algorithm Rigor';
  level: 'Production-Grade' | 'High-Competency' | 'Senior-Ready';
  score: number;
  earnedAt: string;
  verificationHash: string;
}

export interface PeerReviewSquad {
  id: string;
  title: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerUni: string;
  status: 'Review Completed' | 'In Peer Review';
  score: number;
  feedbackSummary: string;
  githubPrUrl: string;
  date: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  graduationStatus: GraduationStatus;
  degreeInfo: string;
  university: string;
  graduationYear: number;
  bio: string;
  location: string;
  githubHandle: string;
  linkedinUrl: string;
  portfolioUrl: string;
  verifiedBadges: VerificationBadge[];
  skills: TechSkill[];
  projects: PortfolioProject[];
  overallMatchRating: number;
  completedMilestonesCount: number;
  unplacedGraduateStory: string; // The candidate's real journey overcoming the post-grad paradox
  hideGpaFromRecruiter: boolean;
  portfolioReliabilityScore: number;
  activeInternshipsCount: number;
  remoteApplicationsCount: number;
  peerReviewSquads: PeerReviewSquad[];
}

export interface MicroTask {
  id: string;
  title: string;
  startupName: string;
  startupLogo: string;
  category: string;
  durationDays: number;
  payoutPkr: number;
  payoutUsd: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  techStack: string[];
  deliverable: string;
  spotsLeft: number;
  status: 'open' | 'claimed' | 'submitted' | 'completed';
  claimedByYou?: boolean;
  claimantName?: string;
  githubPrUrl?: string;
}

export interface RemoteJob {
  id: string;
  title: string;
  companyName: string;
  companyCountry: 'US' | 'UK' | 'EU' | 'UAE / Gulf' | 'Canada' | string;
  companyLogo: string;
  salaryUsdMonthly: number;
  salaryPkrEquivalent: number;
  techStack: string[];
  workType: '100% Remote' | 'Async-First Remote';
  timezoneRequirement: string;
  experienceLevel: 'Entry-Level / Fresh Graduate' | 'Junior (0-1 yrs)';
  featured: boolean;
  applicantsCount: number;
  description: string;
  requirements: string[];
  hiringManager: string;
  applied?: boolean;
}

export interface RemoteReadinessScore {
  overallScore: number;
  timezoneCompatibilityScore: number;
  asyncCommScore: number;
  englishTechFluencyScore: number;
  gitCicdScore: number;
  readyStatus: 'Global Remote Ready' | 'Near-Ready (1 Sprint Practice)';
}

export interface MobileAlert {
  id: string;
  telco: 'Jazz' | 'Zong' | 'Telenor' | 'WhatsApp';
  sender: string;
  message: string;
  timestamp: string;
  type: 'escrow_deposit' | 'interview_scheduled' | 'code_verified' | 'remote_offer';
  channel?: 'sms' | 'whatsapp';
  read?: boolean;
}

export interface Milestone {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  targetDuration: string;
  payoutAmount: string;
  status: 'pending' | 'in_progress' | 'under_review' | 'approved';
  deliverablesSummary: string[];
  submission?: {
    prUrl: string;
    demoUrl: string;
    architectureNotes: string;
    submittedAt: string;
  };
  founderFeedback?: {
    approved: boolean;
    rating: number; // 1-5
    comment: string;
    reviewedAt: string;
  };
}

export interface Startup {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  location: string;
  industry: string;
  stage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Bootstrapped & Profitable' | string;
  teamSize: string;
  founderName: string;
  founderRole: string;
  founderAvatar: string;
  founderBio: string;
  remotePolicy: '100% Virtual / Remote Milestones' | 'Hybrid Hub Meetups Optional' | string;
}

export interface InternshipProject {
  id: string;
  startupId: string;
  startup: Startup;
  title: string;
  track: 'CS Backend & Distributed Systems' | 'IT Cloud & Platform Engineering' | 'Full-Stack Modern Web' | 'AI & LLM Data Engineering' | 'Backend Engineering & Cloud' | 'Mobile App Engineering' | 'Software Quality & Automation' | 'AI & Data Engineering' | 'IoT & Embedded Cloud' | string;
  summary: string;
  objective: string;
  durationWeeks: number;
  commitmentHours: string;
  stipendTotal: string;
  stipendModel: 'Milestone-based Escrow' | 'Bi-weekly Sprint Payout' | 'Project Completion + Equity Grant' | 'Milestone-based Escrow in PKR' | string;
  requiredSkills: string[];
  preferredSkills: string[];
  graduatePriority: boolean; // Specially marked to fast-track post-graduates without job placements
  milestones: Milestone[];
  activeApplicantsCount: number;
  spotsAvailable: number;
  outcomeExperience: string; // What the graduate will add to their resume/portfolio
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: 'candidate' | 'founder';
  senderAvatar: string;
  text: string;
  timestamp: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
  scheduleInvite?: {
    interviewId: string;
    dateTime: string;
    topic: string;
    meetUrl: string;
    status: 'proposed' | 'accepted' | 'declined';
  };
}

export interface ChatThread {
  id: string;
  startupId: string;
  startupName: string;
  founderName: string;
  founderAvatar: string;
  projectId: string;
  projectTitle: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCount: number;
}

export interface DocumentPortalItem {
  id: string;
  title: string;
  type: 'nda' | 'internship_contract' | 'milestone_spec' | 'experience_verification' | 'recommendation_letter';
  startupName: string;
  fileSize: string;
  uploadedDate: string;
  status: 'signed_by_both' | 'awaiting_candidate_sign' | 'awaiting_founder_sign' | 'verified_issued';
  downloadableUrl?: string;
  confidentiality: 'Confidential Startup IP' | 'Mutual Agreement' | 'Public Verifiable Credential';
  hashDigest: string;
}

export interface InterviewBooking {
  id: string;
  startupId: string;
  startupName: string;
  founderName: string;
  founderAvatar: string;
  projectTitle: string;
  date: string;
  time: string;
  timezone: string;
  durationMinutes: number;
  platform: 'Google Meet' | 'WorkFest Virtual Room';
  meetUrl: string;
  agenda: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface SkillAuditResult {
  candidateScore: number; // 0-100
  overallVerdict: 'Production-Ready' | 'Strong Competency' | 'Foundation Solid, Minor Gaps' | 'Needs Deepening';
  summary: string;
  categoryBreakdown: {
    cleanCodeAndArchitecture: { score: number; feedback: string };
    systemsAndScalability: { score: number; feedback: string };
    testingAndDevOps: { score: number; feedback: string };
    securityAndRobustness: { score: number; feedback: string };
  };
  keyStrengths: string[];
  areasForImprovement: string[];
  awardedBadges: {
    title: string;
    category: string;
    score: number;
  }[];
  matchedProjectRecommendations: string[];
}

export interface ReviewTestimonial {
  id: string;
  type: 'graduate' | 'founder';
  name: string;
  avatar: string;
  role: string;
  university?: string;
  originalGpa?: string;
  location: string;
  companyName: string;
  companyCategory: string;
  stipendEarnedPkr?: string;
  projectCompleted: string;
  hiredOutcome: string;
  rating: number;
  testimonialQuote: string;
  verifiedTechBadges: string[];
  date: string;
}
