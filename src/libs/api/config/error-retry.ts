import { PublicConfiguration } from 'swr/_internal';

import retryBlacklist from './retry-blacklist';

interface StatusError extends Error {
    status?: number;
}

const swrOnErrorRetry = (
    error: StatusError,
    key: string,
    config: PublicConfiguration,
    revalidate: (opts: { retryCount: number }) => void,
    { retryCount }: { retryCount: number }
) => {
    // Never retry on 404.
    if (error.status === 404) return;

    // Never retry for a specific key.
    if (retryBlacklist.indexOf(key) > -1) return;

    // Only retry up to 10 times.
    if (retryCount >= 10) return;

    // Retry after 3 seconds.
    setTimeout(() => {
        revalidate({ retryCount });
    }, 3000);
};

export default swrOnErrorRetry;
