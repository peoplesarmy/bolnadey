// src/app/api/seed/route.js
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Article from '@/models/Article';
import Project from '@/models/Project';
import Report from '@/models/Report';
import { makeSlug, apiRes, apiErr } from '@/lib/utils';

export async function POST(request) {
  if (process.env.NODE_ENV === 'production') {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('secret') !== process.env.SEED_SECRET)
      return apiErr('Forbidden', 403);
  }
  try {
    await connectDB();
    await Promise.all([User.deleteMany({}), Article.deleteMany({}), Project.deleteMany({}), Report.deleteMany({})]);

    // ── SUPER ADMIN ──────────────────────────────────────
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@bolnadey.np',
      password: 'SuperAdmin@2025',
      role: 'super_admin',
      adminPin: '123456',
      bio: 'Platform super administrator with full system access.',
      isVerified: true,
    });

    // ── SENIOR EDITOR ─────────────────────────────────────
    const editor = await User.create({
      name: 'Priya Sharma',
      email: 'editor@bolnadey.np',
      password: 'Editor@2025',
      role: 'senior_editor',
      adminPin: '654321',
      bio: 'Senior investigative journalist covering corruption and governance in Nepal.',
      isVerified: true,
      articlesCount: 12,
    });

    // ── REPORTERS ─────────────────────────────────────────
    const reporter1 = await User.create({
      name: 'Raj Kumar',
      email: 'raj@bolnadey.np',
      password: 'Reporter@2025',
      role: 'reporter',
      bio: 'Political correspondent based in Kathmandu.',
      isVerified: true,
      articlesCount: 4,
    });

    const reporter2 = await User.create({
      name: 'Anita Thapa',
      email: 'anita@bolnadey.np',
      password: 'Reporter@2025',
      role: 'reporter',
      bio: 'Local issues and community reporter from Lalitpur.',
      isVerified: false,
      articlesCount: 1,
    });

    // ── READER ────────────────────────────────────────────
    await User.create({
      name: 'Binita Gurung',
      email: 'reader@bolnadey.np',
      password: 'Reader@2025',
      role: 'reader',
    });

    // ── ARTICLES ──────────────────────────────────────────
    const articles = [
      {
        title: 'Rs. 2.4 Billion Road Fund: Where Did The Money Go?',
        excerpt: 'A three-month investigation exposes systematic misappropriation of public infrastructure funds.',
        content: `<p>When the Department of Roads announced a Rs. 2.4 billion budget for the Kathmandu Metro Road Expansion Project in 2021, citizens were promised wider roads by 2023.</p><p>Three years later, the roads remain half-built and a substantial portion of the funds has vanished.</p><h2>The Paper Trail</h2><p>We obtained 847 pages of procurement documents through RTI requests. Three companies received Rs. 1.8 billion in contracts — all sharing a registered address in Lalitpur, linked to sitting ministers.</p><blockquote>"We received full payment for Phase 3 in December 2022 — but we hadn't even completed Phase 1."</blockquote>`,
        category: 'Investigation', status: 'published', featured: true,
        views: 3421, reactions: { clap: 241, fire: 187, angry: 432, heart: 98 },
        commentsCount: 48, readTime: 14, author: editor._id,
        reviewedBy: editor._id,
      },
      {
        title: 'Cabinet Reshuffle Signals Shift in Coalition Dynamics',
        excerpt: 'Three key portfolios change hands as PM moves to consolidate power ahead of budget session.',
        content: `<p>In a surprise move late Thursday, three cabinet ministers resigned paving the way for a significant reshuffle that political analysts say reflects PM's attempt to tighten coalition discipline.</p>`,
        category: 'Politics', status: 'published',
        views: 1822, reactions: { clap: 89, fire: 45, angry: 120, heart: 12 },
        readTime: 6, author: reporter1._id, reviewedBy: editor._id,
      },
      {
        title: 'Melamchi Water Crisis: The Full Timeline',
        excerpt: 'Citizens have been waiting for clean water since 2019. Every promise broken.',
        content: `<p>The Melamchi Water Supply Project has become a symbol of everything wrong with Nepal's infrastructure delivery. Budgeted at Rs. 12.8 billion, it was supposed to supply water to 180,000 households by 2019. Six years later, most are still waiting.</p>`,
        category: 'Local Issues', status: 'published',
        views: 2100, reactions: { clap: 180, fire: 220, angry: 550, heart: 75 },
        readTime: 9, author: reporter1._id, reviewedBy: editor._id,
      },
      {
        title: 'Why Young Nepalis Must Vote',
        excerpt: 'With another election approaching, our generation cannot afford to stay home.',
        content: `<p>Every election cycle, the same conversation repeats. Young people complain about the options. And yet turnout among 18-30 year olds remains Nepal's weakest demographic. This needs to change.</p>`,
        category: 'Opinion', status: 'published',
        views: 980, reactions: { clap: 67, fire: 34, angry: 12, heart: 89 },
        readTime: 5, author: reporter2._id, reviewedBy: editor._id,
      },
      {
        title: 'The Phantom Clinics of Province 2',
        excerpt: 'Health ministry data shows 23 fully-funded clinics that exist only on paper.',
        content: `<p>A new investigation reveals that 23 health clinics across Province 2 received full construction funding but were never actually built. The money — over Rs. 460 million — cannot be accounted for.</p>`,
        category: 'Investigation', status: 'pending',
        views: 0, readTime: 11, author: reporter2._id,
      },
    ];

    for (const a of articles) {
      await Article.create({ ...a, slug: makeSlug(a.title) });
    }

    // ── PROJECTS ──────────────────────────────────────────
    await Project.create([
      { title: 'Kathmandu Ring Road Expansion – Phase 3', description: 'Widening of the outer ring road from 2 to 4 lanes across 24km. Three deadlines missed.', location: 'Kathmandu', district: 'Kathmandu', category: 'Infrastructure', status: 'Delayed', budget: 420000000, spent: 145000000, progress: 34, contractor: 'Metro Roads Ltd', ministry: 'Dept of Roads', startDate: new Date('2022-01-01'), endDate: new Date('2026-12-31'), upvotes: 24, downvotes: 6, addedBy: superAdmin._id },
      { title: 'Melamchi Water Supply Distribution Network', description: 'Distribution pipes to 180,000 households. Main tunnel complete; distribution 61% done.', location: 'Kathmandu Valley', district: 'Kathmandu', category: 'Water', status: 'Ongoing', budget: 1280000000, spent: 780000000, progress: 61, ministry: 'Dept of Water Supply', startDate: new Date('2019-01-01'), endDate: new Date('2025-12-31'), upvotes: 45, downvotes: 8, addedBy: superAdmin._id },
      { title: '50 New Public Schools – Province 3', description: '50 new school buildings serving ~28,000 students in underserved areas.', location: 'Bagmati Province', district: 'Various', category: 'Education', status: 'Completed', budget: 110000000, spent: 108000000, progress: 100, ministry: 'Dept of Education', startDate: new Date('2021-01-01'), endDate: new Date('2024-06-30'), upvotes: 88, downvotes: 4, addedBy: superAdmin._id },
      { title: 'Rural Electrification – Dolakha District', description: 'Grid extension to 47 VDCs targeting 12,000 unelectrified households.', location: 'Dolakha', district: 'Dolakha', category: 'Energy', status: 'Planned', budget: 68000000, spent: 0, progress: 0, ministry: 'Nepal Electricity Authority', startDate: new Date('2025-07-01'), endDate: new Date('2027-06-30'), upvotes: 12, downvotes: 0, addedBy: editor._id },
      { title: 'Bagmati Corridor Bridge Construction', description: 'Three new bridges over the Bagmati River. Work stopped 3 months with no explanation.', location: 'Lalitpur–Kathmandu', district: 'Lalitpur', category: 'Infrastructure', status: 'Ongoing', budget: 89000000, spent: 39000000, progress: 44, ministry: 'Dept of Roads', startDate: new Date('2023-01-01'), endDate: new Date('2026-06-30'), upvotes: 31, downvotes: 9, addedBy: editor._id },
    ]);

    // ── REPORTS ───────────────────────────────────────────
    await Report.create([
      { title: 'Broken streetlights on Baneshwor Ring Road', description: '16 streetlights broken for 3 months. Road is dangerous at night.', type: 'Infrastructure', status: 'Action Taken', district: 'Kathmandu', location: 'Baneshwor, Ward 10', submittedBy: reporter1._id, isPublic: true },
      { title: 'Water pipeline leak near Patan Hospital', description: 'Large pipeline leak causing flooding and wasting water.', type: 'Infrastructure', status: 'Under Review', district: 'Lalitpur', submittedBy: reporter2._id, isPublic: true },
      { title: 'Illegal construction on public land in Bhaktapur', description: 'Construction on public park land near Ward 5.', type: 'Corruption', status: 'Submitted', district: 'Bhaktapur', submittedBy: reporter1._id, isPublic: true },
    ]);

    return apiRes({
      message: '✅ Database seeded!',
      accounts: {
        super_admin:   { email: 'superadmin@bolnadey.np', password: 'SuperAdmin@2025', adminPin: '123456' },
        senior_editor: { email: 'editor@bolnadey.np',     password: 'Editor@2025',     adminPin: '654321' },
        reporter1:     { email: 'raj@bolnadey.np',        password: 'Reporter@2025',   note: 'No admin PIN' },
        reporter2:     { email: 'anita@bolnadey.np',      password: 'Reporter@2025',   note: 'Unverified reporter' },
        reader:        { email: 'reader@bolnadey.np',     password: 'Reader@2025',     note: 'Basic reader' },
      },
    });
  } catch (err) {
    return apiErr(err.message, 500);
  }
}
