// src/app/api/auth/verify-pin/route.js
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const allowed = ['senior_editor', 'super_admin'];
  if (!allowed.includes(session.user.role))
    return NextResponse.json({ error: 'No admin PIN set for your role' }, { status: 403 });

  const { pin } = await req.json();
  if (!pin || !/^\d{6}$/.test(pin))
    return NextResponse.json({ error: 'PIN must be 6 digits' }, { status: 400 });

  await connectDB();
  const user = await User.findById(session.user.id).select('+adminPin');
  if (!user?.adminPin)
    return NextResponse.json({ error: 'No PIN set. Contact super admin.' }, { status: 400 });

  const match = await user.compareAdminPin(pin);
  if (!match) return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });

  return NextResponse.json({ success: true });
}
