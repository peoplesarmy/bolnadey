// src/lib/auth-options.js
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
          if (!user || !user.isActive) return null;
          const valid = await user.comparePassword(credentials.password);
          if (!valid) return null;
          return {
            id:            user._id.toString(),
            name:          user.name,
            email:         user.email,
            role:          user.role,
            avatar:        user.avatar,
            adminVerified: false, // requires 2nd factor for admin panel
          };
        } catch (err) {
          console.error('Auth error:', err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id            = user.id;
        token.role          = user.role;
        token.avatar        = user.avatar;
        token.adminVerified = false;
      }
      // Allow updating adminVerified via update()
      if (trigger === 'update' && session?.adminVerified !== undefined) {
        token.adminVerified = session.adminVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id            = token.id;
        session.user.role          = token.role;
        session.user.avatar        = token.avatar;
        session.user.adminVerified = token.adminVerified ?? false;
      }
      return session;
    },
  },
  pages: { signIn: '/login', error: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
