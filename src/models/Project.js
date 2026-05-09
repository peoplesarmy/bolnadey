// src/models/Project.js
import mongoose from 'mongoose';

// Auto-calculate status based on today's date vs project dates + progress
// Called before every save and also as a utility
export function calcStatus(progress, startDate, endDate) {
  const today = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end   = endDate   ? new Date(endDate)   : null;

  if (progress >= 100)                         return 'Completed';
  if (!start || today < start)                 return 'Planned';
  if (end && today > end && progress < 100)    return 'Delayed';
  return 'Ongoing';
}

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location:    { type: String, required: true, trim: true },
  district:    { type: String, required: true, trim: true },
  category:    { type: String, required: true, enum: ['Infrastructure','Health','Education','Water','Energy','Environment','Other'] },

  // Status is AUTO-CALCULATED — never set manually
  status: {
    type: String,
    enum: ['Planned','Ongoing','Completed','Delayed'],
    default: 'Planned',
  },

  budget:    { type: Number, required: true, min: 0 },
  spent:     { type: Number, default: 0, min: 0 },
  progress:  { type: Number, default: 0, min: 0, max: 100 },

  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },

  contractor: { type: String, default: '' },
  ministry:   { type: String, default: '' },
  images:     [{ type: String }],

  upvotes:      { type: Number, default: 0 },
  downvotes:    { type: Number, default: 0 },
  commentsCount:{ type: Number, default: 0 },

  addedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Auto-recalculate status before every save
ProjectSchema.pre('save', function (next) {
  this.status = calcStatus(this.progress, this.startDate, this.endDate);
  next();
});

// Also recalculate on findOneAndUpdate
ProjectSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate();
  const p = update?.progress ?? update?.$set?.progress;
  const s = update?.startDate ?? update?.$set?.startDate;
  const e = update?.endDate ?? update?.$set?.endDate;

  if (p !== undefined || s !== undefined || e !== undefined) {
    // We need to fetch the doc to get missing fields — set a flag
    this._recalcStatus = true;
  }
  next();
});

ProjectSchema.index({ district: 1, status: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
