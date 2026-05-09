// src/app/api/users/[id]/route.js
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Article from '@/models/Article';
import { getSession } from '@/lib/auth';
import { apiRes, apiErr } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await User.findById(params.id).select('-password').lean();
    if (!user) return apiErr('Not found', 404);

    const articles = await Article.find({ author: params.id, status: 'published' })
      .sort({ createdAt: -1 }).limit(10).lean();

    return apiRes({ user, articles });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return apiErr('Unauthorized', 401);
    if (session.user.id !== params.id && session.user.role !== 'admin')
      return apiErr('Forbidden', 403);

    await connectDB();
    const { name, bio, location, website, avatar } = await request.json();
    const updated = await User.findByIdAndUpdate(
      params.id,
      { name, bio, location, website, avatar },
      { new: true }
    ).select('-password');

    return apiRes({ user: updated });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}

// Admin only — change role / suspend
export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') return apiErr('Forbidden', 403);

    await connectDB();
    const body = await request.json();
    const allowed = {};
    if (body.role)     allowed.role     = body.role;
    if (body.isActive !== undefined) allowed.isActive = body.isActive;

    const updated = await User.findByIdAndUpdate(params.id, allowed, { new: true }).select('-password');
    return apiRes({ user: updated });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}
