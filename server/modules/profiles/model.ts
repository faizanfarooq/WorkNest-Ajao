import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const StudentProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, default: '' },
    university: { type: String, default: '' },
    degree: { type: String, default: '' },
    graduationYear: Number,
    city: { type: String, default: '' },
    bio: { type: String, default: '' },
    skills: { type: [String], default: [], index: true },
    gpa: { type: Number, min: 0, max: 4 },
    hideGpa: { type: Boolean, default: true },
    links: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },
    resume: {
      fileId: Schema.Types.ObjectId,
      fileName: String,
      size: Number,
      uploadedAt: Date,
    },
  },
  { timestamps: true },
);

export type StudentProfile = InferSchemaType<typeof StudentProfileSchema>;
export const StudentProfileModel = mongoose.model('StudentProfile', StudentProfileSchema);
