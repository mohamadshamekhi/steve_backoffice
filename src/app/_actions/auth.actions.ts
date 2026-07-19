'use server';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { SignInModel } from 'libs/models';
import { cookies } from 'next/headers';

export async function signInAction(model: SignInModel) {
    try {
        const response = await fetcher(ApiKeys.LOGIN, 'web', 'POST', {
            body: { ...model }
        });

        if (response.success) {
            return {
                success: true,
                ...response
            };
        }

        return {
            success: false,
            message: response.message || 'خطایی رخ داده است'
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'خطایی رخ داده است'
        };
    }
}

export async function signInVerifyAction(authParams: { code: string; phone_number: string | null }) {
    try {
        const response = await fetcher(ApiKeys.VERIFY_LOGIN, 'web', 'POST', {
            body: { ...authParams }
        });

        if (response.success) {
            await setAuthCookieAction(response.data.token);
            return {
                success: true,
                ...response
            };
        }

        return {
            success: false,
            message: response.message || 'خطایی رخ داده است'
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : 'خطایی رخ داده است'
        };
    }
}

export async function signOutAction() {
    const cookieStore = await cookies();
    const sessionCookie = await cookieStore.get('steve-session')?.value;

    if (!sessionCookie) {
        return null;
    }

    try {
        await fetcher(ApiKeys.LOGOUT, 'dashboard', 'POST');
        cookieStore.delete('steve-session');
        return {
            success: true,
            message: 'خروج با موفقیت انجام شد'
        };
    } catch {
        return {
            success: false,
            message: 'عملیات خروج با شکست مواجه شد'
        };
    }
}

export async function setAuthCookieAction(token: string) {
    // const decoded = jwtDecode<JWT>(token);

    // const session: JWT = {
    //     sub: decoded.sub,
    //     exp: decoded.exp * 1000,
    //     entity_id: decoded.entity_id,
    //     kind: decoded.kind,
    //     role_keys: decoded.role_keys,
    //     permission_keys: decoded.permission_keys
    // };

    const cookieStore = await cookies();
    // const encryptedSession = await encryptSession(session);

    // const useHttps = process.env.NEXT_PUBLIC_USE_HTTPS === 'true';

    cookieStore.set('steve-session', token, {
        // domain: 'backoffice.stevemobile.com',
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
}
