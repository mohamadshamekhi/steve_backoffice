'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input } from 'libs/ui';
import DropzoneComponent from 'libs/ui/form/dropzone';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import TextArea from 'libs/ui/form/textArea';
import SelectInput from 'libs/ui/select';
import { categoryValidationSchema } from 'libs/validator/schemas/category';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';
interface CategoryFormValues {
    name: string;
    description: string;
    media_id: string;
    attribute_set_id?: string;
    parent_id?: string;
}

const Create = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean>(false);

    // TODO : GET Attributes and set to select input

    // Get Attributes

    const formik = useFormik<CategoryFormValues>({
        initialValues: {
            name: '',
            description: '',
            media_id: '',
            attribute_set_id: '',
            parent_id: ''
        },
        validationSchema: toFormikValidationSchema(categoryValidationSchema),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const body = { ...values };

                if (!body.attribute_set_id) {
                    delete body.attribute_set_id;
                }
                if (!body.parent_id) {
                    delete body.parent_id;
                }
                const { status } = await fetcher(ApiKeys.POST_CATEGORY, 'dashboard', 'POST', {
                    body
                });
                if (status !== 400) {
                    toast.success('دسته بندی با موفقیت اضافه شد');
                    router.push('/dashboard/category');
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    type InputItem = { id: string; name: string };

    type OutputItem = { value: string; label: string };

    function mapToSelectOptions(items: InputItem[]): OutputItem[] {
        return items.map((item) => ({
            value: item.id,
            label: item.name
        }));
    }

    const { isLoading, data } = useSWR(ApiKeys.GET_ALL_ATTRIBUTE(1, 100), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const { isLoading: categoryLoading, data: CategoryData } = useSWR([ApiKeys.GET_ALL_CATEGORY], () =>
        fetcher(ApiKeys.GET_ALL_CATEGORY, 'dashboard', 'GET', {
            params: {
                page_number: 1,
                page_size: 100
            }
        })
    );

    return (
        <ContentWrapper title='درج دسته بندی'>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 md:grid-cols-2 md:gap-2'>
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
                                CategoryData?.data?.categories ? mapToSelectOptions(CategoryData?.data?.categories) : []
                            }
                            value={formik.values.parent_id ?? ''}
                            error={Boolean(formik.touched.parent_id && formik.errors.parent_id)}
                            onChange={(val) => formik.setFieldValue('parent_id', val)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='ویژگی'
                        name='attribute_set_id'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='md:col-span-1'
                    >
                        <SelectInput
                            isLoading={isLoading}
                            name='attribute_set_id'
                            options={data?.data.attributes ? mapToSelectOptions(data?.data.attributes) : []}
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

                    <Fieldset name='media_id' className='col-span-2 mt-4 mb-5'>
                        <DropzoneComponent
                            domain='category'
                            onUpload={(data) => {
                                formik.setFieldValue('media_id', data?.data?.id);
                                setIsValid(true);
                            }}
                        />

                        {formik.touched.media_id && formik.errors.media_id && (
                            <div className='text-sm text-red-500'>{formik.errors.media_id}</div>
                        )}
                    </Fieldset>

                    <Button
                        disabled={loading || !isValid}
                        loading={loading}
                        size='sm'
                        type='submit'
                        className='col-span-2 mr-auto ml-0 w-fit'
                    >
                        افزودن
                    </Button>
                </div>
            </form>
        </ContentWrapper>
    );
};

export default Create;
