import mongoose, { type Document } from 'mongoose';
const { Schema } = mongoose;
import bcrypt from 'bcryptjs';

export interface IUserWallet {
  pkrBalance: number;
  usdBalance: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'candidate' | 'founder' | 'admin';
  phone: string;
  city: 'Lahore' | 'Karachi' | 'Islamabad' | 'Rawalpindi' | 'Faisalabad' | 'Peshawar' | 'Remote';
  university?: 'UMT Lahore' | 'FAST-NUCES' | 'NUST' | 'ITU' | 'UET' | 'COMSATS' | 'NED' | 'Air University' | 'Other';
  gpa?: number;
  hideGpa: boolean;
  verifiedPortfolioScore: number;
  skills: string[];
  wallet: IUserWallet;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Candidate or Founder name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: true,
  },
  role: {
    type: String,
    enum: ['candidate', 'founder', 'admin'],
    default: 'candidate',
  },
  phone: {
    type: String,
    default: '+923001234567',
  },
  city: {
    type: String,
    enum: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Remote'],
    default: 'Lahore',
  },
  university: {
    type: String,
    enum: ['UMT Lahore', 'FAST-NUCES', 'NUST', 'ITU', 'UET', 'COMSATS', 'NED', 'Air University', 'Other'],
    default: 'UMT Lahore',
  },
  gpa: {
    type: Number,
    min: 0,
    max: 4.0,
  },
  hideGpa: {
    type: Boolean,
    default: true, // WorkNest Low-GPA Shield active by default
  },
  verifiedPortfolioScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  skills: {
    type: [String],
    default: [],
  },
  wallet: {
    pkrBalance: {
      type: Number,
      default: 0,
    },
    usdBalance: {
      type: Number,
      default: 0,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save password hashing hook
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper instance method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
