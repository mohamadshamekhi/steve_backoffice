/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import axios from 'axios';
import { TrashIcon } from 'libs/components/icons';
import { cn } from 'libs/utilities';
import Image from 'next/image';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FileRejection, useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

type DropzoneComponentProps = {
    preview?: boolean;
    maxSize?: number;
    maxFiles?: number;
    url?: string;
    onUpload?: (responseData: any) => void;
    domain?: 'article' | 'product' | 'category' | 'brand';
    accept?: Record<string, string[]>;
    onClearRequest?: (clearFn: () => void) => void;
    defaultImage?: string;
};

const DropzoneComponent = ({
    url = `${process.env['NEXT_PUBLIC_API_URL']}/media/upload`,
    preview = true,
    maxSize = 10 * 1024 * 1024,
    maxFiles,
    onUpload,
    domain = 'product',
    accept = { 'image/*': [] },
    onClearRequest,
    defaultImage
}: DropzoneComponentProps) => {
    const [files, setFiles] = useState<(File & { preview?: string })[]>([]);
    const [uploaded, setUploaded] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ [key: string]: number }>({});

    const hasVideo = Object.keys(accept).some((type) => type.startsWith('video/') || type === 'video/*');
    const filesRef = useRef(files);

    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    const clearFiles = useCallback(() => {
        filesRef.current.forEach((file) => {
            if (file.preview) URL.revokeObjectURL(file.preview);
        });
        setFiles([]);
        setUploaded([]);
        setProgress({});
        setError(null);
    }, []);

    useEffect(() => {
        if (onClearRequest) {
            onClearRequest(clearFiles);
        }
    }, [onClearRequest, clearFiles]);

    useEffect(() => {
        if (!preview) return;

        return () => {
            files.forEach((file) => {
                if (file.preview) URL.revokeObjectURL(file.preview);
            });
        };
    }, [files, preview]);

    const uploadFile = useCallback(
        (file: File): Promise<string> => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('domain', domain);
            formData.append('is_public', 'true');
            formData.append('convert_to_webp', 'true');
            const cookie = parseCookies();
            const access_token = cookie['steve-session'];

            return axios
                .post(url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${access_token}`
                    },
                    onUploadProgress: (event) => {
                        if (event.total) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setProgress((prev) => ({ ...prev, [file.name]: percent }));
                        }
                    }
                })
                .then((response) => {
                    toast.success('آپلود با موفقیت انجام شد');
                    if (onUpload) {
                        onUpload(response.data);
                    }
                    return response.data.filename || file.name;
                })
                .catch((error) => {
                    console.error(error);
                    throw new Error('Upload failed');
                });
        },
        [domain, url, onUpload]
    );

    const onDrop = useCallback(
        async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            setError(null);

            if (fileRejections.length > 0) {
                const messages = fileRejections.map(({ file, errors }) =>
                    errors.map((e) => `${file.name}: ${e.message}`).join(', ')
                );
                setError(messages.join('; '));
                return;
            }

            if (maxFiles != undefined && files.length + acceptedFiles.length > maxFiles) {
                setError(`شما می‌توانید حداکثر ${maxFiles} فایل آپلود کنید.`);
                return;
            }

            const filesWithPreview = preview
                ? acceptedFiles.map((file) =>
                      Object.assign(file, {
                          preview: URL.createObjectURL(file)
                      })
                  )
                : acceptedFiles;

            setFiles((prev) => [...prev, ...filesWithPreview]);

            try {
                for (const file of acceptedFiles) {
                    await uploadFile(file).then((filename) => {
                        setUploaded((prev) => [...prev, filename]);
                        setProgress((prev) => ({ ...prev, [file.name]: 100 }));
                    });
                }
            } catch {
                setError('خطا در آپلود فایل');
            }
        },
        [files.length, maxFiles, preview, uploadFile]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize,
        maxFiles,
        accept
    });

    const removeFile = (fileToRemove: File & { preview?: string }) => {
        if (fileToRemove.preview) URL.revokeObjectURL(fileToRemove.preview);
        setFiles((prev) => prev.filter((file) => file !== fileToRemove));
        setUploaded((prev) => prev.filter((name) => name !== fileToRemove.name));
        setProgress((prev) => {
            const copy = { ...prev };
            delete copy[fileToRemove.name];
            return copy;
        });
    };

    return (
        <section>
            {defaultImage && files.length === 0 && (
                <div className='mb-3 flex items-center gap-3'>
                    <Image
                        src={defaultImage}
                        alt='تصویر فعلی'
                        width={80}
                        height={80}
                        className='h-20 w-20 rounded-md border object-cover'
                    />
                    <span className='text-sm text-gray-500'>تصویر فعلی (برای تغییر، فایل جدید آپلود کنید)</span>
                </div>
            )}
            <div
                className={cn(
                    'dropzone cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition',
                    isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-gray-800'
                        : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900'
                )}
            >
                <div {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()} />
                    <p>{hasVideo ? 'فایل خود را آپلود کنید' : 'فایل‌های مجاز را آپلود کنید'}</p>
                    <p className='mt-1 flex justify-center gap-1 text-sm text-gray-500'>
                        <span>حداکثر فایل مجاز {(maxSize / 1024 / 1024).toFixed(2)}مگابایت</span>
                        {maxFiles != undefined && <span>و حداکثر تعداد فایل {maxFiles}</span>}
                    </p>
                </div>
            </div>

            {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}

            <aside>
                <ul className='mt-4'>
                    {files.map((file) => {
                        const fileProgress = progress[file.name] || 0;
                        return (
                            <li key={file.name + file.size} className='mb-4 flex items-center gap-4'>
                                <div className='relative flex-1 rounded-md border p-2'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            {preview && file.preview && (
                                                <>
                                                    {file.type.startsWith('image') ? (
                                                        <Image
                                                            width={64}
                                                            height={64}
                                                            src={file.preview}
                                                            alt={file.name}
                                                            className='h-16 w-16 rounded object-cover'
                                                            onLoad={() => URL.revokeObjectURL(file.preview!)}
                                                        />
                                                    ) : file.type.startsWith('video') ? (
                                                        <video
                                                            src={file.preview}
                                                            controls
                                                            className='h-16 w-24 rounded object-cover'
                                                        />
                                                    ) : (
                                                        <span className='text-xs text-gray-500'>{file.name}</span>
                                                    )}
                                                </>
                                            )}
                                            <span>
                                                {file.name} - {file.size} bytes{' '}
                                                {uploaded.includes(file.name) && (
                                                    <span className='text-green-600'>(آپلود شد)</span>
                                                )}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => removeFile(file)}
                                            className='rounded px-2 py-0.5 text-xs text-red-500'
                                            type='button'
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>

                                    {fileProgress > 0 && fileProgress < 100 && (
                                        <div className='mt-1 h-2 w-full overflow-hidden rounded bg-gray-200'>
                                            <div
                                                className='h-2 bg-blue-500'
                                                style={{ width: `${fileProgress}%`, transition: 'width 0.3s ease' }}
                                            />
                                        </div>
                                    )}

                                    {fileProgress === 100 && !uploaded.includes(file.name) && (
                                        <div className='bg-success-500 mt-1 h-2 w-full rounded' />
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </section>
    );
};

export default DropzoneComponent;
