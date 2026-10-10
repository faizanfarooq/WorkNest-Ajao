import mongoose, { Schema, type InferSchemaType } from 'mongoose';
import { COMPANY_SIZES } from '../../../shared/schemas.ts';

const CompanySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String, default: '' },
    about: { type: String, default: '' },
    website: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    city: { type: String, default: '' },
    industry: { type: String, default: '' },
    size: { type: String, enum: COMPANY_SIZES, default: '1-10' },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    verified: { type: Boolean, default: false },
  },
  { timestamps: true },
);
CompanySchema.index({ name: 'text', industry: 'text' });

export type Company = InferSchemaType<typeof CompanySchema>;
export const CompanyModel = mongoose.model('Company', CompanySchema);
