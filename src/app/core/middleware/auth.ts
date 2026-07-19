import { jwtDecode } from 'jwt-decode';
import { JWT } from 'libs/models';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function authMiddleware(request: NextRequest) {
    const session = request.cookies.get('steve-session')?.value;

    const authRoutes = ['/auth/login', '/auth/verify'];
    const protectedRoutes = ['/dashboard'];

    const { nextUrl } = request;
    const nextResponse = NextResponse.next();

    const signInRoute = request.nextUrl.clone();

    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isProtectedRoute = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));

    if (!session) {
        if (isProtectedRoute) {
            const callbackUrl = encodeURIComponent(nextUrl.pathname);
            signInRoute.pathname = '/auth/login';

            return NextResponse.redirect(`${signInRoute}?callbackUrl=${callbackUrl}`);
        } else {
            return nextResponse;
        }
    }

    try {
        // const parsed = (await decryptSession(session as string)) as unknown as UserResponse;
        const parsed = jwtDecode<JWT>(session);
        const now = Date.now();
        const bufferMs = 30 * 1000;
        const accessExpired = parsed.exp * 1000 < now - bufferMs;

        if (!accessExpired && isAuthRoute) {
            const dashboardRoute = request.nextUrl.clone();
            dashboardRoute.pathname = '/dashboard';

            return NextResponse.redirect(dashboardRoute);
        }

        if (accessExpired) {
            const cookieStore = await cookies();

            cookieStore.delete('steve-session');

            signInRoute.pathname = '/auth/login';
            return NextResponse.redirect(signInRoute);
        }
    } catch {
        return NextResponse.redirect(`${signInRoute}`);
    }

    return nextResponse;
}
