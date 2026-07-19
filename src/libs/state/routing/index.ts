import { RoutingStoreModel } from 'libs/models/routing.model';
import { create } from 'zustand';

const useRoutingEvents = create<RoutingStoreModel>()((set) => ({
    routing: false,
    showTransitionEffect: false,
    startRouting: () => {
        set(() => {
            return { routing: true };
        });
    },
    finishRouting: () => {
        set(() => {
            return { routing: true };
        });
    },
    setTransitionEffect: (state: boolean) => {
        set(() => {
            return { showTransitionEffect: state };
        });
    }
}));

export { useRoutingEvents };
