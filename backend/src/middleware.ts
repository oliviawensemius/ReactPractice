// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';

// Define which paths to protect
const protectedPaths = ['/profile', '/tutor', '/lecturer'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Get authentication status from cookie
    const user = request.cookies.get('user')?.value;
    
    // If not authenticated, redirect to login
    if (!user) {
      const url = new URL('/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(pathname));
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};