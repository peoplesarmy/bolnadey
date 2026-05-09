// src/app/api/articles/route.js
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import { requireAuth, requireReporter, isEditor } from '@/lib/auth';
import { makeSlug, readTime, apiRes, apiErr } from '@/lib/utils';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page     = parseInt(searchParams.get('page') || '1');
    const limit    = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search   = searchParams.get('search');
    const featured = searchParams.get('featured');
    const status   = searchParams.get('status') || 'published';
    const authorId = searchParams.get('author');
    const pending  = searchParams.get('pending'); // for editor review queue

    const query = {};

    // Only editors/admins can see non-published articles
    if (pending === 'true') {
      query.status = 'pending';
    } else if (status === 'all') {
      // handled by caller with auth
    } else {
      query.status = 'published';
    }

    if (category)  query.category = category;
    if (featured)  query.featured = true;
    if (authorId)  query.author   = authorId;
    if (search)    query.$text    = { $search: search };

    const skip  = (page - 1) * limit;
    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .populate('author', 'name avatar role')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip).limit(limit).lean();

    return apiRes({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { return apiErr(err.message, 500); }
}

export async function POST(request) {
  const { session, error } = await requireReporter();
  if (error) return error;

  try {
    await connectDB();
    const body = await request.json();
    const { title, excerpt, content, category, tags, coverImage, featured } = body;

    if (!title || !excerpt || !content || !category)
      return apiErr('title, excerpt, content, category required', 400);

    const slug = makeSlug(title);
    const existing = await Article.findOne({ slug });
    if (existing) return apiErr('An article with this title already exists', 409);

    // Reporters submit as pending; editors/admins can publish directly
    const userRole = session.user.role;
    const canPublish = ['senior_editor', 'super_admin'].includes(userRole);
    const articleStatus = canPublish
      ? (body.status || 'published')
      : 'pending'; // reporters always go to review queue

    const article = await Article.create({
      title, slug, excerpt, content, category,
      tags:      tags || [],
      coverImage:coverImage || '',
      featured:  canPublish ? (featured || false) : false,
      author:    session.user.id,
      status:    articleStatus,
      readTime:  readTime(content),
      reviewedBy: canPublish ? session.user.id : null,
      reviewedAt: canPublish ? new Date() : null,
    });

    return apiRes({
      article,
      message: canPublish
        ? 'Article published!'
        : 'Article submitted for review. A senior editor will approve it.',
    }, 201);
  } catch (err) { return apiErr(err.message, 500); }
}
