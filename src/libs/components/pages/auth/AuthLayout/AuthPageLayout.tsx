'use client';
import GridShape from 'libs/components/common/GridShape';
// import ThemeTogglerTwo from 'libs/components/common/ThemeTogglerTwo';
import Image from 'next/image';
import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='relative z-1 bg-white p-6 sm:p-0 dark:bg-gray-900'>
            <div className='relative flex h-screen w-full flex-col justify-center sm:p-0 lg:flex-row dark:bg-gray-900'>
                {children}
                <div className='bg-brand-950 hidden h-full w-full items-center lg:grid lg:w-1/2 dark:bg-white/5'>
                    <div className='relative z-1 flex items-center justify-center'>
                        <GridShape />
                        <Image
                            alt='steve'
                            width={300}
                            height={300}
                            src='/images/auth/otp.png'
                            className='mx-auto w-full max-w-[400px] rounded-md'
                        />
                    </div>
                </div>
                <div className='fixed right-6 bottom-6 z-50 hidden sm:block'>{/* <ThemeTogglerTwo /> */}</div>
            </div>
        </div>
    );
};

export default AuthLayout;
