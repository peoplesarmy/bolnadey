// src/app/api/votes/route.js
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import Project from '@/models/Project';
import Report from '@/models/Report';
import { getSession } from '@/lib/auth';
import { apiRes, apiErr } from '@/lib/utils';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return apiErr('Sign in to vote', 401);

    await connectDB();
    const { refType, refId, action } = await request.json();
    // action: 'clap' | 'fire' | 'angry' | 'heart' | 'up' | 'down'

    let updated;
    if (refType === 'Article') {
      const field = `reactions.${action}`;
      updated = await Article.findByIdAndUpdate(refId, { $inc: { [field]: 1 } }, { new: true });
    } else if (refType === 'Project') {
      const field = action === 'up' ? 'upvotes' : 'downvotes';
      updated = await Project.findByIdAndUpdate(refId, { $inc: { [field]: 1 } }, { new: true });
    } else if (refType === 'Report') {
      updated = await Report.findByIdAndUpdate(refId, { $inc: { upvotes: 1 } }, { new: true });
    }

    return apiRes({ success: true, updated });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}
