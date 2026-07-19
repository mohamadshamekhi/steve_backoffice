'use client';

import { ImageIcon } from 'libs/components/icons';
import { Button, Input } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import Image from 'next/image';
import { useCallback, useRef, useState } from 'react';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (src: string) => void;
}

const ImageUploadModal = ({ isOpen, onClose, onInsert }: ImageUploadModalProps) => {
    const [tab, setTab] = useState<'upload' | 'url'>('upload');
    const [url, setUrl] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        setTab('upload');
        setUrl('');
        setPreview(null);
    }, []);

    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [onClose, reset]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setPreview(base64);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    const handleInsert = useCallback(() => {
        if (tab === 'upload' && preview) {
            onInsert(preview);
            handleClose();
        } else if (tab === 'url' && url.trim()) {
            onInsert(url.trim());
            handleClose();
        }
    }, [tab, preview, url, onInsert, handleClose]);

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <h3 className='mb-4 text-lg font-semibold'>افزودن تصویر</h3>

            <div className='mb-4 flex gap-2 border-b pb-2'>
                <button
                    type='button'
                    className={`rounded-t px-4 py-2 text-sm font-medium ${
                        tab === 'upload'
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setTab('upload')}
                >
                    آپلود از سیستم
                </button>
                <button
                    type='button'
                    className={`rounded-t px-4 py-2 text-sm font-medium ${
                        tab === 'url' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setTab('url')}
                >
                    لینک تصویر
                </button>
            </div>

            {tab === 'upload' && (
                <div className='space-y-4'>
                    <div
                        className='flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 transition hover:border-blue-400 hover:bg-blue-50'
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className='mb-2 text-3xl text-gray-400' />
                        <p className='text-sm text-gray-500'>برای انتخاب تصویر کلیک کنید</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleFileChange}
                        className='hidden'
                    />

                    {preview && (
                        <div className='flex justify-center'>
                            <Image
                                src={preview}
                                alt='پیش‌نمایش'
                                className='max-h-48 rounded-md'
                                width={400}
                                height={192}
                            />
                        </div>
                    )}
                </div>
            )}

            {tab === 'url' && (
                <div className='space-y-4'>
                    <Input
                        name='imageUrl'
                        type='text'
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder='آدرس تصویر را وارد کنید'
                        dir='ltr'
                    />
                    {url.trim() && (
                        <div className='flex justify-center'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt='پیش‌نمایش'
                                className='max-h-48 rounded-md'
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className='mt-6 flex justify-end gap-2'>
                <Button type='button' variant='outline' size='sm' onClick={handleClose}>
                    انصراف
                </Button>
                <Button
                    type='button'
                    size='sm'
                    onClick={handleInsert}
                    disabled={(tab === 'upload' && !preview) || (tab === 'url' && !url.trim())}
                >
                    درج تصویر
                </Button>
            </div>
        </Modal>
    );
};

export default ImageUploadModal;
