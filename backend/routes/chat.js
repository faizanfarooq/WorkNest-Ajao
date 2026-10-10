const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

// GET /api/chat/conversation/:recipientId
router.get('/conversation/:recipientId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.recipientId },
        { senderId: req.params.recipientId, receiverId: req.user._id },
      ],
    }).sort({ timestamp: 1 });

    await Message.updateMany(
      { senderId: req.params.recipientId, receiverId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/chat/send
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      text,
    });
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
