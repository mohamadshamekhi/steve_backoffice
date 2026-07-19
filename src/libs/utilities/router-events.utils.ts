'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRoutingEvents } from '../state/routing';

const TIMEOUT = 300;

export function onStart() {
    useRoutingEvents.setState(() => ({ routing: true }));

    setTimeout(() => {
        if (useRoutingEvents.getState().routing === true) {
            useRoutingEvents.setState(() => ({ showTransitionEffect: true }));
        }
    }, TIMEOUT);
}

export function onComplete() {
    useRoutingEvents.setState(() => ({
        routing: false,
        showTransitionEffect: false
    }));
}

export function useOnComplete() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setTimeout(() => {
            onComplete();
        }, TIMEOUT);
    }, [pathname, searchParams]);
}
