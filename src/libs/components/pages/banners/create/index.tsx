'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { BannerCreateModel } from 'libs/models';
import { Button, Input } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import SelectInput from 'libs/ui/select';
import { bannerValidationSchema } from 'libs/validator/schemas/banner.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
}

const locationOptions = [
    { label: 'بالا', value: 'top' },
    { label: 'وسط', value: 'middle' },
    { label: 'پایین', value: 'bottom' }
];

const Create = ({ isOpen, onClose, onCreated }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);
    const [clearDropzone, setClearDropzone] = useState<(() => void) | null>(null);

    const formik = useFormik<BannerCreateModel>({
        initialValues: {
            title: '',
            alt_text: '',
            link: '',
            location: 'top',
            media_id: '',
            sort_order: 1,
            is_active: true
        },

        validationSchema: toFormikValidationSchema(bannerValidationSchema),

        onSubmit: async (values) => {
            try {
                setLoading(true);
                const { status } = await fetcher(ApiKeys.POST_BANNER, 'dashboard', 'POST', {
                    body: values
                });

                if (status !== 400) {
                    toast.success('بنر با موفقیت اضافه شد');
                    onCreated();
                    onClose();
                    formik.resetForm();
                    setIsValid(false);
                    if (clearDropzone) clearDropzone();
                }

                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className='mb-4'>
                <h2 className='text-xl font-bold'>درج بنر جدید</h2>
            </div>
            <form className='grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-4' onSubmit={formik.handleSubmit}>
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
                        placeholder='عنوان بنر را وارد کنید'
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
                        placeholder='متن جایگزین برای تصویر'
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
                        placeholder='https://example.com'
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

                <Fieldset name='media_id' className='col-span-2 mt-2 mb-5' label='تصویر بنر'>
                    <DropzoneComponent
                        domain='product'
                        maxFiles={1}
                        onUpload={(data) => {
                            formik.setFieldValue('media_id', data?.data?.id);
                            setIsValid(true);
                        }}
                        onClearRequest={(clearFn) => setClearDropzone(() => clearFn)}
                    />
                    {formik.touched.media_id && formik.errors.media_id && (
                        <div className='text-sm text-red-500'>{formik.errors.media_id}</div>
                    )}
                </Fieldset>

                <div className='col-span-2 flex justify-end gap-2'>
                    <Button type='button' variant='outline' onClick={onClose} disabled={loading}>
                        لغو
                    </Button>
                    <Button disabled={loading || !isValid} loading={loading} size='sm' type='submit'>
                        افزودن
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default Create;
