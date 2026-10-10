import mongoose, { type Document, type Types } from 'mongoose';
const { Schema } = mongoose;

export interface IAiAuditResult {
  score: number;
  feedback: string;
  cvBullets: string[];
  securityChecks?: string[];
  suggestions?: string[];
}

export interface IApplication extends Document {
  internshipId: Types.ObjectId;
  candidateId: Types.ObjectId;
  status: 'Applied' | 'Shortlisted' | 'Accepted' | 'Rejected' | 'Completed';
  githubRepoUrl?: string;
  submittedCode?: string;
  aiAuditResult?: IAiAuditResult;
  coverNote?: string;
  createdAt: Date;
}

export const ApplicationSchema = new Schema<IApplication>({
  internshipId: {
    type: Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Accepted', 'Rejected', 'Completed'],
    default: 'Applied',
  },
  githubRepoUrl: {
    type: String,
    trim: true,
  },
  submittedCode: {
    type: String,
  },
  aiAuditResult: {
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    cvBullets: { type: [String], default: [] },
    securityChecks: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
  },
  coverNote: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
