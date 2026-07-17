import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ['/login', '/register', '/request-password-reset', '/reset-password'];
const adminRoutes = ['/admin'];
const userRoutes = ['/user'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth_token')?.value || null;

    let user: { role?: string } | null = null;
    if (token) {
        try {
            const userData = request.cookies.get('user_data')?.value;
            user = userData ? JSON.parse(userData) : null;
        } catch {
            user = null;
        }
    }

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    const isUserRoute = userRoutes.some(route => pathname.startsWith(route));
    
    if(!token && !isPublicRoute){
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if(token && user){
        if(isAdminRoute && user.role !== 'admin'){
            return NextResponse.redirect(new URL('/', request.url));
        }
        if(isUserRoute && user.role !== 'user' && user.role !=='admin'){
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    if(isPublicRoute && token) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}
export const config = {
    matcher: [
        // what routes to protect/match
        '/admin/:path*',
        '/user/:path*',
        '/login',
        '/register'
    ]
}