'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ProductKindChannels from 'libs/components/pages/product/kindChannels';
import ServicePriceField from 'libs/components/pages/product/priceField';
import { ProductKind, SalesChannel } from 'libs/models/warehouse.model';
import { Button, Input, Switch } from 'libs/ui';
import Tiptap from 'libs/ui/form/editor';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import LoadingState from 'libs/ui/loadingState';
import AsyncSelectInput from 'libs/ui/select/AsyncSelectInput';
import { productValidationSchema } from 'libs/validator/schemas/product.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';
export interface ProductModel {
    name: string;
    en_title: string;
    brand_id: string;
    category_id: string;
    description: string;
    is_second_hand: boolean;
    kind: ProductKind;
    sales_channels: SalesChannel[];
    /** فقط برای خدمات؛ قیمت کالا روی واریانت است */
    price: number;
}
const ProductBaseInformation = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState<boolean>(false);

    const { isLoading, data, mutate } = useSWR(ApiKeys.GET_PRODUCT(id), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );

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

    const formik = useFormik<ProductModel>({
        enableReinitialize: true,

        initialValues: {
            name: data?.data?.product.name || '',
            en_title: data?.data?.product.en_title || '',
            brand_id: data?.data?.product?.brand?.id || '',
            category_id: data?.data?.product?.category?.id || '',
            description: data?.data?.product?.description || '',
            is_second_hand: data?.data?.product.is_second_hand,
            kind: (data?.data?.product?.kind as ProductKind) || 'physical',
            // Legacy products have no sales_channels; the backend treats that as both channels.
            sales_channels: (data?.data?.product?.sales_channels?.length
                ? data.data.product.sales_channels
                : ['website', 'in_person']) as SalesChannel[],
            price: Number(data?.data?.product?.price ?? 0)
        },
        validationSchema: toFormikValidationSchema(productValidationSchema),
        onSubmit: async (values: ProductModel) => {
            try {
                setLoading(true);
                const isService = values.kind === 'service';
                // خدمت برند/دسته‌بندی ندارد و قیمتش مستقیم روی محصول ویرایش می‌شود (بدون واریانت).
                const { price, brand_id, category_id, ...rest } = values;
                const { status } = await fetcher(ApiKeys.PATCH_PRODUCT(id), 'dashboard', 'PATCH', {
                    body: isService ? { ...rest, price } : { ...rest, brand_id, category_id }
                });

                if (status !== 400) {
                    await mutate();
                    toast.success(isService ? 'خدمت با موفقیت ویرایش شد' : ' محصول با موفقیت ویرایش شد');
                    // router.push('/dashboard/product');
                }

                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    if (isLoading) return <LoadingState />;

    return (
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
                {formik.values.kind !== 'service' && (
                    <>
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
                                initialOption={
                                    data?.data?.product?.category
                                        ? {
                                              value: data.data.product.category.id,
                                              label: data.data.product.category.name
                                          }
                                        : null
                                }
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
                                initialOption={
                                    data?.data?.product?.brand
                                        ? {
                                              value: data.data.product.brand.id,
                                              label: data.data.product.brand.name
                                          }
                                        : null
                                }
                            />
                        </Fieldset>
                        <Fieldset
                            label='دسته دوم'
                            name='is_second_hand'
                            touched={formik.touched}
                            errors={formik.errors}
                            className='col-span-2 w-full md:col-span-1'
                        >
                            <Switch
                                size='md'
                                variant='primary'
                                name='is_second_hand'
                                checked={formik.values.is_second_hand}
                                onChange={(checked) => {
                                    formik.setFieldValue('is_second_hand', checked);
                                }}
                                disabled={formik.values.is_second_hand}
                            />
                        </Fieldset>
                    </>
                )}

                {formik.values.kind === 'service' && (
                    <ServicePriceField
                        value={formik.values.price || ''}
                        onChange={(value) => formik.setFieldValue('price', value)}
                        touched={formik.touched}
                        errors={formik.errors}
                    />
                )}

                <ProductKindChannels
                    kind={formik.values.kind}
                    salesChannels={formik.values.sales_channels}
                    onKindChange={(kind) => formik.setFieldValue('kind', kind)}
                    onChannelsChange={(channels) => formik.setFieldValue('sales_channels', channels)}
                    error={formik.errors.sales_channels as string | undefined}
                />

                <Fieldset
                    label='توضیحات'
                    name='description'
                    touched={formik.touched}
                    errors={formik.errors}
                    className='col-span-2 w-full'
                >
                    <Tiptap
                        content={formik.values.description}
                        onChange={(newContent) => {
                            formik.setFieldValue('description', newContent);
                        }}
                    />
                </Fieldset>
            </div>
            <div className='mt-5 flex items-center justify-end gap-2'>
                <Button loading={loading} disabled={loading} size='sm' type='submit'>
                    ثبت تغییرات
                </Button>
            </div>
        </form>
    );
};

export default ProductBaseInformation;
