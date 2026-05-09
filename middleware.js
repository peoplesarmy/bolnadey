// middleware.js (root)
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path  = req.nextUrl.pathname;

    // Admin panel — needs senior_editor or super_admin AND adminVerified (2FA)
    if (path.startsWith('/dashboard')) {
      const allowed = ['senior_editor', 'super_admin'];
      if (!token || !allowed.includes(token.role)) {
        return NextResponse.redirect(new URL('/login?reason=access', req.url));
      }
      // 2FA not yet verified — send to PIN page
      if (!token.adminVerified) {
        return NextResponse.redirect(new URL('/admin-verify', req.url));
      }
    }

    // Writing articles — reporter and above
    if (path.startsWith('/news/new')) {
      const allowed = ['reporter', 'senior_editor', 'super_admin'];
      if (!token || !allowed.includes(token.role)) {
        return NextResponse.redirect(new URL('/login?reason=reporter', req.url));
      }
    }

    // Reporter profile setup
    if (path.startsWith('/reporter')) {
      const allowed = ['reporter', 'senior_editor', 'super_admin'];
      if (!token || !allowed.includes(token.role)) {
        return NextResponse.redirect(new URL('/login?reason=reporter', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        const protectedPaths = ['/dashboard', '/news/new', '/reporter', '/admin-verify'];
        if (protectedPaths.some(p => path.startsWith(p))) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/news/new/:path*', '/reporter/:path*', '/admin-verify'],
};
