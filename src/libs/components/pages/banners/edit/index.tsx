/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { BannerModel } from 'libs/models';
import { Button, Input } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import SelectInput from 'libs/ui/select';
import { bannerEditValidationSchema } from 'libs/validator/schemas/banner.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface Props {
    data: BannerModel;
    onClose: () => void;
    isOpen: boolean;
    onUpdated: () => void;
}

const locationOptions = [
    { label: 'بالا', value: 'top' },
    { label: 'وسط', value: 'middle' },
    { label: 'پایین', value: 'bottom' }
];

const Edit = ({ onClose, data, onUpdated, isOpen }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [clearDropzone, setClearDropzone] = useState<(() => void) | null>(null);

    const formik = useFormik({
        initialValues: {
            title: data.title,
            alt_text: data.alt_text,
            link: data.link,
            location: data.location,
            sort_order: data.sort_order,
            is_active: data.is_active,
            media_id: null
        },
        validationSchema: toFormikValidationSchema(bannerEditValidationSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const payload: Record<string, any> = {};

                if (values.title !== data.title) payload.title = values.title;
                if (values.alt_text !== data.alt_text) payload.alt_text = values.alt_text;
                if (values.link !== data.link) payload.link = values.link;
                if (values.location !== data.location) payload.location = values.location;
                if (values.sort_order !== data.sort_order) payload.sort_order = values.sort_order;
                if (values.is_active !== data.is_active) payload.is_active = values.is_active;
                if (values.media_id) payload.media_id = values.media_id;

                const { status } = await fetcher(ApiKeys.PATCH_BANNER(data.id!), 'dashboard', 'PATCH', {
                    body: payload
                });

                if (status !== 400) {
                    onUpdated();
                    toast.success('بنر با موفقیت ویرایش شد');
                    onClose();
                    if (clearDropzone) clearDropzone();
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            <div className='mb-4'>
                <h2 className='text-xl font-bold'>ویرایش بنر</h2>
            </div>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-4'>
                    <Fieldset
                        label='عنوان'
                        name='title'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full'
                    >
                        <Input
                            name='title'
                            type='text'
                            error={Boolean(formik.touched.title && formik.errors.title)}
                            onChange={formik.handleChange}
                            value={formik.values.title}
                        />
                    </Fieldset>

                    <Fieldset
                        label='متن جایگزین (Alt Text)'
                        name='alt_text'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full'
                    >
                        <Input
                            name='alt_text'
                            type='text'
                            error={Boolean(formik.touched.alt_text && formik.errors.alt_text)}
                            onChange={formik.handleChange}
                            value={formik.values.alt_text}
                        />
                    </Fieldset>

                    <Fieldset
                        label='لینک'
                        name='link'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full'
                    >
                        <Input
                            name='link'
                            type='text'
                            error={Boolean(formik.touched.link && formik.errors.link)}
                            onChange={formik.handleChange}
                            value={formik.values.link}
                        />
                    </Fieldset>

                    <Fieldset
                        label='موقعیت'
                        name='location'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='w-full'
                    >
                        <SelectInput
                            name='location'
                            options={locationOptions}
                            value={formik.values.location}
                            onChange={(value) => formik.setFieldValue('location', value)}
                            error={Boolean(formik.touched.location && formik.errors.location)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='ترتیب نمایش'
                        name='sort_order'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='w-full'
                    >
                        <Input
                            name='sort_order'
                            type='number'
                            error={Boolean(formik.touched.sort_order && formik.errors.sort_order)}
                            onChange={(e) => formik.setFieldValue('sort_order', parseInt(e.target.value) || 1)}
                            value={formik.values.sort_order.toString()}
                        />
                    </Fieldset>

                    <Fieldset
                        label='وضعیت'
                        name='is_active'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 flex items-center gap-2'
                    >
                        <label className='flex cursor-pointer items-center gap-2'>
                            <input
                                type='checkbox'
                                name='is_active'
                                checked={formik.values.is_active}
                                onChange={formik.handleChange}
                                className='text-brand-500 focus:ring-brand-500 h-4 w-4 rounded border-gray-300 bg-gray-100'
                            />
                            <span className='text-sm text-gray-700 dark:text-gray-300'>بنر فعال باشد</span>
                        </label>
                    </Fieldset>

                    <Fieldset name='media_id' className='col-span-2 mt-4 mb-5' label='تصویر بنر (اختیاری)'>
                        <DropzoneComponent
                            domain='product'
                            onUpload={(uploadData) => {
                                formik.setFieldValue('media_id', uploadData?.data?.id);
                            }}
                            onClearRequest={(clearFn) => setClearDropzone(() => clearFn)}
                        />
                        <p className='mt-1 text-xs text-gray-500'>
                            در صورت آپلود تصویر جدید، تصویر قبلی جایگزین می‌شود
                        </p>
                    </Fieldset>
                </div>
                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button disabled={loading} size='sm' type='button' variant='outline' onClick={onClose}>
                        لغو
                    </Button>
                    <Button disabled={loading} loading={loading} size='sm' type='submit'>
                        ثبت تغییرات
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default Edit;
