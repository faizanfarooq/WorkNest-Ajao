const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  internshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'Accepted', 'Rejected', 'Completed'],
    default: 'Applied',
  },
  githubRepoUrl: {
    type: String,
    trim: true,
  },
  submittedCode: {
    type: String,
  },
  aiAuditResult: {
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    cvBullets: { type: [String], default: [] },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Application', ApplicationSchema);
