/* eslint-disable @typescript-eslint/no-explicit-any */
import { destroyCookie, parseCookies } from 'nookies';
import { stringify } from 'querystring';
import { toast } from 'react-toastify';

type LocationPath = 'dashboard' | 'web';

interface Options {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    body?: any;
    requiredAuth?: boolean;
    forceBearer?: string;
}

interface FetchError {
    status: number;
    message: string;
}

type method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';

const getFetchPath = (location: LocationPath) => {
    switch (location) {
        case 'dashboard':
        case 'web':
            return process.env.NEXT_PUBLIC_API_URL;
        default:
            return '';
    }
};

const fetcher = async (fetcherKey: string, location: LocationPath, method?: method, options?: Options) => {
    let requiredAuth = true;

    if (
        (options && options.requiredAuth === false) ||
        location !== 'dashboard'
        // || fetcherKey.indexOf("data-source") > -1
    ) {
        requiredAuth = false;
    }

    const headersList: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options && options.headers && { body: JSON.stringify(options.headers) })
    };

    if (requiredAuth) {
        const cookie = parseCookies();
        const access_token = cookie['steve-session'];

        if (!access_token || access_token.length < 5) {
            destroyCookie(null, 'steve-session');
            if (typeof window !== 'undefined') {
                toast.error('دسترسی غیر مجاز');
                window.location.href = '/auth/login';
            }
            return;
        }

        headersList.Authorization = `Bearer ${access_token}`;
    }

    const requestInit: RequestInit = {
        method,
        headers: headersList,
        ...(options && options.body && { body: JSON.stringify(options.body) })
    };

    try {
        // initial url structure
        const constructUrl = [getFetchPath(location), fetcherKey];

        // add query params to url
        if (options && options.params) {
            constructUrl.push(`?${stringify(options.params)}`);
        }

        console.log(`${method} -> ${location} -> ${requiredAuth ? '🔒' : ''} ${constructUrl.join('')} `);

        // send a request
        const response = await fetch(constructUrl.join(''), requestInit);

        if (!response.ok) {
            if (response?.status === 401) {
                toast.error('Unauthorized access, log in again!', {
                    toastId: 'logout-401'
                });
                // TODO : redirect to /logout page
                destroyCookie(null, 'steve-session');
                window.location.href = '/auth/login';
                return;
            }
            const error: FetchError = {
                status: response?.status || 500,
                message: response?.statusText || 'مشکلی پیش امده'
            };
            if (typeof window !== 'undefined') {
                const { message } = await response.json();
                toast.error(message, {
                    toastId: message
                });
            }
            return error;
        }

        return response.json();
    } catch (error: any) {
        if (error?.status === 401) {
            toast.error('Unauthorized access, log in again!', {
                toastId: 'logout-401'
            });
            // TODO : redirect to /logout page
            destroyCookie(null, 'steve-session');
            window.location.href = '/auth/login';
            return;
        }
        const fetchError: FetchError = {
            status: error?.status || 500,
            message: error?.statusText || 'مشکلی پیش امده'
        };
        if (typeof window !== 'undefined') {
            toast.error(fetchError.message, {
                toastId: fetchError.message
            });

            toast.error('خطا در ارتباط با سرور', {
                toastId: 'server-error'
            });
        }
        return fetchError;
    }
};

export default fetcher;
