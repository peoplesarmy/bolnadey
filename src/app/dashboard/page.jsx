// src/app/dashboard/page.jsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import Project from '@/models/Project';
import Report from '@/models/Report';
import User from '@/models/User';
import DashboardClient from './DashboardClient';

export const metadata = { title: 'Dashboard | Bolna Dey' };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Not logged in
  if (!session?.user) redirect('/login?reason=dashboard');

  // Wrong role
  const allowed = ['senior_editor', 'super_admin'];
  if (!allowed.includes(session.user.role)) redirect('/?reason=no-access');

  // 2FA not done
  if (!session.user.adminVerified) redirect('/admin-verify');

  await connectDB();

  const isSuperAdmin = session.user.role === 'super_admin';

  // Stats
  const [
    totalArticles, pendingArticles, publishedArticles,
    totalProjects, totalReports, openReports,
    totalUsers, reporters, readers,
  ] = await Promise.all([
    Article.countDocuments({}),
    Article.countDocuments({ status: 'pending' }),
    Article.countDocuments({ status: 'published' }),
    Project.countDocuments({}),
    Report.countDocuments({}),
    Report.countDocuments({ status: { $in: ['Submitted', 'Under Review'] } }),
    isSuperAdmin ? User.countDocuments({}) : 0,
    isSuperAdmin ? User.countDocuments({ role: 'reporter' }) : 0,
    isSuperAdmin ? User.countDocuments({ role: 'reader' }) : 0,
  ]);

  // Recent pending articles for editor review
  const pendingForReview = await Article.find({ status: 'pending' })
    .populate('author', 'name email avatar role')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Recent published
  const recentPublished = await Article.find({ status: 'published' })
    .populate('author', 'name role')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  // All reporters (for user management — super_admin only)
  const allReporters = isSuperAdmin
    ? await User.find({ role: { $in: ['reporter', 'senior_editor'] } })
        .select('-password -adminPin')
        .sort({ createdAt: -1 })
        .lean()
    : [];

  // Recent reports
  const recentReports = await Report.find({})
    .populate('submittedBy', 'name role')
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  // Recent projects
  const allProjects = await Project.find({})
    .populate('addedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const stats = {
    totalArticles, pendingArticles, publishedArticles,
    totalProjects, totalReports, openReports,
    totalUsers, reporters, readers,
  };

  return (
    <DashboardClient
      session={session}
      stats={stats}
      pendingForReview={JSON.parse(JSON.stringify(pendingForReview))}
      recentPublished={JSON.parse(JSON.stringify(recentPublished))}
      allReporters={JSON.parse(JSON.stringify(allReporters))}
      recentReports={JSON.parse(JSON.stringify(recentReports))}
      allProjects={JSON.parse(JSON.stringify(allProjects))}
    />
  );
}
