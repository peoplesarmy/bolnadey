// src/app/api/comments/route.js
import { connectDB } from '@/lib/mongodb';
import Comment from '@/models/Comment';
import Article from '@/models/Article';
import Project from '@/models/Project';
import { getSession } from '@/lib/auth';
import { apiRes, apiErr } from '@/lib/utils';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return apiErr('Sign in to comment', 401);

    await connectDB();
    const { content, refType, refId } = await request.json();
    if (!content || !refType || !refId) return apiErr('Missing fields');

    const comment = await Comment.create({
      content, refType, refId,
      author: session.user.id,
    });
    await comment.populate('author', 'name avatar');

    // bump count on parent
    const Model = refType === 'Article' ? Article : Project;
    await Model.findByIdAndUpdate(refId, { $inc: { commentsCount: 1 } });

    return apiRes({ comment }, 201);
  } catch (err) {
    return apiErr(err.message, 500);
  }
}
