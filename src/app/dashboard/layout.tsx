'use client';

import React from 'react';
import AppHeader from '../../libs/components/layouts/AppHeader';
import Backdrop from '../../libs/components/layouts/Backdrop';
import Sidebar from '../../libs/components/layouts/sidebar/Sidebar';
import { useSidebarStore } from '../../libs/state/stores/sidebar';
import ClientPage from './client-page';

type LayoutContentProps = {
    children: React.ReactNode;
};

const Layout: React.FC<LayoutContentProps> = ({ children }) => {
    const { isExpanded, isHovered, isMobileOpen } = useSidebarStore();

    return (
        <div className='min-h-screen xl:flex'>
            <div>
                <Sidebar />
                <Backdrop />
            </div>
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${
                    isExpanded || isHovered ? 'lg:mr-[290px]' : 'lg:mr-[90px]'
                } ${isMobileOpen ? 'mr-0' : ''}`}
            >
                <AppHeader />
                <div className='mx-auto max-w-[var(--breakpoint-2xl)] p-4 md:p-6'>
                    <ClientPage components={children} />
                </div>
            </div>
        </div>
    );
};

export default Layout;
