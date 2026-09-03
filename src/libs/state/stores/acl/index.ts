'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IACLStore {
    permissions: string[];
    roles: string[];
    setACL: (permissions: string[], roles: string[]) => void;
    clearACL: () => void;
    hasPermission: (key: string) => boolean;
    hasAnyPermission: (keys: string[]) => boolean;
    hasAllPermissions: (keys: string[]) => boolean;
    hasRole: (role: string) => boolean;
}

export const useACLStore = create<IACLStore>()(
    persist(
        (set, get) => ({
            permissions: [],
            roles: [],
            setACL: (permissions, roles) => set({ permissions: permissions ?? [], roles: roles ?? [] }),
            clearACL: () => set({ permissions: [], roles: [] }),
            hasPermission: (key) => (get().permissions ?? []).includes(key),
            hasAnyPermission: (keys) => keys.some((key) => (get().permissions ?? []).includes(key)),
            hasAllPermissions: (keys) => keys.every((key) => (get().permissions ?? []).includes(key)),
            hasRole: (role) => (get().roles ?? []).includes(role)
        }),
        {
            name: 'steve-acl'
        }
    )
);
