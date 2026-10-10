const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['candidate', 'founder', 'admin'],
    default: 'candidate',
  },
  phone: {
    type: String,
    default: '+923001234567',
  },
  city: {
    type: String,
    enum: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Peshawar', 'Remote'],
    default: 'Lahore',
  },
  university: {
    type: String,
    enum: ['UMT Lahore', 'FAST-NUCES', 'NUST', 'ITU', 'UET', 'COMSATS', 'NED', 'Air University', 'Other'],
  },
  gpa: {
    type: Number,
  },
  hideGpa: {
    type: Boolean,
    default: true, // WorkNest Low-GPA Shield active
  },
  verifiedPortfolioScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  skills: {
    type: [String],
    default: [],
  },
  wallet: {
    pkrBalance: { type: Number, default: 0 },
    usdBalance: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save password hashing
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password verification method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
