import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const isAuth = !!token

    // 1. Enforce registration completion for authenticated users
    // If user is logged in but has no username (incomplete registration)
    if (isAuth && !token.username) {
      // Allow access to register page, api routes, and static assets (handled by matcher mostly)
      if (
        !path.startsWith('/register') &&
        !path.startsWith('/google-register') &&
        !path.startsWith('/api') &&
        !path.startsWith('/_next')
      ) {
        return NextResponse.redirect(new URL('/register', req.url))
      }
    }

    // 2. Protect private routes for unauthenticated users
    if (!isAuth) {
      if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
        let from = path
        if (req.nextUrl.search) {
          from += req.nextUrl.search
        }
        return NextResponse.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(from)}`, req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Return true to allow the middleware function to execute for all matched paths
      // We handle the actual protection logic inside the middleware function above
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - public files (images, etc - though best to use _next/static or explicit checking)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
