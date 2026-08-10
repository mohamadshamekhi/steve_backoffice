'use client';

import { Button, Input } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useEffect, useState } from 'react';

interface LinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialHref: string;
    onSave: (href: string) => void;
}

const LinkModal = ({ isOpen, onClose, initialHref, onSave }: LinkModalProps) => {
    const [href, setHref] = useState(initialHref);

    useEffect(() => {
        if (isOpen) setHref(initialHref);
    }, [isOpen, initialHref]);

    const handleSave = () => {
        onSave(href.trim());
        onClose();
    };

    const handleRemove = () => {
        onSave('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h3 className='mb-4 text-lg font-semibold'>افزودن لینک</h3>
            <Input
                name='linkHref'
                type='url'
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder='https://example.com'
                dir='ltr'
            />
            <div className='mt-6 flex justify-between gap-2'>
                {initialHref && (
                    <Button type='button' variant='outline' size='sm' onClick={handleRemove}>
                        حذف لینک
                    </Button>
                )}
                <div className='ml-auto flex gap-2'>
                    <Button type='button' variant='outline' size='sm' onClick={onClose}>
                        انصراف
                    </Button>
                    <Button type='button' size='sm' onClick={handleSave} disabled={!href.trim()}>
                        ذخیره
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default LinkModal;
