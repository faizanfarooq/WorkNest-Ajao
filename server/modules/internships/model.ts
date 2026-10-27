import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { CURRENCIES, INTERNSHIP_STATUSES, PAY_PERIODS, WORK_MODES } from '../../../shared/schemas.ts';

const InternshipSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    city: { type: String, default: '' },
    mode: { type: String, enum: WORK_MODES, required: true },
    paid: { type: Boolean, required: true },
    payAmount: { type: Number, default: 0 },
    payCurrency: { type: String, enum: CURRENCIES, default: 'PKR' },
    payPeriod: { type: String, enum: PAY_PERIODS, default: 'month' },
    // Normalised monthly PKR figure so "sort by pay" compares like with like.
    payMonthlyPkr: { type: Number, default: 0 },
    durationWeeks: { type: Number, required: true },
    openings: { type: Number, default: 1 },
    deadline: Date,
    questions: [{ prompt: { type: String, required: true }, required: { type: Boolean, default: true } }],
    status: { type: String, enum: INTERNSHIP_STATUSES, default: 'open' },
    publishedAt: Date,
    applicationCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

InternshipSchema.index(
  { title: 'text', skills: 'text', description: 'text' },
  { weights: { title: 10, skills: 5, description: 1 }, name: 'internship_text' },
);
InternshipSchema.index({ status: 1, publishedAt: -1 });
InternshipSchema.index({ status: 1, payMonthlyPkr: -1 });
InternshipSchema.index({ companyId: 1, status: 1 });
InternshipSchema.index({ skills: 1 });

export type Internship = InferSchemaType<typeof InternshipSchema>;
export const InternshipModel = mongoose.model('Internship', InternshipSchema);

const SavedInternshipSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
  createdAt: { type: Date, default: Date.now },
});
SavedInternshipSchema.index({ userId: 1, internshipId: 1 }, { unique: true });

export const SavedInternshipModel = mongoose.model('SavedInternship', SavedInternshipSchema);

/** A student's recent keyword searches. `qKey` is the lower-cased keyword, so "React" and "react" are one entry. */
const RecentSearchSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  q: { type: String, required: true },
  qKey: { type: String, required: true },
  city: { type: String, default: '' },
  usedAt: { type: Date, default: Date.now },
});
RecentSearchSchema.index({ userId: 1, qKey: 1, city: 1 }, { unique: true });
RecentSearchSchema.index({ userId: 1, usedAt: -1 });

export const RecentSearchModel = mongoose.model('RecentSearch', RecentSearchSchema);
