/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import TextArea from 'libs/ui/form/textArea';
import { Modal } from 'libs/ui/modal';
import { brandEditValidationSchema } from 'libs/validator/schemas/brand.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

type Brand = {
    id: string;
    name: string;
    description: string;
    slug?: string;
    url: string;
};

interface ActionCellProps {
    data: Brand;
    onClose: () => void;
    isOpen: boolean;
    onUpdated: () => void;
}

const Edit = ({ onClose, data, onUpdated, isOpen }: ActionCellProps) => {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            name: data.name,
            description: data.description,
            slug: data.slug ?? '',
            media_id: null
        },
        validationSchema: toFormikValidationSchema(brandEditValidationSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);

                const payload: Record<string, any> = {
                    name: values.name,
                    description: values.description,
                    slug: values.slug
                };

                if (!payload.slug) {
                    delete payload.slug;
                }

                if (values.media_id) {
                    payload.media_id = values.media_id;
                }

                const { status } = await fetcher(ApiKeys.PATCH_BRAND(data.id), 'dashboard', 'PATCH', { body: payload });

                if (status !== 400) {
                    onUpdated();
                    toast.success('برند با موفقیت ویرایش شد');
                    router.push('/dashboard/brand');
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
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                    <Fieldset
                        label='نام'
                        name='name'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='name'
                            type='text'
                            error={Boolean(formik.touched.name && formik.errors.name)}
                            onChange={formik.handleChange}
                            value={formik.values.name}
                        />
                    </Fieldset>

                    <Fieldset
                        label='اسلاگ (slug)'
                        name='slug'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='slug'
                            type='text'
                            dir='ltr'
                            placeholder='samsung'
                            error={Boolean(formik.touched.slug && formik.errors.slug)}
                            onChange={formik.handleChange}
                            value={formik.values.slug}
                        />
                    </Fieldset>

                    <Fieldset
                        label='توضیحات'
                        name='description'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full'
                    >
                        <TextArea
                            name='description'
                            error={Boolean(formik.touched.description && formik.errors.description)}
                            onChange={formik.handleChange}
                            value={formik.values.description}
                        />
                    </Fieldset>

                    <Fieldset name='media_id' className='col-span-2 mt-4 mb-5'>
                        <DropzoneComponent
                            domain='brand'
                            onUpload={(data) => {
                                formik.setFieldValue('media_id', data?.data?.id);
                            }}
                        />
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
