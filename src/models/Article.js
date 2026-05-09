// src/models/Article.js
import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  slug:     { type: String, required: true, unique: true },
  excerpt:  { type: String, required: true, maxlength: 300 },
  content:  { type: String, required: true },
  category: { type: String, required: true, enum: ['Politics','Governance','Investigation','Local Issues','Environment','Education','Health','Economy','Opinion'] },
  tags:     [{ type: String, lowercase: true, trim: true }],
  coverImage: { type: String, default: '' },

  author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Status workflow: reporter submits → pending → senior_editor reviews → published/rejected
  status:   { type: String, enum: ['draft','pending','published','rejected','archived'], default: 'draft' },

  // Review tracking
  reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:   { type: Date, default: null },
  reviewNote:   { type: String, default: '' }, // rejection reason or editor note

  featured: { type: Boolean, default: false },
  views:    { type: Number, default: 0 },
  readTime: { type: Number, default: 5 },

  reactions: {
    clap:  { type: Number, default: 0 },
    fire:  { type: Number, default: 0 },
    angry: { type: Number, default: 0 },
    heart: { type: Number, default: 0 },
  },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true });

ArticleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ status: 1, category: 1 });
ArticleSchema.index({ author: 1 });

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
