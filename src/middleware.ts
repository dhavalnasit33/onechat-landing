import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 2. If someone accesses /ai-chat or /ai-chat/*
  if (pathname === '/ai-chat' || pathname.startsWith('/ai-chat/')) {
    // Check if coming from authorized Flutter transition (cookie set when clicking from Flutter)
    const hasPromptCookie = request.cookies.has('chat_initial_prompt');
    const hasAuthPassCookie = request.cookies.has('chat_authorized_session');
    
    // Also check referrer (if transitioning from flutter app on same origin)
    const referer = request.headers.get('referer') || '';
    const isInternalTransition = 
      hasPromptCookie || 
      hasAuthPassCookie || 
      (referer.length > 0 && !referer.includes('/ai-chat'));

    // If a user directly types URL in address bar without internal transition:
    // Block direct access and redirect to home page!
    if (!isInternalTransition) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ai-chat/:path*', '/ai-chat',],
};
