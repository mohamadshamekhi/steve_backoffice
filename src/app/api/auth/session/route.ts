import { jwtDecode } from 'jwt-decode';
import { JWT } from 'libs/models';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const encryptedSession = cookieStore.get('steve-session')?.value as string;

    if (!encryptedSession) {
        return NextResponse.json(
            {
                error: 'Session Not Found!'
            },
            {
                status: 401
            }
        );
    }

    // const session = await decryptSession(encryptedSession);
    const session = jwtDecode<JWT>(encryptedSession);
    return Response.json(session);
}
