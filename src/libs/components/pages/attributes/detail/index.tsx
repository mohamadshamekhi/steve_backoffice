'use client';

import { Badge } from 'libs/ui';
import { Modal } from 'libs/ui/modal';

type Attribute = {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    attributes: SubAttribute[];
};

type SubAttribute = {
    id: string;
    name: string;
};

const Detail = ({
    isOpen,
    onClose,
    data
}: {
    id: string;
    isOpen: boolean;
    data: Attribute;
    name: string;
    onClose: () => void;
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            <div className='space-y-6'>
                <div className='text-md mb-2 font-semibold text-gray-500'>نام</div>

                <h3 className='text-lg font-semibold'>{data.name}</h3>

                <div className='text-md mt-6 mb-4 font-semibold text-gray-500'>ویژگی ها</div>
                <ul className='text-md flex flex-wrap items-center gap-2'>
                    {data.attributes.map((attribute) => (
                        <li key={attribute.id}>
                            <Badge>{attribute.name}</Badge>
                        </li>
                    ))}
                </ul>
            </div>
        </Modal>
    );
};

export default Detail;
