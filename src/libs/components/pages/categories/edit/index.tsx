/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Button, Input } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import TextArea from 'libs/ui/form/textArea';
import LoadingState from 'libs/ui/loadingState';
import { Modal } from 'libs/ui/modal';
import SelectInput from 'libs/ui/select';
import { categoryEditValidationSchema } from 'libs/validator/schemas/category';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface CategoryEditFormValues {
    name: string;
    description: string;
    media_id: string | null;
    attribute_set_id: string;
    parent_id: string;
}

interface EditProps {
    id: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdated: () => void;
}

const Edit = ({ id, onClose, onUpdated, isOpen }: EditProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    type InputItem = { id: string; name: string };
    type OutputItem = { value: string; label: string };

    function mapToSelectOptions(items: InputItem[]): OutputItem[] {
        return items.map((item) => ({
            value: item.id,
            label: item.name
        }));
    }

    const { isLoading: categoryDetailLoading, data: categoryDetail } = useSWR(
        isOpen ? ApiKeys.GET_CATEGORY(id) : null,
        (url: string) => fetcher(url, 'dashboard', 'GET'),
        { revalidateOnFocus: false }
    );

    const { isLoading: attributeLoading, data: attributeData } = useSWR(
        ApiKeys.GET_ALL_ATTRIBUTE(1, 100),
        (url: string) => fetcher(url, 'dashboard', 'GET')
    );

    // const { isLoading: categoryLoading, data: categoryData } = useSWR([ApiKeys.GET_ALL_CATEGORY], () =>
    //     fetcher(ApiKeys.GET_ALL_CATEGORY, 'dashboard', 'GET', {
    //         params: {
    //             page_number: 1,
    //             page_size: 100
    //         }
    //     })
    // );

    const category = categoryDetail?.data?.category;

    const formik = useFormik<CategoryEditFormValues>({
        enableReinitialize: true,
        initialValues: {
            name: category?.name ?? '',
            description: category?.description ?? '',
            media_id: null as string | null,
            attribute_set_id: category?.attribute_set?.[0]?.id ?? '',
            parent_id: category?.parent_id ?? ''
        },

        validationSchema: toFormikValidationSchema(categoryEditValidationSchema),

        onSubmit: async (values) => {
            try {
                setLoading(true);

                const payload: Record<string, any> = {
                    name: values.name,
                    description: values.description
                };

                if (values.media_id) {
                    payload.media_id = values.media_id;
                }
                if (values.attribute_set_id) {
                    payload.attribute_set_id = values.attribute_set_id;
                }
                if (values.parent_id) {
                    payload.parent_id = values.parent_id;
                }

                const { status } = await fetcher(ApiKeys.PATCH_CATEGORY(id), 'dashboard', 'PATCH', {
                    body: payload
                });

                if (status !== 400) {
                    onUpdated();
                    toast.success('دسته بندی با موفقیت ویرایش شد');
                    router.push('/dashboard/category');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[700px]'>
            {categoryDetailLoading ? (
                <div className='flex min-h-[200px] items-center justify-center'>
                    <LoadingState />
                </div>
            ) : (
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

                        {/* <Fieldset
                            label='نام سرگروه'
                            name='parent_id'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='col-span-2 w-full md:col-span-1'
                        >
                            <SelectInput
                                isLoading={categoryLoading}
                                name='parent_id'
                                options={
                                    categoryData?.data?.categories
                                        ? mapToSelectOptions(categoryData?.data?.categories)
                                        : []
                                }
                                value={formik.values.parent_id ?? ''}
                                error={Boolean(formik.touched.parent_id && formik.errors.parent_id)}
                                onChange={(val) => formik.setFieldValue('parent_id', val)}
                            />
                        </Fieldset> */}

                        <Fieldset
                            label='ویژگی'
                            name='attribute_set_id'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='md:col-span-1'
                        >
                            <SelectInput
                                isLoading={attributeLoading}
                                name='attribute_set_id'
                                options={
                                    attributeData?.data?.attributes
                                        ? mapToSelectOptions(attributeData?.data?.attributes)
                                        : []
                                }
                                value={formik.values.attribute_set_id ?? ''}
                                error={Boolean(formik.touched.attribute_set_id && formik.errors.attribute_set_id)}
                                onChange={(val) => formik.setFieldValue('attribute_set_id', val)}
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

                        <Fieldset name='media' className='col-span-2 mt-4 mb-5'>
                            <DropzoneComponent
                                domain='category'
                                defaultImage={category?.url}
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

                        <Button loading={loading} disabled={loading} size='sm' type='submit'>
                            ثبت تغییرات
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default Edit;
