// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },

  // 4 roles — clear hierarchy
  role: {
    type: String,
    enum: ['reader', 'reporter', 'senior_editor', 'super_admin'],
    default: 'reader',
  },

  // Admin panel double-auth PIN (hashed, only for senior_editor + super_admin)
  adminPin: { type: String, select: false, default: null },

  avatar:   { type: String, default: '' },
  bio:      { type: String, default: '', maxlength: 500 },
  location: { type: String, default: '' },
  website:  { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  // Reporter-specific
  articlesCount:  { type: Number, default: 0 },
  reportsCount:   { type: Number, default: 0 },
  pendingArticles:{ type: Number, default: 0 },

  // Verification
  isVerified:     { type: Boolean, default: false },
  verifiedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified('adminPin') && this.adminPin) {
    this.adminPin = await bcrypt.hash(this.adminPin, 10);
  }
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.compareAdminPin = async function (candidate) {
  if (!this.adminPin) return false;
  return bcrypt.compare(candidate, this.adminPin);
};

// Role helpers
UserSchema.methods.isAdmin   = function () { return this.role === 'super_admin'; };
UserSchema.methods.isEditor  = function () { return ['super_admin', 'senior_editor'].includes(this.role); };
UserSchema.methods.isReporter= function () { return ['super_admin', 'senior_editor', 'reporter'].includes(this.role); };
UserSchema.methods.canWrite  = function () { return ['super_admin', 'senior_editor', 'reporter'].includes(this.role); };

export default mongoose.models.User || mongoose.model('User', UserSchema);
