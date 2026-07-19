'use client';

import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { SWRConfig } from 'swr';
import { fetcher, onSwrGlobalError, swrOnErrorRetry } from './../libs/api';
import { useRoutingEvents } from './../libs/state/routing';
import { useOnComplete } from './../libs/utilities';

interface IProps {
    components: React.ReactNode;
}

function ClientPage({ components }: IProps) {
    // const cookie = parseCookies();
    // const access_token = cookie['steve-session'];

    const { showTransitionEffect } = useRoutingEvents();

    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        window.addEventListener('online', () => setIsOffline(false));
        window.addEventListener('offline', () => setIsOffline(true));
    }, []);

    useOnComplete();

    // useEffect(() => {
    //     getProfile();
    // }, []);

    // const getProfile = async () => {
    //     if (!access_token || access_token.length < 5) return;
    //     // auth.setFetching(true);
    //     const profile = await fetcher(ApiKeys.ME, 'dashboard', 'GET', {
    //         requiredAuth: true
    //     });
    //     console.log(profile.data.backoffice, 'profile');
    //     //   Set data
    //     // auth.setFetching(false);
    // };

    return (
        <>
            {showTransitionEffect && (
                <div className='fixed right-0 bottom-3 left-0 z-50 m-auto flex w-max items-center gap-2 rounded-lg border border-slate-400 bg-slate-700 px-[9px] py-[6px] text-sm leading-3 text-white'>
                    <svg
                        className='h-6 w-6 animate-spin text-slate-100'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                    >
                        <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                        ></circle>
                        <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                    </svg>
                    <span>در حال انتقال</span>
                </div>
            )}

            {/* TODO : move to svg icons */}
            {isOffline && (
                <div>
                    <div className='fixed right-0 bottom-3 left-0 z-50 m-auto flex w-max items-center gap-2 rounded-3xl bg-red-500 px-3 py-2 text-sm leading-3 text-zinc-200'>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='24'
                            height='24'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='icon icon-tabler icons-tabler-outline icon-tabler-network-off'
                        >
                            <path stroke='none' d='M0 0h24v24H0z' fill='none' />
                            <path d='M6.528 6.536a6 6 0 0 0 7.942 7.933m2.247 -1.76a6 6 0 0 0 -8.427 -8.425' />
                            <path d='M12 3c1.333 .333 2 2.333 2 6c0 .337 -.006 .66 -.017 .968m-.55 3.473c-.333 .884 -.81 1.403 -1.433 1.559' />
                            <path d='M12 3c-.936 .234 -1.544 1.29 -1.822 3.167m-.16 3.838c.116 3.029 .776 4.695 1.982 4.995' />
                            <path d='M6 9h3m4 0h5' />
                            <path d='M3 20h7' />
                            <path d='M14 20h7' />
                            <path d='M10 20a2 2 0 1 0 4 0a2 2 0 0 0 -4 0' />
                            <path d='M12 15v3' />
                            <path d='M3 3l18 18' />
                        </svg>
                        <span>ارتباط با اینترنت قطع میباشد</span>
                    </div>
                </div>
            )}

            <SWRConfig
                value={{
                    fetcher,
                    onErrorRetry: swrOnErrorRetry,
                    onError: onSwrGlobalError,
                    focusThrottleInterval: 30000
                }}
            >
                {components}
                <ToastContainer position='top-left' rtl={true} toastClassName='custom-toast' />
            </SWRConfig>
        </>
    );
}

export default ClientPage;
