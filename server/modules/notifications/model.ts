import mongoose, { Schema, type Types } from 'mongoose';

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, default: '' },
  link: { type: String, default: '' },
  readAt: Date,
  createdAt: { type: Date, default: Date.now },
});
NotificationSchema.index({ userId: 1, createdAt: -1 });
// Old notifications clean themselves up after 90 days.
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const NotificationModel = mongoose.model('Notification', NotificationSchema);

type Id = Types.ObjectId | string;

export async function notify(userIds: Id | Id[], n: { title: string; body?: string; link?: string }) {
  const ids = Array.isArray(userIds) ? userIds : [userIds];
  if (ids.length === 0) return;
  await NotificationModel.insertMany(ids.map((userId) => ({ userId, ...n })));
}
