import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { APPLICATION_STATUSES } from '../../../shared/schemas.ts';

const ApplicationSchema = new Schema(
  {
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'applied' },
    coverLetter: { type: String, default: '' },
    answers: [{ questionId: String, prompt: String, answer: String, _id: false }],
    // Snapshot so later resume edits don't change what the employer received.
    resume: { fileId: Schema.Types.ObjectId, fileName: String },
    history: [
      {
        status: { type: String, enum: APPLICATION_STATUSES },
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        note: String,
        _id: false,
      },
    ],
  },
  { timestamps: true },
);
ApplicationSchema.index({ internshipId: 1, studentId: 1 }, { unique: true });
ApplicationSchema.index({ studentId: 1, createdAt: -1 });
ApplicationSchema.index({ internshipId: 1, status: 1, createdAt: -1 });
ApplicationSchema.index({ companyId: 1, status: 1 });

export type Application = InferSchemaType<typeof ApplicationSchema>;
export const ApplicationModel = mongoose.model('Application', ApplicationSchema);
