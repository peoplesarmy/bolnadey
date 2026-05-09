// src/app/api/articles/[id]/route.js
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { getSession } from '@/lib/auth';
import { makeSlug, readTime, apiRes, apiErr } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const query = id.length === 24 ? { _id: id } : { slug: id };
    const article = await Article.findOne(query).populate('author', 'name avatar role bio').populate('reviewedBy', 'name role').lean();
    if (!article) return apiErr('Article not found', 404);

    // Increment views
    await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

    const comments = await Comment.find({ refType: 'Article', refId: article._id, isApproved: true })
      .populate('author', 'name avatar role').sort({ createdAt: -1 }).limit(50).lean();

    return apiRes({ article, comments });
  } catch (err) { return apiErr(err.message, 500); }
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session?.user) return apiErr('Unauthorised', 401);

  try {
    await connectDB();
    const article = await Article.findById(params.id);
    if (!article) return apiErr('Not found', 404);

    const userRole = session.user.role;
    const isOwner  = article.author.toString() === session.user.id;
    const canEdit  = ['senior_editor', 'super_admin'].includes(userRole);
    const canReview= ['senior_editor', 'super_admin'].includes(userRole);

    if (!isOwner && !canEdit) return apiErr('Forbidden', 403);

    const body = await request.json();

    // REVIEW action — approve or reject
    if (body.action === 'review') {
      if (!canReview) return apiErr('Only senior editors can review articles', 403);
      const { reviewStatus, reviewNote } = body;
      if (!['published', 'rejected'].includes(reviewStatus))
        return apiErr('reviewStatus must be published or rejected', 400);

      const updated = await Article.findByIdAndUpdate(params.id, {
        status:     reviewStatus,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNote: reviewNote || '',
      }, { new: true }).populate('author', 'name email').populate('reviewedBy', 'name');

      return apiRes({
        article: updated,
        message: reviewStatus === 'published' ? 'Article published!' : 'Article rejected.',
      });
    }

    // Normal edit
    const updateData = {};
    const allowed = ['title','excerpt','content','category','tags','coverImage','featured'];
    allowed.forEach(f => { if (body[f] !== undefined) updateData[f] = body[f]; });
    if (body.title) { updateData.slug = makeSlug(body.title); updateData.readTime = readTime(body.content || article.content); }

    // Only editors can change status
    if (body.status && canEdit) updateData.status = body.status;

    const updated = await Article.findByIdAndUpdate(params.id, updateData, { new: true });
    return apiRes({ article: updated });
  } catch (err) { return apiErr(err.message, 500); }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session?.user) return apiErr('Unauthorised', 401);

  try {
    await connectDB();
    const article = await Article.findById(params.id);
    if (!article) return apiErr('Not found', 404);

    const isOwner = article.author.toString() === session.user.id;
    const canDelete = ['senior_editor', 'super_admin'].includes(session.user.role);
    if (!isOwner && !canDelete) return apiErr('Forbidden', 403);

    await Promise.all([
      Article.findByIdAndDelete(params.id),
      Comment.deleteMany({ refType: 'Article', refId: params.id }),
    ]);
    return apiRes({ message: 'Article deleted' });
  } catch (err) { return apiErr(err.message, 500); }
}
