// src/app/api/users/route.js  – register new user
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { apiRes, apiErr } from '@/lib/utils';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password } = await request.json();
    if (!name || !email || !password) return apiErr('All fields required');
    if (password.length < 8) return apiErr('Password must be at least 8 characters');

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return apiErr('Email already registered');

    const user = await User.create({ name, email, password });
    return apiRes({ user: { id: user._id, name: user.name, email: user.email, role: user.role } }, 201);
  } catch (err) {
    return apiErr(err.message, 500);
  }
}
