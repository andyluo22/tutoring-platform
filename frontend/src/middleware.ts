// frontend/src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/dashboard/:path*', // protect /dashboard and anything under it
    '/api/:path*', // protect all API routes
  ],
};
