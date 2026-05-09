// src/lib/utils.js
import slugify from 'slugify';
import { formatDistanceToNow } from 'date-fns';

export function makeSlug(title) {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function readTime(content = '') {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function apiRes(data, status = 200) {
  return Response.json(data, { status });
}

export function apiErr(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export const CATEGORIES = ['Politics', 'Governance', 'Local Issues', 'Opinion', 'Investigation', 'Environment', 'Health', 'Education'];
export const PROJECT_STATUSES = ['Planned', 'Ongoing', 'Completed', 'Delayed'];
export const REPORT_TYPES = ['Corruption', 'Infrastructure', 'Public Service', 'Environment', 'Safety', 'Other'];
export const REPORT_STATUSES = ['Submitted', 'Under Review', 'Action Taken', 'Closed'];
