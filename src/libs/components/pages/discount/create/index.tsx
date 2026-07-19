'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { AsyncSelectInput, Button, DatePicker, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import SelectInput from 'libs/ui/select';
import { persianToISOString } from 'libs/utilities/date';
import { discountSchema } from 'libs/validator/schemas/discount.schema';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface Product {
    id: string;
    name: string;
}

interface VariantAttribute {
    key: string;
    value: string;
    label: string;
    meta: string;
}

interface Variant {
    id: string;
    price: number;
    quantity: number;
    variant_attribute: VariantAttribute[];
    warranty: string;
}

interface ApplicableProduct {
    product_id: string;
    variant_id: string;
    discount_type: 'fixed_amount' | 'percentage';
    discount_value: number;
}

interface DiscountFormProps {
    code: string;
    type: string | 'fixed_amount' | 'percentage';
    value: number;
    expires_at: string;
    starts_at: string;
    minimum_purchase_amount?: number | null;
    total_usage_limit?: number | null;
    is_special?: boolean;
    is_active: boolean;
    applicable_product_ids: ApplicableProduct[];
}

const ProductItem = ({
    index,
    item,
    formik,
    loadProductOptions,
    selectedProductIds,
    setSelectedProductIds
}: {
    index: number;
    item: ApplicableProduct;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formik: any;
    loadProductOptions: (inputValue: string) => Promise<{ label: string; value: string }[]>;
    selectedProductIds: { [key: number]: string };
    setSelectedProductIds: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
}) => {
    const productId = selectedProductIds[index] || item.product_id;

    const { data: selectedProductData } = useSWR(productId ? ApiKeys.GET_PRODUCT(productId) : null, (url) =>
        fetcher(url, 'dashboard', 'GET')
    );

    return (
        <div className='grid grid-cols-1 gap-2 rounded border p-4 md:grid-cols-4'>
            <div>
                <label className='mb-1 block text-sm font-medium'>محصول</label>
                <AsyncSelectInput
                    placeholder='جستجوی محصول...'
                    name={`applicable_product_ids.${index}.product_id`}
                    value={item.product_id}
                    loadOptions={loadProductOptions}
                    onChange={(val) => {
                        formik.setFieldValue(`applicable_product_ids.${index}.product_id`, val);
                        setSelectedProductIds((prev) => ({ ...prev, [index]: val }));
                        formik.setFieldValue(`applicable_product_ids.${index}.variant_id`, '');
                    }}
                />
            </div>

            <div>
                <label className='mb-1 block text-sm font-medium'>ورینت</label>
                <SelectInput
                    placeholder='انتخاب ورینت'
                    name={`applicable_product_ids.${index}.variant_id`}
                    value={item.variant_id}
                    options={
                        selectedProductData?.data?.product?.variants
                            ? selectedProductData.data.product.variants.map((v: Variant) => {
                                  const label = v.variant_attribute
                                      .map((attr) => `${attr.key}: ${attr.label}`)
                                      .join(', ');
                                  return {
                                      label: `${label} - قیمت: ${v.price.toLocaleString()} تومان`,
                                      value: v.id
                                  };
                              })
                            : []
                    }
                    onChange={(val) => formik.setFieldValue(`applicable_product_ids.${index}.variant_id`, val)}
                    isDisabled={!item.product_id}
                />
            </div>

            <div>
                <label className='mb-1 block text-sm font-medium'>نوع تخفیف</label>
                <SelectInput
                    placeholder='نوع تخفیف'
                    name={`applicable_product_ids.${index}.discount_type`}
                    value={item.discount_type}
                    options={[
                        { label: 'مقدار ثابت', value: 'fixed_amount' },
                        { label: 'درصدی', value: 'percentage' }
                    ]}
                    onChange={(val) => formik.setFieldValue(`applicable_product_ids.${index}.discount_type`, val)}
                />
            </div>

            <div>
                <label className='mb-1 block text-sm font-medium'>مقدار تخفیف</label>
                <div className='flex gap-2'>
                    <Input
                        name={`applicable_product_ids.${index}.discount_value`}
                        type='number'
                        onChange={formik.handleChange}
                        value={item.discount_value}
                        placeholder='مقدار'
                    />
                    <Button
                        type='button'
                        size='sm'
                        onClick={() => {
                            const newProducts = formik.values.applicable_product_ids.filter(
                                (_: ApplicableProduct, i: number) => i !== index
                            );
                            formik.setFieldValue('applicable_product_ids', newProducts);
                        }}
                    >
                        حذف
                    </Button>
                </div>
            </div>
        </div>
    );
};

