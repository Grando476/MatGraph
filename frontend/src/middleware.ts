import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

const isLocalAuth = () => {
  const provider = process.env.NEXT_PUBLIC_AUTH_PROVIDER;
  if (provider === 'local') return true;
  if (provider === 'supabase') return false;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !supabaseUrl || supabaseUrl.includes('placeholder.supabase.co');
};

export async function middleware(request: NextRequest) {
  if (isLocalAuth()) {
    const isProtectedPath = ['/profile'].some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );
    const token = request.cookies.get('auth_token')?.value;

    if (!token && isProtectedPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
