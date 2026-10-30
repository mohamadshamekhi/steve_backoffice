'use client';
import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { TrashIcon } from 'libs/components/icons';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import TextArea from 'libs/ui/form/textArea';
import LoadingState from 'libs/ui/loadingState';
import { useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { normalizeTorobUrl, TOROB_URL_PATTERN } from './torob';

interface FaqItem {
    question: string;
    answer: string;
}

interface SeoFormModel {
    seo_title: string;
    seo_description: string;
    focus_keyword: string;
    faq: FaqItem[];
    torob_url: string;
}

interface ProductVariant {
    price: number;
}

// طول پیشنهادی گوگل؛ بیشتر از این در نتایج جستجو بریده می‌شود
const SEO_TITLE_MAX = 60;
const SEO_DESCRIPTION_MAX = 160;
// بیش از این درصد گران‌تر از کمترین قیمت ترب → قرمز
const PRICE_ALERT_PERCENT = 10;

const formatToman = (value: number) => `${value.toLocaleString('fa-IR')} تومان`;

const CharCounter = ({ length, max }: { length: number; max: number }) => (
    <span className={length > max ? 'text-error-500' : 'text-gray-400'}>
        {length.toLocaleString('fa-IR')} / {max.toLocaleString('fa-IR')}
    </span>
);

const validate = (values: SeoFormModel) => {
    const errors: Partial<Record<keyof SeoFormModel, string>> = {};
    if (values.torob_url && !TOROB_URL_PATTERN.test(values.torob_url)) {
        errors.torob_url = 'لینک ترب باید به شکل https://torob.com/p/<شناسه> باشد';
    }
    if (values.faq.some((f) => !f.question.trim() !== !f.answer.trim())) {
        errors.faq = 'برای هر سوال، هم متن سوال و هم پاسخ را وارد کنید (یا ردیف را حذف کنید)';
    }
    return errors;
};

const ProductSeo = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(false);
    const { isLoading, data, mutate } = useSWR(ApiKeys.GET_PRODUCT(id), (url: string) =>
        fetcher(url, 'dashboard', 'GET')
    );
    const product = data?.data?.product;

    const formik = useFormik<SeoFormModel>({
        enableReinitialize: true,
        initialValues: {
            seo_title: product?.seo_title || '',
            seo_description: product?.seo_description || '',
            focus_keyword: product?.focus_keyword || '',
            faq: product?.faq?.length ? product.faq : [],
            torob_url: product?.torob_url || ''
        },
        validate,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const res = await fetcher(ApiKeys.PATCH_PRODUCT(id), 'dashboard', 'PATCH', {
                    body: {
                        // بک‌اند در ویرایش محصول is_second_hand را اجباری می‌داند
                        is_second_hand: !!product?.is_second_hand,
                        seo_title: values.seo_title.trim(),
                        seo_description: values.seo_description.trim(),
                        focus_keyword: values.focus_keyword.trim(),
                        faq: values.faq
                            .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
                            .filter((f) => f.question && f.answer),
                        torob_url: values.torob_url
                    }
                });
                if (res?.success) {
                    await mutate();
                    toast.success('سئو و لینک ترب ذخیره شد');
                }
            } finally {
                setLoading(false);
            }
        }
    });

    if (isLoading) return <LoadingState />;

    const ourMinPrice = (product?.variants as ProductVariant[] | undefined)
        ?.map((v) => Number(v.price) || 0)
        .filter((p) => p > 0)
        .reduce((min, p) => (min === 0 || p < min ? p : min), 0);
    const competitorMin: number = product?.competitor_min_price || 0;
    const diffPercent =
        ourMinPrice && competitorMin ? Math.round(((ourMinPrice - competitorMin) / competitorMin) * 1000) / 10 : null;

    const setFaq = (faq: FaqItem[]) => formik.setFieldValue('faq', faq);

    return (
        <form onSubmit={formik.handleSubmit} className='space-y-8 pt-5 md:mt-5'>
            {/* ─── SEO ─── */}
            <section className='space-y-4'>
                <h3 className='text-base font-semibold text-gray-800 dark:text-white/90'>سئو</h3>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    <Fieldset
                        label='عنوان سئو (title)'
                        name='seo_title'
                        hint={
                            <span className='flex justify-between gap-2'>
                                <span>خالی بماند، نام محصول استفاده می‌شود.</span>
                                <CharCounter length={formik.values.seo_title.length} max={SEO_TITLE_MAX} />
                            </span>
                        }
                    >
                        <Input
                            name='seo_title'
                            value={formik.values.seo_title}
                            onChange={formik.handleChange}
                            placeholder={product?.name}
                            className='max-w-full!'
                        />
                    </Fieldset>
                    <Fieldset label='کلمه کلیدی اصلی' name='focus_keyword'>
                        <Input
                            name='focus_keyword'
                            value={formik.values.focus_keyword}
                            onChange={formik.handleChange}
                            placeholder='مثلاً قاب آیفون ۱۷'
                            className='max-w-full!'
                        />
                    </Fieldset>
                    <Fieldset
                        label='توضیحات متا (description)'
                        name='seo_description'
                        className='md:col-span-2'
                        hint={
                            <span className='flex justify-between gap-2'>
                                <span>خالی بماند، ابتدای توضیحات محصول استفاده می‌شود.</span>
                                <CharCounter length={formik.values.seo_description.length} max={SEO_DESCRIPTION_MAX} />
                            </span>
                        }
                    >
                        <TextArea
                            name='seo_description'
                            rows={3}
                            value={formik.values.seo_description}
                            onChange={formik.handleChange}
                        />
                    </Fieldset>
                </div>
            </section>

            {/* ─── FAQ ─── */}
            <section className='space-y-4'>
                <div className='flex items-center justify-between gap-2'>
                    <div>
                        <h3 className='text-base font-semibold text-gray-800 dark:text-white/90'>سوالات متداول</h3>
                        <p className='text-xs text-gray-400'>در صفحه‌ی محصول نمایش داده می‌شود و برای گوگل هم ارسال می‌شود.</p>
                    </div>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setFaq([...formik.values.faq, { question: '', answer: '' }])}
                    >
                        + افزودن سوال
                    </Button>
                </div>
                {formik.values.faq.length === 0 && (
                    <p className='rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-400 dark:border-gray-700'>
                        هنوز سوالی ثبت نشده است.
                    </p>
                )}
                {formik.values.faq.map((item, index) => (
                    <div
                        key={index}
                        className='space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-700/50 dark:bg-gray-800/60'
                    >
                        <div className='flex items-center gap-2'>
                            <span className='text-xs text-gray-400'>{(index + 1).toLocaleString('fa-IR')}</span>
                            <Input
                                name={`faq.${index}.question`}
                                value={item.question}
                                onChange={formik.handleChange}
                                placeholder='سوال'
                                className='max-w-full!'
                            />
                            <button
                                type='button'
                                title='حذف سوال'
                                onClick={() => setFaq(formik.values.faq.filter((_, i) => i !== index))}
                                className='shrink-0 rounded p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
                            >
                                <TrashIcon />
                            </button>
                        </div>
                        <TextArea
                            name={`faq.${index}.answer`}
                            rows={2}
                            value={item.answer}
                            onChange={formik.handleChange}
                            placeholder='پاسخ'
                        />
                    </div>
                ))}
                {typeof formik.errors.faq === 'string' && <div className='text-sm text-red-500'>{formik.errors.faq}</div>}
            </section>

            {/* ─── Torob ─── */}
            <section className='space-y-4'>
                <h3 className='text-base font-semibold text-gray-800 dark:text-white/90'>ترب و قیمت رقبا</h3>
                <Fieldset
                    label='لینک ترب'
                    name='torob_url'
                    touched={{ torob_url: true }}
                    errors={formik.errors.torob_url ? { torob_url: formik.errors.torob_url } : {}}
                    hint='لینک صفحه‌ی محصول در ترب را کپی کنید؛ خودکار به شکل استاندارد درمی‌آید. خالی = حذف لینک.'
                >
                    <Input
                        name='torob_url'
                        dir='ltr'
                        value={formik.values.torob_url}
                        onChange={(e) => formik.setFieldValue('torob_url', normalizeTorobUrl(e.target.value))}
                        placeholder='https://torob.com/p/…'
                        error={Boolean(formik.errors.torob_url)}
                        className='max-w-full! text-left'
                    />
                </Fieldset>

                <div className='rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700/50 dark:bg-gray-800/60'>
                    <div className='mb-3 flex items-center justify-between gap-2'>
                        <span className='text-sm font-semibold text-gray-700 dark:text-gray-300'>آخرین بررسی ترب</span>
                        <span className='text-xs text-gray-400'>فقط‌خواندنی — توسط ایجنت قیمت به‌روز می‌شود</span>
                    </div>
                    {product?.competitor_checked_at ? (
                        <dl className='grid grid-cols-2 gap-3 text-sm md:grid-cols-5'>
                            <div>
                                <dt className='text-xs text-gray-400'>کمترین قیمت ترب</dt>
                                <dd className='font-medium text-gray-800 dark:text-gray-200'>{formatToman(competitorMin)}</dd>
                            </div>
                            <div>
                                <dt className='text-xs text-gray-400'>بیشترین قیمت ترب</dt>
                                <dd className='font-medium text-gray-800 dark:text-gray-200'>
                                    {formatToman(product.competitor_max_price || 0)}
                                </dd>
                            </div>
                            <div>
                                <dt className='text-xs text-gray-400'>تعداد فروشنده</dt>
                                <dd className='font-medium text-gray-800 dark:text-gray-200'>
                                    {(product.competitor_offers_count || 0).toLocaleString('fa-IR')}
                                </dd>
                            </div>
                            <div>
                                <dt className='text-xs text-gray-400'>تاریخ بررسی</dt>
                                <dd className='font-medium text-gray-800 dark:text-gray-200'>
                                    {new Date(product.competitor_checked_at).toLocaleString('fa-IR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </dd>
                            </div>
                            <div>
                                <dt className='text-xs text-gray-400'>اختلاف با قیمت ما</dt>
                                <dd
                                    className={
                                        diffPercent === null
                                            ? 'text-gray-400'
                                            : diffPercent > PRICE_ALERT_PERCENT
                                              ? 'text-error-600 font-bold'
                                              : diffPercent > 0
                                                ? 'font-medium text-gray-800 dark:text-gray-200'
                                                : 'text-success-600 font-medium'
                                    }
                                    title={ourMinPrice ? `کمترین قیمت ما: ${formatToman(ourMinPrice)}` : undefined}
                                >
                                    {diffPercent === null
                                        ? '—'
                                        : diffPercent === 0
                                          ? 'برابر'
                                          : `${Math.abs(diffPercent).toLocaleString('fa-IR')}٪ ${diffPercent > 0 ? 'گران‌تر' : 'ارزان‌تر'}`}
                                </dd>
                            </div>
                        </dl>
                    ) : (
                        <p className='text-sm text-gray-400'>
                            {formik.values.torob_url ? 'هنوز توسط ایجنت قیمت بررسی نشده است.' : 'برای این محصول لینک ترب ثبت نشده است.'}
                        </p>
                    )}
                </div>
            </section>

            <div className='flex items-center justify-end gap-2'>
                <Button loading={loading} disabled={loading} size='sm' type='submit'>
                    ثبت تغییرات
                </Button>
            </div>
        </form>
    );
};

export default ProductSeo;
