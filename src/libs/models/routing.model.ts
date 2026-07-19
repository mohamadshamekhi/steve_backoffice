export interface RoutingStoreModel {
    routing: boolean;
    showTransitionEffect: boolean;
    startRouting: () => void;
    finishRouting: () => void;
    setTransitionEffect: (state: boolean) => void;
}
