'use client';

import { cn } from 'libs/utilities';
import { useState } from 'react';
import { TabProps } from './tab.types';

const Tab = ({ tabs, containerClass = '' }: TabProps) => {
    const [tab, setTab] = useState(1);

    return (
        <div className={cn('space-y-6', containerClass)}>
            <div>
                <div className='rounded-t-xl border border-gray-200 p-3 dark:border-gray-800'>
                    <nav className='[&amp;::-webkit-scrollbar]:h-1.5 [&amp;::-webkit-scrollbar-track]:bg-white dark:[&amp;::-webkit-scrollbar-track]:bg-transparent [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&amp;::-webkit-scrollbar-thumb]:bg-gray-600 flex overflow-x-auto rounded-lg bg-gray-100 p-1 dark:bg-gray-900'>
                        {tabs.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out ${
                                    tab === id
                                        ? 'shadow-theme-xs bg-white text-gray-900 dark:bg-white/[0.03] dark:text-white'
                                        : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className='rounded-b-xl border border-t-0 border-gray-200 p-6 pt-4 dark:border-gray-800'>
                    <div>
                        <h3 className='mb-1 text-xl font-medium text-gray-800 dark:text-white/90'>
                            {tabs.find((t) => t.id === tab)?.label}
                        </h3>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>
                            {tabs.find((t) => t.id === tab)?.content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tab;
