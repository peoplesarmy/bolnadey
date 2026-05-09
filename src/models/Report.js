// src/models/Report.js
import mongoose from 'mongoose';
import { NEPAL_DISTRICTS } from '@/lib/nepal-districts';

const ReportSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  type: {
    type: String, required: true,
    enum: ['Corruption','Infrastructure','Public Service','Environment','Safety','Education','Health','Other'],
  },
  status: {
    type: String,
    enum: ['Submitted','Under Review','Action Taken','Closed','Rejected'],
    default: 'Submitted',
  },

  // District — must be one of Nepal's 77 official districts
  district: {
    type: String, required: true, trim: true,
    validate: {
      validator: function(v) {
        return NEPAL_DISTRICTS.map(d => d.toLowerCase()).includes(v?.toLowerCase());
      },
      message: props => `"${props.value}" is not a valid district of Nepal. Please enter one of the 77 official districts.`,
    },
  },

  location:    { type: String, default: '', trim: true },       // specific address / ward
  images:      [{ type: String }],
  isAnonymous: { type: Boolean, default: false },
  isPublic:    { type: Boolean, default: true },

  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminNotes:  { type: String, default: '' },
  resolvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt:  { type: Date, default: null },

  upvotes:     { type: Number, default: 0 },
}, { timestamps: true });

ReportSchema.index({ district: 1, status: 1 });
ReportSchema.index({ submittedBy: 1 });
ReportSchema.index({ type: 1 });

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
