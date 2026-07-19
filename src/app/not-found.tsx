import ROUTES from 'libs/constants/routes/routes.constants';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: '404 - Not Found',
    description: '404 - Not Found'
};

function ClientError() {
    return (
        <section className='h-screen bg-white dark:bg-gray-900'>
            <div className='mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16'>
                <div className='mx-auto max-w-screen-sm text-center'>
                    <h1 className='mb-4 text-7xl font-extrabold tracking-tight text-indigo-600 lg:text-9xl dark:text-indigo-500'>
                        404
                    </h1>
                    <p className='mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white'>
                        {`Something's`} missing.
                    </p>
                    <p className='mb-4 text-lg font-light text-gray-500 dark:text-gray-400'>
                        Sorry, we {`can't`} find that page.{`You'll`} find lots to explore on the home page.{' '}
                    </p>
                    <Link
                        href={ROUTES.Dashboard}
                        className='my-4 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-800 focus:ring-4 focus:ring-indigo-300 focus:outline-none dark:focus:ring-indigo-900'
                    >
                        Back to Homepage
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ClientError;
