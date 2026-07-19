'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Badge } from 'libs/ui';
import LoadingState from 'libs/ui/loadingState';
import { Modal } from 'libs/ui/modal';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const Detail = ({ id, isOpen, onClose }: { id: string; isOpen: boolean; onClose: () => void }) => {
    const router = useRouter();

    const { isLoading, data } = useSWR(ApiKeys.GET_CATEGORY(id), (url) => fetcher(url, 'dashboard', 'GET'), {
        revalidateOnFocus: false,
        shouldRetryOnError: false
    });

    if (!isLoading && !data) {
        router.push('/dashboard/category');
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
                        className='mx-auto block aspect-square w-full max-w-[250px] rounded-md object-cover'
                        src={data.data.category.url || ''}
                        alt={data.data.category.name || ''}
                        width={250}
                        height={250}
                    />
                    <ul className='space-y-4'>
                        <li>
                            <span className='text-gray-600'>نام دسته بندی</span>
                            <h3 className='mt-3 text-lg font-semibold'>{data.data.category.name}</h3>
                        </li>

                        <li>
                            <span className='text-gray-600'>ویژگی ها</span>
                            <div className='flex flex-wrap gap-2'>
                                {data?.data.category.attribute_set.map((item: { name: string }, index: number) => (
                                    <Badge className='mt-3' key={index}>
                                        {item.name}
                                    </Badge>
                                ))}
                            </div>
                        </li>

                        <li>
                            <span className='text-gray-600'>توضیحات دسته بندی</span>
                            <div className='text-md mt-3 text-gray-800'>{data.data.category.description}</div>
                        </li>
                    </ul>
                </div>
            )}
        </Modal>
    );
};

export default Detail;
