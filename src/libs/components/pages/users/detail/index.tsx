'use client';

import { Button } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
type User = {
    id: string;
    _id: string;
    name: string;
    phone_number: string;
    created_at: string;
};
const Detail = ({ data, isOpen, onClose }: { data: User; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            <h2 className='mb-5 text-lg font-semibold text-gray-600'>نماش جزییات</h2>
            <div className='space-y-6 *:border-b *:border-gray-100 *:p-4 *:last:border-0'>
                <div className='flex items-center gap-2'>
                    <span>نام :</span>
                    <span className='text-lg font-semibold'>{data.name}</span>
                </div>

                <div className='flex items-center gap-2'>
                    <span>شماره همراه :</span>
                    <div className='text-lg font-semibold'>{data.phone_number}</div>
                </div>
                <div className='flex items-center gap-2'>
                    <span>تاریخ ورود :</span>
                    <div className='text-lg font-semibold'>{new Date(data.created_at).toLocaleDateString('fa-IR')}</div>
                </div>
            </div>

            <Button size='sm' type='button' variant='outline' onClick={onClose} className='mr-auto! ml-0! block!'>
                بستن
            </Button>
        </Modal>
    );
};

export default Detail;
