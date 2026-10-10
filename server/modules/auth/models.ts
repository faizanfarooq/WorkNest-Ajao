import mongoose, { Schema, type InferSchemaType, type HydratedDocument } from 'mongoose';
import { ROLES } from '../../../shared/schemas.ts';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    passwordResetHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof UserSchema>;
export type UserDoc = HydratedDocument<User>;
export const UserModel = mongoose.model('User', UserSchema);

const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
});
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshTokenModel = mongoose.model('RefreshToken', RefreshTokenSchema);
