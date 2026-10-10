const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  amountPkr: {
    type: Number,
    default: 0,
  },
  amountUsd: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'In Review', 'Released'],
    default: 'Pending',
  },
  completedAt: {
    type: Date,
  },
  receiptRef: {
    type: String,
  },
});

const InternshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  startupName: {
    type: String,
    required: [true, 'Startup name is required'],
  },
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  city: {
    type: String,
    default: 'Lahore',
  },
  area: {
    type: String,
    default: 'Johar Town',
  },
  isRemoteUsd: {
    type: Boolean,
    default: false,
  },
  stipendPkr: {
    type: Number,
    default: 45000,
  },
  stipendUsd: {
    type: Number,
    default: 0,
  },
  durationWeeks: {
    type: Number,
    default: 4,
  },
  techStack: {
    type: [String],
    default: [],
  },
  type: {
    type: String,
    enum: ['Full Internship', '3-Day Micro-Task'],
    default: 'Full Internship',
  },
  milestones: {
    type: [MilestoneSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Internship', InternshipSchema);
