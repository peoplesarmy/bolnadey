// src/app/api/projects/route.js
import { connectDB } from '@/lib/mongodb';
import Project, { calcStatus } from '@/models/Project';
import { getSession } from '@/lib/auth';
import { apiRes, apiErr } from '@/lib/utils';

// Recalculate status on every GET so it always reflects today's date
function withLiveStatus(projects) {
  return projects.map(p => ({
    ...p,
    status: calcStatus(p.progress, p.startDate, p.endDate),
  }));
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page     = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit    = parseInt(searchParams.get('limit') || '20');
    const status   = searchParams.get('status');
    const category = searchParams.get('category');
    const district = searchParams.get('district');
    const search   = searchParams.get('q');

    const query = {};
    if (category) query.category = category;
    if (district) query.district = district;
    if (search)   query.$text    = { $search: search };

    const allProjects = await Project.find(query)
      .populate('addedBy',   'name avatar role')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Recalculate live status for every project
    const withStatus = withLiveStatus(allProjects);

    // Filter by status AFTER live recalculation
    const filtered = status ? withStatus.filter(p => p.status === status) : withStatus;

    // Paginate
    const total    = filtered.length;
    const projects = filtered.slice((page - 1) * limit, page * limit);

    // Live stats
    const stats = {
      Planned:   withStatus.filter(p => p.status === 'Planned').length,
      Ongoing:   withStatus.filter(p => p.status === 'Ongoing').length,
      Completed: withStatus.filter(p => p.status === 'Completed').length,
      Delayed:   withStatus.filter(p => p.status === 'Delayed').length,
      total:     withStatus.length,
    };

    return apiRes({ projects, total, page, pages: Math.ceil(total / limit), stats });
  } catch (err) { return apiErr(err.message, 500); }
}

export async function POST(request) {
  const session = await getSession();
  const allowed = ['super_admin', 'senior_editor'];
  if (!session?.user || !allowed.includes(session.user.role))
    return apiErr('Only Super Admin or Senior Editor can add projects', 403);

  try {
    await connectDB();
    const body = await request.json();
    const { title, description, location, district, category, budget, spent, progress, startDate, endDate, contractor, ministry } = body;

    if (!title || !location || !district || !category || !budget || !startDate || !endDate)
      return apiErr('title, location, district, category, budget, startDate, endDate are required', 400);

    if (new Date(endDate) <= new Date(startDate))
      return apiErr('End date must be after start date', 400);

    // Status auto-calculated in model pre-save
    const project = await Project.create({
      title, description: description || '', location, district, category,
      budget:    Number(budget),
      spent:     Number(spent || 0),
      progress:  Math.min(100, Math.max(0, Number(progress || 0))),
      startDate: new Date(startDate),
      endDate:   new Date(endDate),
      contractor:contractor || '',
      ministry:  ministry || '',
      addedBy:   session.user.id,
    });

    return apiRes({ project, message: `Project added! Status: ${project.status}` }, 201);
  } catch (err) { return apiErr(err.message, 500); }
}
