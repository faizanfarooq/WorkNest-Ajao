import type { ApplicationStatus, InternshipStatus, Role, WorkMode } from '@shared/schemas';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  /** Absent in the demo build. */
  emailVerified?: boolean;
  /** Profile photo from Google, when the account uses Google sign-in. */
  avatarUrl: string | null;
  company: { id: string; name: string; slug: string; logoUrl?: string } | null;
}

/** A keyword search a student ran, offered back to them on the Find internships page. */
export interface RecentSearch {
  _id: string;
  q: string;
  city: string;
  usedAt: string;
}

export interface CompanySummary {
  _id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  city?: string;
  industry?: string;
  size?: string;
  tagline?: string;
  verified?: boolean;
}

export interface Company extends CompanySummary {
  about: string;
  website?: string;
  createdAt: string;
  openRoles?: number;
}

export interface Question {
  _id: string;
  prompt: string;
  required: boolean;
}

export interface Internship {
  _id: string;
  companyId: string;
  company: CompanySummary | null;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  city: string;
  mode: WorkMode;
  paid: boolean;
  payAmount: number;
  payCurrency: 'PKR' | 'USD';
  payPeriod: 'month' | 'week' | 'total';
  durationWeeks: number;
  openings: number;
  deadline?: string;
  questions: Question[];
  status: InternshipStatus;
  publishedAt?: string;
  createdAt: string;
  applicationCount: number;
  acceptingApplications: boolean;
  saved?: boolean;
  applicationId?: string | null;
  isOwner?: boolean;
  viewCount?: number;
  statusCounts?: Partial<Record<ApplicationStatus, number>>;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  headline: string;
  university: string;
  degree: string;
  graduationYear?: number;
  city: string;
  bio: string;
  skills: string[];
  gpa?: number;
  hideGpa: boolean;
  links: { github?: string; linkedin?: string; portfolio?: string };
  resume?: { fileId: string; fileName: string; size: number; uploadedAt: string };
}

export interface HistoryEntry {
  status: ApplicationStatus;
  at: string;
  note?: string;
}

export type ApplicantView = Omit<StudentProfile, '_id' | 'resume'> & { id: string };

export interface Application {
  _id: string;
  internshipId: string;
  companyId: string;
  studentId: string;
  status: ApplicationStatus;
  coverLetter: string;
  answers: { questionId: string; prompt: string; answer: string }[];
  resume?: { fileId: string; fileName: string };
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
  internship?: (Partial<Internship> & { company?: CompanySummary }) | null;
  student?: ApplicantView | null;
  conversationId?: string | null;
}

export interface Conversation {
  _id: string;
  applicationId: string;
  internship: { _id: string; title: string } | null;
  student: { _id: string; name: string } | null;
  company: CompanySummary | null;
  lastMessageAt: string;
  lastMessagePreview: string;
  unread: number;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  side: 'student' | 'company';
  body: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  body: string;
  link: string;
  readAt?: string;
  createdAt: string;
}
