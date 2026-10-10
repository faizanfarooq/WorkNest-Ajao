import express, { type Response } from 'express';
import { dbStore } from '../db.ts';
import { protect, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

/**
 * @route   GET /api/chat/conversation/:recipientId
 * @desc    Get chat history between logged in user and recipient
 * @access  Private
 */
router.get('/conversation/:recipientId', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUserId = String(req.user._id);
    const recipientId = String(req.params.recipientId);

    const recipient = await dbStore.findUserById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user not found.',
      });
    }

    const messages = await dbStore.findMessagesBetween(currentUserId, recipientId);

    // Mark messages sent by recipient to current user as read
    await dbStore.markMessagesAsRead(recipientId, currentUserId);

    return res.status(200).json({
      success: true,
      recipient: {
        _id: recipient._id,
        name: recipient.name,
        role: recipient.role,
        startupName: recipient.startupName,
        city: recipient.city,
      },
      count: messages.length,
      data: messages,
    });
  } catch (error: any) {
    console.error('Chat history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversation history.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/chat/send
 * @desc    Send a message to a candidate or founder
 * @access  Private
 */
router.post('/send', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { receiverId, text } = req.body;

    if (!receiverId || !text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and text are required.',
      });
    }

    const receiver = await dbStore.findUserById(String(receiverId));
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver user does not exist.',
      });
    }

    const newMessage = await dbStore.createMessage({
      senderId: req.user._id,
      receiverId: receiver._id,
      text: text.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: newMessage,
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send chat message.',
      error: error.message,
    });
  }
});

export default router;
