'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import LoadingState from 'libs/ui/loadingState';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const Detail = ({ id }: { id: string }) => {
    const router = useRouter();
    const { isLoading, data } = useSWR(ApiKeys.GET_ARTICLE(id), (url) => fetcher(url, 'dashboard', 'GET'), {});

    if (!isLoading && !data) {
        router.push('/dashboard/blog');
        return null;
    }

    return (
        <>
            {isLoading ? (
                <div className='flex min-h-[200px] items-center justify-center'>
                    <LoadingState />
                </div>
            ) : (
                <ul className='space-y-10'>
                    <li>
                        <div className='mb-2 text-sm font-semibold text-gray-600'>تصویر :</div>
                        <Image
                            className='mx-auto block aspect-square w-full max-w-[350px] rounded-md object-cover'
                            src={data?.data?.article.media_url || ''}
                            alt={data?.data?.article.title || ''}
                            width={350}
                            height={350}
                        />
                    </li>
                    <li>
                        <div className='mb-2 text-sm font-semibold text-gray-600'>موضوع :</div>
                        <h2 className='text-sm'>{data.data.article.title} </h2>
                    </li>
                    <li>
                        <div className='mb-2 text-sm font-semibold text-gray-600'>توضیحات :</div>
                        {/* //TODO -  check scurity */}
                        <div className='text-gray-500' dangerouslySetInnerHTML={{ __html: data.data.article.body }} />
                    </li>
                </ul>
            )}
        </>
    );
};

export default Detail;
