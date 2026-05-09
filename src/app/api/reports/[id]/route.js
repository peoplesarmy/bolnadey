// src/app/api/reports/[id]/route.js
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { getSession } from '@/lib/auth';
import { apiRes, apiErr } from '@/lib/utils';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const report = await Report.findById(params.id).populate('submittedBy', 'name avatar').lean();
    if (!report) return apiErr('Not found', 404);
    return apiRes({ report });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !['admin', 'editor'].includes(session.user.role))
      return apiErr('Forbidden', 403);

    await connectDB();
    const body = await request.json();
    const updated = await Report.findByIdAndUpdate(params.id, body, { new: true });
    return apiRes({ report: updated });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') return apiErr('Forbidden', 403);
    await connectDB();
    await Report.findByIdAndDelete(params.id);
    return apiRes({ success: true });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}
