import { useEffect, useRef, useState } from 'react';

export interface UseMediaQueryOptions {
    getInitialValueInEffect: boolean;
}

type MediaQueryCallback = (event: { matches: boolean; media: string }) => void;

function attachMediaListener(query: MediaQueryList, callback: MediaQueryCallback) {
    try {
        query.addEventListener('change', callback);
        return () => query.removeEventListener('change', callback);
    } catch {
        query.addEventListener('change', callback);
        return () => query.removeEventListener('change', callback);
    }
}

type MediaQueryTypes = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

function getInitialValue(query: string, initialValue?: boolean) {
    if (typeof initialValue === 'boolean') {
        return initialValue;
    }

    if (typeof window !== 'undefined' && 'matchMedia' in window) {
        return window.matchMedia(query).matches;
    }

    return false;
}

export function useMediaQuery(
    queryType: MediaQueryTypes,
    initialValue?: boolean,
    { getInitialValueInEffect }: UseMediaQueryOptions = {
        getInitialValueInEffect: true
    }
) {
    const query = {
        sm: '(max-width: 767px)',
        md: '(min-width: 768px) and (max-width: 1023px)',
        lg: '(max-width: 1024px)',
        xl: '(max-width: 1280px)',
        '2xl': '(max-width: 1536px)'
    }[queryType];

    const [matches, setMatches] = useState(getInitialValueInEffect ? false : getInitialValue(query, initialValue));
    const queryRef = useRef<MediaQueryList>(null);

    useEffect(() => {
        if ('matchMedia' in window) {
            queryRef.current = window.matchMedia(query);
            setMatches(queryRef.current.matches);
            return attachMediaListener(queryRef.current, (event) => setMatches(event.matches));
        }

        return undefined;
    }, [query]);

    return matches;
}

export default useMediaQuery;
