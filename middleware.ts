import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/change-password']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const userId = request.cookies.get('userId')?.value

  if (publicPaths.includes(pathname)) {
    if (pathname === '/login' && userId) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    if (pathname === '/change-password' && !userId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
