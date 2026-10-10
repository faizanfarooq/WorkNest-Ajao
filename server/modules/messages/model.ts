import mongoose, { Schema } from 'mongoose';

// One conversation per application: the student on one side, the hiring company on the other.
const ConversationSchema = new Schema(
  {
    applicationId: { type: Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: '' },
    unreadForStudent: { type: Number, default: 0 },
    unreadForCompany: { type: Number, default: 0 },
  },
  { timestamps: true },
);
ConversationSchema.index({ studentId: 1, lastMessageAt: -1 });
ConversationSchema.index({ companyId: 1, lastMessageAt: -1 });

export const ConversationModel = mongoose.model('Conversation', ConversationSchema);

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  side: { type: String, enum: ['student', 'company'], required: true },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = mongoose.model('Message', MessageSchema);
