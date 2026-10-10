import mongoose, { type Document, type Types } from 'mongoose';
const { Schema } = mongoose;

export interface IMilestone {
  _id?: Types.ObjectId;
  title: string;
  percentage: number;
  amountPkr: number;
  amountUsd: number;
  status: 'Pending' | 'In Progress' | 'In Review' | 'Released';
  completedAt?: Date;
  receiptRef?: string;
}

export interface IInternship extends Document {
  title: string;
  startupName: string;
  founderId: Types.ObjectId;
  city: string;
  area: string;
  isRemoteUsd: boolean;
  stipendPkr: number;
  stipendUsd: number;
  durationWeeks: number;
  techStack: string[];
  type: 'Full Internship' | '3-Day Micro-Task';
  description?: string;
  requirements?: string[];
  milestones: IMilestone[];
  createdAt: Date;
}

export const MilestoneSchema = new Schema<IMilestone>({
  title: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  amountPkr: {
    type: Number,
    default: 0,
  },
  amountUsd: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'In Review', 'Released'],
    default: 'Pending',
  },
  completedAt: {
    type: Date,
  },
  receiptRef: {
    type: String,
  },
});

export const InternshipSchema = new Schema<IInternship>({
  title: {
    type: String,
    required: [true, 'Internship title is required'],
    trim: true,
  },
  startupName: {
    type: String,
    required: [true, 'Startup name is required'],
    trim: true,
  },
  founderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  city: {
    type: String,
    default: 'Lahore',
  },
  area: {
    type: String,
    default: 'Johar Town',
  },
  isRemoteUsd: {
    type: Boolean,
    default: false,
  },
  stipendPkr: {
    type: Number,
    default: 45000,
  },
  stipendUsd: {
    type: Number,
    default: 0,
  },
  durationWeeks: {
    type: Number,
    default: 4,
  },
  techStack: {
    type: [String],
    default: ['React', 'Node.js'],
  },
  type: {
    type: String,
    enum: ['Full Internship', '3-Day Micro-Task'],
    default: 'Full Internship',
  },
  description: {
    type: String,
    default: '',
  },
  requirements: {
    type: [String],
    default: [],
  },
  milestones: {
    type: [MilestoneSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Internship = mongoose.models.Internship || mongoose.model<IInternship>('Internship', InternshipSchema);
