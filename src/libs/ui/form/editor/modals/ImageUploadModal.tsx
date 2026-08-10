'use client';

import { ImageIcon } from 'libs/components/icons';
import { Button, Input } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useCallback, useRef, useState } from 'react';

interface ImageUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (src: string, alt: string) => void;
}

type Tab = 'upload' | 'url';

const ImageUploadModal = ({ isOpen, onClose, onInsert }: ImageUploadModalProps) => {
    const [tab, setTab] = useState<Tab>('upload');
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const reset = useCallback(() => {
        setTab('upload');
        setUrl('');
        setAlt('');
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
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
        e.target.value = '';
    }, []);

    const handleInsert = useCallback(() => {
        if (tab === 'upload' && preview) {
            onInsert(preview, alt);
            handleClose();
        } else if (tab === 'url' && url.trim()) {
            onInsert(url.trim(), alt);
            handleClose();
        }
    }, [tab, preview, url, alt, onInsert, handleClose]);

    const canInsert = (tab === 'upload' && !!preview) || (tab === 'url' && !!url.trim());

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <h3 className='mb-4 text-lg font-semibold'>افزودن تصویر</h3>

            {/* Tabs */}
            <div className='mb-4 flex gap-2 border-b pb-2'>
                {(['upload', 'url'] as Tab[]).map((t) => (
                    <button
                        key={t}
                        type='button'
                        className={`rounded-t px-4 py-2 text-sm font-medium transition-colors ${
                            tab === t
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setTab(t)}
                    >
                        {t === 'upload' ? 'آپلود از سیستم' : 'لینک تصویر'}
                    </button>
                ))}
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
                    <input ref={fileInputRef} type='file' accept='image/*' onChange={handleFileChange} className='hidden' />
                    {preview && (
                        <div className='flex justify-center'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt='پیش‌نمایش' className='max-h-48 rounded-md object-contain' />
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
                                className='max-h-48 rounded-md object-contain'
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Alt text (shared) */}
            <div className='mt-4'>
                <Input
                    name='altText'
                    type='text'
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder='متن جایگزین (alt)'
                />
            </div>

            <div className='mt-6 flex justify-end gap-2'>
                <Button type='button' variant='outline' size='sm' onClick={handleClose}>
                    انصراف
                </Button>
                <Button type='button' size='sm' onClick={handleInsert} disabled={!canInsert}>
                    درج تصویر
                </Button>
            </div>
        </Modal>
    );
};

export default ImageUploadModal;
