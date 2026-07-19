import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { UserResponse } from 'libs/models';
import { cookies } from 'next/headers';
const JWT_SECRET = 'lQ4cuOyVR2pP0Mo7jMG0qMW6k8BPDBLRyo9Ux1l0aFA=';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

export async function encryptSession(session: UserResponse) {
    return new SignJWT(session as unknown as JWTPayload).setProtectedHeader({ alg: 'HS256' }).sign(encodedKey);
}

export async function decryptSession(session: string) {
    const { payload } = await jwtVerify(session, encodedKey, {
        algorithms: ['HS256']
    });
    return payload;
}

export async function getSession(): Promise<UserResponse | null> {
    const cookieStore = await cookies();
    try {
        const sessionCookie = cookieStore.get('steve-session')?.value;
        if (!sessionCookie) {
            return null;
        }
        const session = (await decryptSession(sessionCookie)) as unknown as UserResponse;
        return session;
    } catch {
        return null;
    }
}