const Create = () => {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);
    const [selectedProductIds, setSelectedProductIds] = useState<{ [key: number]: string }>({});

    const loadProductOptions = useCallback(async (inputValue: string) => {
        try {
            const response = await fetcher(ApiKeys.GET_ALL_PRODUCT, 'dashboard', 'GET', {
                params: {
                    page_number: 1,
                    page_size: 20,
                    name: inputValue
                }
            });
            return (
                response?.data?.products?.map((p: Product) => ({
                    label: p.name,
                    value: p.id
                })) || []
            );
        } catch {
            return [];
        }
    }, []);

    const formik = useFormik<DiscountFormProps>({
        initialValues: {
            code: '',
            value: 0,
            type: '',
            starts_at: '',
            expires_at: '',
            minimum_purchase_amount: null,
            total_usage_limit: null,
            is_special: false,
            is_active: false,
            applicable_product_ids: []
        },
        validationSchema: toFormikValidationSchema(discountSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const body: any = {
                    ...values,
                    starts_at: persianToISOString(values.starts_at),
                    expires_at: persianToISOString(values.expires_at),
                    applicable_to: 'products'
                };

                // Only include code if it has a value
                if (!values.code || values.code.trim() === '') {
                    delete body.code;
                }

                const { status } = await fetcher(ApiKeys.POST_DISCOUNT, 'dashboard', 'POST', { body });

                if (status !== 400) {
                    toast.success('تخفیف با موفقیت اضافه شد');
                    router.push('/dashboard/discount');
                }
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    });

    return (
        <ContentWrapper title='درج تخفیف'>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-2'>
                    <Fieldset
                        label='نوع تخفیف'
                        name='type'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='md:col-span-1'
                    >
                        <SelectInput
                            placeholder='لطفا انتخاب کنید'
                            name='type'
                            value={formik.values.type}
                            options={[
                                { label: 'مقدار ثابت', value: 'fixed_amount' },
                                { label: 'درصدی', value: 'percentage' }
                            ]}
                            error={Boolean(formik.touched.type && formik.errors.type)}
                            onChange={(val) => formik.setFieldValue('type', val)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='مقدار'
                        name='value'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='value'
                            type='number'
                            error={Boolean(formik.touched.value && formik.errors.value)}
                            onChange={formik.handleChange}
                            value={formik.values.value}
                        />
                    </Fieldset>

                    <Fieldset
                        label='کد تخفیف'
                        name='code'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='code'
                            type='text'
                            error={Boolean(formik.touched.code && formik.errors.code)}
                            onChange={formik.handleChange}
                            value={formik.values.code}
                            placeholder='اختیاری'
                        />
                    </Fieldset>

                    <Fieldset
                        label='حداقل مبلغ خرید'
                        name='minimum_purchase_amount'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='minimum_purchase_amount'
                            type='number'
                            error={Boolean(
                                formik.touched.minimum_purchase_amount && formik.errors.minimum_purchase_amount
                            )}
                            onChange={formik.handleChange}
                            value={formik.values.minimum_purchase_amount ?? ''}
                            placeholder='اختیاری'
                        />
                    </Fieldset>

                    <Fieldset
                        label='محدودیت تعداد استفاده'
                        name='total_usage_limit'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Input
                            name='total_usage_limit'
                            type='number'
                            error={Boolean(formik.touched.total_usage_limit && formik.errors.total_usage_limit)}
                            onChange={formik.handleChange}
                            value={formik.values.total_usage_limit ?? ''}
                            placeholder='اختیاری'
                        />
                    </Fieldset>

                    <Fieldset
                        label='زمان شروع'
                        name='starts_at'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <DatePicker
                            name='starts_at'
                            value={formik.values.starts_at}
                            showTime
                            onChange={(val) => {
                                formik.setFieldValue('starts_at', val ? val.format('YYYY-MM-DD HH:mm') : '');
                            }}
                        />
                    </Fieldset>

                    <Fieldset
                        label='زمان اتمام'
                        name='expires_at'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <DatePicker
                            name='expires_at'
                            value={formik.values.expires_at}
                            showTime
                            onChange={(val) => {
                                formik.setFieldValue('expires_at', val ? val.format('YYYY-MM-DD HH:mm') : '');
                            }}
                        />
                    </Fieldset>

                    <Fieldset
                        label='تخفیف ویژه'
                        name='is_special'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Switch
                            name='is_special'
                            checked={formik.values.is_special ?? false}
                            onChange={(checked) => formik.setFieldValue('is_special', checked)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='فعال'
                        name='is_active'
                        touched={formik.touched as { [key: string]: boolean }}
                        errors={formik.errors as { [key: string]: string | string[] }}
                        className='col-span-2 w-full md:col-span-1'
                    >
                        <Switch
                            name='is_active'
                            checked={formik.values.is_active}
                            onChange={(checked) => formik.setFieldValue('is_active', checked)}
                        />
                    </Fieldset>
                </div>

                {/* Products Section */}
                <div className='mt-8'>
                    <h3 className='mb-4 text-lg font-semibold'>محصولات قابل اعمال تخفیف</h3>
                    <div className='space-y-4'>
                        {formik.values.applicable_product_ids.map((item, index) => (
                            <ProductItem
                                key={index}
                                index={index}
                                item={item}
                                formik={formik}
                                loadProductOptions={loadProductOptions}
                                selectedProductIds={selectedProductIds}
                                setSelectedProductIds={setSelectedProductIds}
                            />
                        ))}

                        {formik.touched.applicable_product_ids && formik.errors.applicable_product_ids && (
                            <div className='text-sm text-red-500'>
                                {typeof formik.errors.applicable_product_ids === 'string'
                                    ? formik.errors.applicable_product_ids
                                    : 'لطفا اطلاعات محصولات را کامل کنید'}
                            </div>
                        )}

                        <Button
                            type='button'
                            size='sm'
                            onClick={() => {
                                formik.setFieldValue('applicable_product_ids', [
                                    ...formik.values.applicable_product_ids,
                                    { product_id: '', variant_id: '', discount_type: 'fixed_amount', discount_value: 0 }
                                ]);
                            }}
                        >
                            + افزودن محصول
                        </Button>
                    </div>
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
