'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input, Switch } from 'libs/ui';
import Tiptap from 'libs/ui/form/editor';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import AsyncSelectInput from 'libs/ui/select/AsyncSelectInput';
import { productValidationSchema } from 'libs/validator/schemas/product.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

const Create = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const formik = useFormik({
        initialValues: {
            name: '',
            en_title: '',
            brand_id: '',
            category_id: '',
            description: '',
            is_second_hand: false
        },
        validationSchema: toFormikValidationSchema(productValidationSchema),

        onSubmit: async (values) => {
            setLoading(true);
            try {
                const { status } = await fetcher(ApiKeys.POST_PRODUCT, 'dashboard', 'POST', {
                    body: {
                        ...values
                    }
                });
                if (status !== 400) {
                    toast.success('محصول با موفقیت اضافه شد');
                    router.push('/dashboard/product');
                }
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    const [content, setContent] = useState(formik.values.description);

    const loadBrandOptions = async (inputValue: string) => {
        try {
            const response = await fetcher(ApiKeys.GET_ALL_BRAND, 'dashboard', 'GET', {
                params: {
                    page_number: 1,
                    page_size: 100,
                    ...(inputValue && { name: inputValue })
                }
            });

            if (response?.data?.brands) {
                return response.data.brands.map((brand: { id: string; name: string }) => ({
                    value: brand.id,
                    label: brand.name
                }));
            }
            return [];
        } catch (error) {
            console.error('Error loading brands:', error);
            return [];
        }
    };

    const loadCategoryOptions = async (inputValue: string) => {
        try {
            const response = await fetcher(ApiKeys.GET_ALL_CATEGORY, 'dashboard', 'GET', {
                params: {
                    page_number: 1,
                    page_size: 100,
                    ...(inputValue && { name: inputValue })
                }
            });

            if (response?.data?.categories) {
                return response.data.categories.map((category: { id: string; name: string }) => ({
                    value: category.id,
                    label: category.name
                }));
            }
            return [];
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    };

    return (
        <ContentWrapper title='درج محصول'>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-3'>
                    <Fieldset
                        label='نام محصول'
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
                        label='نام انگلیسی محصول'
                        name='en_title'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='en_title'
                            type='text'
                            error={Boolean(formik.touched.en_title && formik.errors.en_title)}
                            onChange={formik.handleChange}
                            value={formik.values.en_title}
                        />
                    </Fieldset>
                    <Fieldset
                        label='دسته بندی'
                        name='category_id'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <AsyncSelectInput
                            name='category_id'
                            loadOptions={loadCategoryOptions}
                            value={formik.values.category_id}
                            error={Boolean(formik.touched.category_id && formik.errors.category_id)}
                            onChange={(val) => formik.setFieldValue('category_id', val)}
                        />
                    </Fieldset>
                    <Fieldset
                        label='برند'
                        name='brand_id'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='md:col-span-1'
                    >
                        <AsyncSelectInput
                            name='brand_id'
                            loadOptions={loadBrandOptions}
                            value={formik.values.brand_id}
                            error={Boolean(formik.touched.brand_id && formik.errors.brand_id)}
                            onChange={(val) => formik.setFieldValue('brand_id', val)}
                        />
                    </Fieldset>
                    {/* <Fieldset
                        label='برند'
                        name='brand_id'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <CSelect
                            name='brand_id'
                            options={brandOption}
                            value={formik.values.brand_id}
                            onChange={(value) => {
                                if (Array.isArray(value)) {
                                    console.log(value);
                                    formik.setFieldValue(
                                        'brand_id',
                                        value.map((v) => v.value)
                                    );
                                } else {
                                    formik.setFieldValue('brand_id', value?.value ?? '');
                                }
                            }}
                        />
                    </Fieldset> */}
                    <Fieldset
                        label='دسته دوم'
                        name='is_second_hand'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Switch
                            checked={formik.values.is_second_hand}
                            onChange={(checked) => {
                                formik.setFieldValue('is_second_hand', checked);
                            }}
                            size='md'
                            variant='primary'
                            name='is-second_hand'
                        />
                    </Fieldset>

                    <Fieldset
                        label='توضیحات'
                        name='description'
                        touched={formik.touched}
                        errors={formik.errors}
                        className='col-span-2 w-full'
                    >
                        <Tiptap
                            content={content}
                            onChange={(newContent) => {
                                setContent(newContent);
                                formik.setFieldValue('description', newContent);
                            }}
                        />
                    </Fieldset>
                </div>
                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button loading={loading} disabled={loading} size='sm' type='submit'>
                        افزودن
                    </Button>
                </div>
            </form>
        </ContentWrapper>
    );
};

export default Create;
