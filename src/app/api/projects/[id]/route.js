// src/app/api/projects/[id]/route.js
import { connectDB } from '@/lib/mongodb';
import Project, { calcStatus } from '@/models/Project';
import Comment from '@/models/Comment';
import { getSession } from '@/lib/auth';
import { apiRes, apiErr } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const project = await Project.findById(params.id)
      .populate('addedBy',   'name avatar role')
      .populate('updatedBy', 'name')
      .lean();
    if (!project) return apiErr('Project not found', 404);

    // Live status
    project.status = calcStatus(project.progress, project.startDate, project.endDate);

    const comments = await Comment.find({ refType: 'Project', refId: params.id, isApproved: true })
      .populate('author', 'name avatar role')
      .sort({ createdAt: -1 }).limit(30).lean();

    return apiRes({ project, comments });
  } catch (err) { return apiErr(err.message, 500); }
}

export async function PUT(request, { params }) {
  const session = await getSession();
  if (!session?.user) return apiErr('Unauthorised', 401);

  try {
    await connectDB();
    const body = await request.json();

    // Vote action — any logged-in user
    if (body.action === 'vote') {
      const dir = body.direction;
      if (!['up','down'].includes(dir)) return apiErr('direction must be up or down', 400);
      const inc = dir === 'up' ? { upvotes: 1 } : { downvotes: 1 };
      const p = await Project.findByIdAndUpdate(params.id, { $inc: inc }, { new: true }).lean();
      p.status = calcStatus(p.progress, p.startDate, p.endDate);
      return apiRes({ project: p });
    }

    // Edit — only super_admin or senior_editor
    const allowed = ['super_admin', 'senior_editor'];
    if (!allowed.includes(session.user.role)) return apiErr('Only Super Admin or Senior Editor can edit projects', 403);

    const project = await Project.findById(params.id);
    if (!project) return apiErr('Not found', 404);

    const fields = ['title','description','location','district','category','budget','spent','progress','startDate','endDate','contractor','ministry'];
    fields.forEach(f => { if (body[f] !== undefined) project[f] = body[f]; });
    project.updatedBy = session.user.id;

    // Status auto-recalculated in pre-save
    await project.save();

    return apiRes({ project, message: `Project updated! Status: ${project.status}` });
  } catch (err) { return apiErr(err.message, 500); }
}

export async function DELETE(request, { params }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== 'super_admin')
    return apiErr('Only Super Admin can delete projects', 403);

  try {
    await connectDB();
    await Promise.all([
      Project.findByIdAndDelete(params.id),
      Comment.deleteMany({ refType: 'Project', refId: params.id }),
    ]);
    return apiRes({ message: 'Project deleted' });
  } catch (err) { return apiErr(err.message, 500); }
}
