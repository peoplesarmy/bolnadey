// src/models/Comment.js
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content:    { type: String, required: true, trim: true, maxlength: 2000 },
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  refType:    { type: String, required: true, enum: ['Article', 'Project', 'Report'] },
  refId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likes:      { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

CommentSchema.index({ refType: 1, refId: 1, createdAt: -1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
