'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { TrashIcon } from 'libs/components/icons';
import { Button, Input, Switch } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import LoadingState from 'libs/ui/loadingState';
import { galleryValidationSchema } from 'libs/validator/schemas/product.schema';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';

type InputItem = { id: string; url: string };
type OutputItem = { media_id: string; media_url: string };

type Image = {
    media_id: string;
    url: string;
    alt?: string;
    is_primary?: boolean;
};
/** متن alt یک تصویر گالری؛ برای سئو و دسترس‌پذیری. خالی = نام محصول در سایت استفاده می‌شود */
const GalleryAltField = ({
    productId,
    media,
    onSaved
}: {
    productId: string;
    media: Image;
    onSaved: () => void;
}) => {
    const [alt, setAlt] = useState(media.alt ?? '');
    const [saving, setSaving] = useState(false);
    const dirty = alt.trim() !== (media.alt ?? '');

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetcher(ApiKeys.PATCH_PRODUCT_SET_GALLERY_ALT, 'dashboard', 'PATCH', {
                body: { product_id: productId, media_id: media.media_id, alt: alt.trim() }
            });
            if (res?.success) {
                toast.success('متن جایگزین تصویر ذخیره شد');
                onSaved();
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='flex min-w-0 flex-1 items-center gap-2'>
            <Input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder='متن جایگزین (alt) — مثلاً «قاب مگ‌سیف آیفون ۱۷ رنگ مشکی»'
                className='max-w-full!'
            />
            <Button size='sm' variant='outline' disabled={!dirty || saving} loading={saving} onClick={save}>
                ذخیره
            </Button>
        </div>
    );
};

const ProductGallery = ({ id }: { id: string }) => {
    const { isLoading, data, mutate } = useSWR(ApiKeys.GET_PRODUCT(id), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    function mapToSelectOptions(items: InputItem | InputItem[]): OutputItem[] {
        if (!items) return [];
        const arrayItems = Array.isArray(items) ? items : [items];
        return arrayItems.map((item) => ({
            media_id: item.id,
            media_url: item.url
        }));
    }

    const [loading, setLoading] = useState<boolean>(false);
    const [uploadedImages, setUploadedImages] = useState<OutputItem[]>([]);

    const formik = useFormik({
        initialValues: {
            media_id: '',
            media_url: '',
            is_primary: false,
            product_id: id
        },
        validationSchema: toFormikValidationSchema(galleryValidationSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                // get all values and loop fetcher for add product galley
                const imagesToUpload =
                    uploadedImages.length > 0
                        ? uploadedImages
                        : [{ media_id: values.media_id, media_url: values.media_url }];

                let successCount = 0;
                let failCount = 0;

                for (const image of imagesToUpload) {
                    try {
                        const { status } = await fetcher(ApiKeys.PATCH_PRODUCT_ADD_GALLERY, 'dashboard', 'PATCH', {
                            body: {
                                media_id: image.media_id,
                                media_url: image.media_url,
                                is_primary: values.is_primary,
                                product_id: id
                            }
                        });

                        if (status !== 400) {
                            successCount++;
                        } else {
                            failCount++;
                        }
                    } catch (error) {
                        console.error('Failed to add image:', error);
                        failCount++;
                    }
                }

                await mutate();

                if (successCount > 0) {
                    toast.success(`${successCount} تصویر با موفقیت اضافه شد`);
                }
                if (failCount > 0) {
                    toast.error(`${failCount} تصویر با خطا مواجه شد`);
                }

                setUploadedImages([]);
                formik.resetForm();
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    const deleteGallery = async (values: { media_id: string; product_id: string }) => {
        try {
            await fetcher(ApiKeys.PATCH_PRODUCT_DELETE_GALLERY, 'dashboard', 'PATCH', {
                body: {
                    media_id: values.media_id,
                    product_id: values.product_id
                }
            });
            await mutate();
            toast.success('حذف با موفقیت انجام شد');
        } catch (error) {
            console.error('Failed to delete Gallery:', error);
        }
    };

    const updatePrimaryHandler = async (values: { media_id: string; product_id: string }) => {
        try {
            await fetcher(ApiKeys.PATCH_PRODUCT_SET_PRIMARY, 'dashboard', 'PATCH', {
                body: {
                    media_id: values.media_id,
                    product_id: values.product_id
                }
            });
            await mutate();
            toast.success('عملیات با موفقیت انجام شد');
        } catch (error) {
            console.error('Failed to delete Gallery:', error);
        }
    };

    if (isLoading) return <LoadingState />;
    return (
        <>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                    <Fieldset name='media_id' className='col-span-2 mt-4 mb-5'>
                        <DropzoneComponent
                            domain='product'
                            maxSize={1024 * 1024 * 60}
                            accept={{
                                'image/jpeg': [],
                                'image/png': [],
                                'image/webp': [],
                                'video/mp4': []
                            }}
                            onUpload={(data) => {
                                const mappedData = mapToSelectOptions(data?.data);

                                if (mappedData.length > 0) {
                                    // Accumulate all uploaded images
                                    setUploadedImages((prev) => [...prev, ...mappedData]);

                                    // Set the first image in formik for validation
                                    const firstImage = mappedData[0];
                                    formik.setFieldValue('media_id', firstImage.media_id || '');
                                    formik.setFieldValue('media_url', firstImage.media_url || '');
                                }
                            }}
                        />
                        {formik.touched.media_id && formik.errors.media_id && (
                            <div className='text-sm text-red-500'>{formik.errors.media_id}</div>
                        )}
                    </Fieldset>
                </div>
                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button loading={loading} disabled={loading} size='sm' type='submit'>
                        ثبت تغییرات
                    </Button>
                </div>
            </form>

            {Array.isArray(data?.data?.product?.gallery) &&
                data.data.product.gallery.map((media: Image, index: number) => (
                    <div key={index} className='mt-4 mb-4 flex items-center gap-4'>
                        <div className='relative flex-1 rounded-md border p-2'>
                            <div className='flex items-center justify-between'>
                                <div className='flex min-w-0 flex-1 flex-wrap items-center gap-3'>
                                    {media.url.endsWith('.mp4') ? (
                                        <video width={100} height={100} controls className='rounded'>
                                            <source src={media.url} type='video/mp4' />
                                            مرورگر شما از ویدئو پشتیبانی نمی‌کند
                                        </video>
                                    ) : (
                                        <Image
                                            key={index}
                                            src={media.url}
                                            alt={media.alt || media.media_id}
                                            width={100}
                                            height={100}
                                            className='rounded'
                                        />
                                    )}
                                    {!media.url.endsWith('.mp4') && (
                                        <GalleryAltField
                                            key={`${media.media_id}-${media.alt ?? ''}`}
                                            productId={id}
                                            media={media}
                                            onSaved={() => mutate()}
                                        />
                                    )}
                                </div>

                                <div className='flex items-center gap-3'>
                                    <button
                                        onClick={() =>
                                            deleteGallery({
                                                media_id: media.media_id,
                                                product_id: id
                                            })
                                        }
                                        className='rounded px-2 py-0.5 text-xs text-red-500'
                                        type='button'
                                    >
                                        <TrashIcon />
                                    </button>

                                    {media.is_primary ? (
                                        <span className='font-semibold text-green-600'>عکس اصلی</span>
                                    ) : (
                                        <Switch
                                            size='sm'
                                            checked={false}
                                            onChange={() =>
                                                updatePrimaryHandler({
                                                    media_id: media.media_id,
                                                    product_id: id
                                                })
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
        </>
    );
};

export default ProductGallery;
