import mongoose, { type Document, type Types } from 'mongoose';
const { Schema } = mongoose;

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  text: string;
  read: boolean;
  timestamp: Date;
}

export const MessageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
