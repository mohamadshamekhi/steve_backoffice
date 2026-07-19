'use client';

import { useACLStore } from 'libs/state/stores/acl';

type Mode = 'any' | 'all';

export function usePermission(permission: string | string[], mode: Mode = 'any'): boolean {
    const permissions = useACLStore((state) => state.permissions);

    if (typeof permission === 'string') {
        return permissions.includes(permission);
    }

    if (mode === 'all') {
        return permission.every((key) => permissions.includes(key));
    }

    return permission.some((key) => permissions.includes(key));
}

export function useRole(role: string | string[]): boolean {
    const roles = useACLStore((state) => state.roles);

    if (typeof role === 'string') {
        return roles.includes(role);
    }

    return role.some((key) => roles.includes(key));
}
