'use client';

import { BannerModel } from 'libs/models';
import { Modal } from 'libs/ui/modal';
import Image from 'next/image';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';

interface Props {
    data: BannerModel;
    isOpen: boolean;
    onClose: () => void;
}

const Detail = ({ data, isOpen, onClose }: Props) => {
    if (!isOpen) return null;

    const locationMap: Record<string, string> = {
        top: 'بالا',
        middle: 'وسط',
        bottom: 'پایین'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            <div className='mb-4'>
                <h2 className='text-xl font-bold'>جزئیات بنر</h2>
            </div>
            <div className='space-y-4'>
                <Image
                    className='mx-auto block w-full max-w-full rounded-md object-cover'
                    src={data.image_url || noPic}
                    alt={data.alt_text || ''}
                    width={700}
                    height={350}
                />

                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <h4 className='text-sm font-semibold text-gray-500'>عنوان</h4>
                        <p className='text-md mt-1'>{data.title}</p>
                    </div>

                    <div>
                        <h4 className='text-sm font-semibold text-gray-500'>متن جایگزین</h4>
                        <p className='text-md mt-1'>{data.alt_text}</p>
                    </div>

                    <div className='col-span-2'>
                        <h4 className='text-sm font-semibold text-gray-500'>لینک</h4>
                        <a
                            href={data.link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-md mt-1 text-blue-500 hover:underline'
                        >
                            {data.link}
                        </a>
                    </div>

                    <div>
                        <h4 className='text-sm font-semibold text-gray-500'>موقعیت</h4>
                        <p className='text-md mt-1'>{locationMap[data.location]}</p>
                    </div>

                    <div>
                        <h4 className='text-sm font-semibold text-gray-500'>ترتیب</h4>
                        <p className='text-md mt-1'>{data.sort_order}</p>
                    </div>

                    <div>
                        <h4 className='text-sm font-semibold text-gray-500'>وضعیت</h4>
                        <p className='text-md mt-1'>
                            <span
                                className={`rounded-full px-2 py-1 text-xs ${data.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                            >
                                {data.is_active ? 'فعال' : 'غیرفعال'}
                            </span>
                        </p>
                    </div>

                    <div>
                        <h4 className='text-sm font-semibold text-gray-500'>تاریخ ایجاد</h4>
                        <p className='text-md mt-1'>
                            {data.created_at ? new Date(data.created_at).toLocaleDateString('fa-IR') : '-'}
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default Detail;
