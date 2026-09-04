'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import LoadingState from 'libs/ui/loadingState';
import { Modal } from 'libs/ui/modal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const Detail = ({ id, isOpen, onClose }: { id: string; isOpen: boolean; onClose: () => void }) => {
    const router = useRouter();
    const { isLoading, data } = useSWR(ApiKeys.GET_BRAND(id), (url) => fetcher(url, 'dashboard', 'GET'), {
        revalidateOnFocus: false,
        shouldRetryOnError: false
    });

    if (!isLoading && !data) {
        router.push('/dashboard/brand');
        return null;
    }

    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            {isLoading ? (
                <div className='flex min-h-[200px] items-center justify-center'>
                    <LoadingState />
                </div>
            ) : (
                <div className='space-y-6'>
                    <Image
                        className='mx-auto block aspect-square w-full max-w-[350px] rounded-md object-cover'
                        src={data?.data?.url || ''}
                        alt={data?.data?.title || ''}
                        width={350}
                        height={350}
                    />
                    <h3 className='text-lg font-semibold'>{data.data.name}</h3>
                    <div className='text-sm text-gray-400' dir='ltr'>
                        {data.data.slug || 'اسلاگ تنظیم نشده'}
                    </div>
                    <div className='text-md text-gray-500'>{data.data.description}</div>
                </div>
            )}
        </Modal>
    );
};

export default Detail;
