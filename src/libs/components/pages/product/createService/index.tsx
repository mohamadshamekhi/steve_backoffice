'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import ProductKindChannels from 'libs/components/pages/product/kindChannels';
import ServicePriceField from 'libs/components/pages/product/priceField';
import ROUTES from 'libs/constants/routes/routes.constants';
import { SalesChannel } from 'libs/models/warehouse.model';
import { Button, Input, Tab } from 'libs/ui';
import Tiptap from 'libs/ui/form/editor';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { serviceValidationSchema } from 'libs/validator/schemas/product.schema';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { toFormikValidationSchema } from 'zod-formik-adapter';
import ProductGallery from '../edit/productTab/gallery';

/**
 * Dedicated form for services (repairs, Apple ID setup, ...).
 * Same endpoint as a product, but `kind` is fixed to `service` and the
 * stock-related fields are never shown — the backend forces stock_mode to `none`.
 * قیمت همین‌جا گرفته می‌شود؛ بک‌اند واریانت قیمت را خودش می‌سازد.
 * با `id` در حالت ویرایش کار می‌کند (PATCH /product/:id).
 */
const ServiceForm = ({ id }: { id?: string }) => {
    const router = useRouter();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState<boolean>(false);
    const [content, setContent] = useState('');

    const { data, isLoading, mutate } = useSWR(id ? ApiKeys.GET_PRODUCT(id) : null, (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );
    const product = data?.data?.product;

    useEffect(() => {
        if (product?.description) setContent(product.description);
    }, [product?.description]);

    const formik = useFormik<{
        name: string;
        en_title: string;
        description: string;
        kind: 'service';
        sales_channels: SalesChannel[];
        price: number;
    }>({
        enableReinitialize: true,
        initialValues: {
            name: product?.name ?? '',
            en_title: product?.en_title ?? '',
            description: product?.description ?? '',
            kind: 'service',
            // Services are usually sold at the counter only.
            sales_channels: product?.sales_channels?.length ? product.sales_channels : ['in_person'],
            price: Number(product?.price ?? 0)
        },
        validationSchema: toFormikValidationSchema(serviceValidationSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                if (id) {
                    const response = await fetcher(ApiKeys.PATCH_PRODUCT(id), 'dashboard', 'PATCH', { body: values });
                    if (response?.success) {
                        toast.success('خدمت با موفقیت ویرایش شد.');
                        mutate();
                    }
                    return;
                }

                const response = await fetcher(ApiKeys.POST_PRODUCT, 'dashboard', 'POST', {
                    // بک‌اند is_second_hand را برای هر محصولی الزامی می‌داند؛ خدمات هیچ‌وقت دست‌دوم نیست.
                    body: { ...values, is_second_hand: false }
                });

                const newId = response?.data?.product?.id;

                if (response?.success) {
                    toast.success('خدمت با موفقیت ثبت شد و آماده‌ی فروش است.');
                    router.push(newId ? ROUTES.EditService(newId) : ROUTES.Products);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    });

    const form = (
        <>
            <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                خدمات مثل تعمیر یا ساخت اپل‌آیدی نه موجودی دارند و نه ارسال. قیمت را همین‌جا وارد کنید؛ بعد از ثبت، خدمت
                بلافاصله قابل فروش است و نیازی به تعریف واریانت ندارد.
            </p>

            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-y-2 pt-5 md:mt-5 md:grid-cols-2 md:gap-3'>
                    <Fieldset
                        label='نام خدمت'
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
                        label='نام انگلیسی خدمت'
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

                    <ServicePriceField
                        value={formik.values.price || ''}
                        onChange={(price) => formik.setFieldValue('price', price)}
                        touched={formik.touched}
                        errors={formik.errors}
                    />

                    <ProductKindChannels
                        kind={formik.values.kind}
                        salesChannels={formik.values.sales_channels}
                        onKindChange={() => undefined}
                        onChannelsChange={(channels) => formik.setFieldValue('sales_channels', channels)}
                        error={formik.errors.sales_channels as string | undefined}
                        lockedKindNote='این فرم مخصوص «خدمات» است؛ موجودی و ارسال برای آن ثبت نمی‌شود. برای کالای فیزیکی از صفحه‌ی «درج محصولات» استفاده کنید.'
                    />

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
                        {isEdit ? 'ذخیره تغییرات' : 'افزودن خدمت'}
                    </Button>
                </div>
            </form>
        </>
    );

    if (!id) return <ContentWrapper title='درج خدمات'>{form}</ContentWrapper>;

    return (
        <ContentWrapper title='ویرایش خدمت'>
            {isLoading ? (
                <p className='py-10 text-center text-sm text-gray-500'>در حال بارگذاری...</p>
            ) : (
                <Tab
                    tabs={[
                        { id: 1, label: 'مشخصات خدمت', content: form },
                        { id: 2, label: 'گالری', content: <ProductGallery id={id} /> }
                    ]}
                />
            )}
        </ContentWrapper>
    );
};

export default ServiceForm;
