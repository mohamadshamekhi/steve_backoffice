import { ReactNode } from 'react';

type TabItem = {
    id: number;
    label: string;
    content: ReactNode | string;
};

export type TabProps = {
    tabs: TabItem[];
    containerClass?: string;
    contentClass?: string;
    buttonClass?: string;
};
