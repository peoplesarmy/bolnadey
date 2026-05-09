// src/app/api/reports/route.js
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { getSession } from '@/lib/auth';
import { isValidDistrict } from '@/lib/nepal-districts';
import { apiRes, apiErr } from '@/lib/utils';

export async function GET(request) {
  try {
    const session = await getSession();
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit  = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status');
    const type   = searchParams.get('type');
    const mine   = searchParams.get('mine');
    const district = searchParams.get('district');

    const query = { isPublic: true };
    if (status)   query.status   = status;
    if (type)     query.type     = type;
    if (district) query.district = new RegExp(`^${district}$`, 'i');
    if (mine && session?.user) query.submittedBy = session.user.id;

    // Editors/admins see all (including private)
    if (session?.user && ['senior_editor','super_admin'].includes(session.user.role))
      delete query.isPublic;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('submittedBy', 'name avatar role')
        .populate('resolvedBy',  'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Report.countDocuments(query),
    ]);

    return apiRes({ reports, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { return apiErr(err.message, 500); }
}

export async function POST(request) {
  // Must be logged in — any role
  const session = await getSession();
  if (!session?.user) return apiErr('You must be signed in to submit a report', 401);

  try {
    await connectDB();
    const body = await request.json();
    const { title, description, type, district, location, isAnonymous } = body;

    // Basic required fields
    if (!title?.trim())       return apiErr('Report title is required', 400);
    if (!description?.trim()) return apiErr('Description is required', 400);
    if (!type)                return apiErr('Report type is required', 400);
    if (!district?.trim())    return apiErr('District is required', 400);

    if (description.trim().length < 20)
      return apiErr('Description must be at least 20 characters', 400);

    // Validate district against all 77 Nepal districts
    if (!isValidDistrict(district))
      return apiErr(`"${district}" is not a valid district of Nepal. Please enter one of the 77 official districts.`, 400);

    const report = await Report.create({
      title:       title.trim(),
      description: description.trim(),
      type,
      district:    district.trim(),
      location:    location?.trim() || '',
      isAnonymous: Boolean(isAnonymous),
      isPublic:    true,
      submittedBy: session.user.id,
    });

    return apiRes({ report, message: 'Report submitted successfully! We will review it within 24 hours.' }, 201);
  } catch (err) {
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join('. ');
      return apiErr(msg, 400);
    }
    return apiErr(err.message, 500);
  }
}
