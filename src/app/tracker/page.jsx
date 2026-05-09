// src/app/tracker/page.jsx
import { connectDB } from '@/lib/mongodb';
import Project, { calcStatus } from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import Link from 'next/link';
import TrackerClient from './TrackerClient';

export const metadata = { title: 'Government Project Tracker | Bolna Dey' };

async function getData(searchParams) {
  try {
    await connectDB();
    const query = {};
    if (searchParams?.category) query.category = searchParams.category;
    if (searchParams?.district) query.district = searchParams.district;

    const allRaw = await Project.find(query)
      .populate('addedBy',   'name role')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Apply live status to every project
    const all = allRaw.map(p => ({
      ...p,
      status: calcStatus(p.progress, p.startDate, p.endDate),
    }));

    const statusFilter = searchParams?.status;
    const projects = statusFilter ? all.filter(p => p.status === statusFilter) : all;

    const stats = {
      total:     all.length,
      Planned:   all.filter(p => p.status === 'Planned').length,
      Ongoing:   all.filter(p => p.status === 'Ongoing').length,
      Completed: all.filter(p => p.status === 'Completed').length,
      Delayed:   all.filter(p => p.status === 'Delayed').length,
    };

    return { projects, stats };
  } catch { return { projects: [], stats: { total:0,Planned:0,Ongoing:0,Completed:0,Delayed:0 } }; }
}

export default async function TrackerPage({ searchParams }) {
  const { projects, stats } = await getData(searchParams);
  const session = await getServerSession(authOptions);
  const canManage = ['super_admin','senior_editor'].includes(session?.user?.role);

  return (
    <TrackerClient
      initialProjects={JSON.parse(JSON.stringify(projects))}
      stats={stats}
      canManage={canManage}
      session={session ? { name: session.user.name, role: session.user.role } : null}
    />
  );
}
