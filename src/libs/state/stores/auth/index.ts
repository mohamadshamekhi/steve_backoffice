import { UserResponse } from 'libs/models';
import { create } from 'zustand';
import { useACLStore } from '../acl';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface ISessionStore {
    session: UserResponse | null;
    status: AuthStatus;
    clearSession: () => void;
    updateSession: () => void;
}

const fetchSessionFromApi = async () => {
    try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
            const data = await response.json();
            console.log(data, 'state');
            return data
                ? {
                      session: data,
                      status: 'authenticated' as AuthStatus
                  }
                : {
                      session: null,
                      status: 'unauthenticated' as AuthStatus
                  };
        }

        return {
            session: null,
            status: 'unauthenticated' as AuthStatus
        };
    } catch {
        return {
            session: null,
            status: 'unauthenticated' as AuthStatus
        };
    }
};

export const useSessionStore = create<ISessionStore>((set) => ({
    session: null,
    status: 'loading',
    clearSession: () => {
        set({
            session: null,
            status: 'unauthenticated'
        });
        useACLStore.getState().clearACL();
    },
    updateSession: async () => {
        const { session, status } = await fetchSessionFromApi();
        set({ session, status });
        if (session) {
            useACLStore.getState().setACL(session.permission_keys, session.role_keys);
        }
    }
}));

if (typeof window !== 'undefined') {
    useSessionStore.getState().updateSession();
}
