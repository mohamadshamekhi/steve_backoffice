'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import DeleteModal from 'libs/components/common/DeleteModal/DeleteModal';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import ProductVariantPicker from 'libs/components/common/productVariantPicker';
import SupplierSelect from 'libs/components/pages/supplier/select';
import ROUTES from 'libs/constants/routes/routes.constants';
import { formatToman, PURCHASE_CONFIRM, toIsoDate } from 'libs/constants/warehouse/warehouse.constants';
import { usePermission } from 'libs/hooks/usePermission';
import { IPurchase } from 'libs/models/warehouse.model';
import { Button, DatePicker, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { purchaseValidationSchema } from 'libs/validator/schemas/warehouse.schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DateObject } from 'react-multi-date-picker';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface IProps {
    /** When provided the form edits an existing draft purchase instead of creating one. */
    purchase?: IPurchase | null;
}

interface ItemDraft {
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_cost: number;
    add_to_stock: boolean;
}

const emptyItem: ItemDraft = {
    product_id: '',
    variant_id: '',
    quantity: 1,
    unit_cost: 0,
    add_to_stock: true
};

const PurchaseForm = ({ purchase }: IProps) => {
    const router = useRouter();
    const canConfirm = usePermission(PURCHASE_CONFIRM);
    const isEdit = Boolean(purchase?.id);
    const [loading, setLoading] = useState(false);
    const [purchaseDate, setPurchaseDate] = useState<DateObject | null>(
        purchase?.purchased_at ? new DateObject(new Date(purchase.purchased_at)) : null
    );
    const [confirmOpen, setConfirmOpen] = useState(false);

    const formik = useFormik<{
        supplier_id: string;
        invoice_number: string;
        items: ItemDraft[];
        paid_amount: number;
        note: string;
        order_id: string;
        purchased_at: string;
    }>({
        enableReinitialize: true,
        initialValues: {
            supplier_id: purchase?.supplier_id ?? '',
            invoice_number: purchase?.invoice_number ?? '',
            items: purchase?.items?.length
                ? purchase.items.map((item) => ({
                      product_id: item.product_id,
                      variant_id: item.variant_id,
                      quantity: item.quantity,
                      unit_cost: item.unit_cost,
                      add_to_stock: item.add_to_stock ?? true
                  }))
                : [{ ...emptyItem }],
            paid_amount: purchase?.paid_amount ?? 0,
            note: purchase?.note ?? '',
            order_id: purchase?.order_id ?? '',
            purchased_at: purchase?.purchased_at ? toIsoDate(purchase.purchased_at) : ''
        },
        validationSchema: toFormikValidationSchema(purchaseValidationSchema),
        onSubmit: async (values) => {
            await submit(values, false);
        }
    });

    // Fieldset expects a flat map; the items array is rendered with its own error markup.
    const fieldsetTouched = formik.touched as unknown as Record<string, boolean>;
    const fieldsetErrors = formik.errors as unknown as Record<string, string>;

    const total = formik.values.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_cost || 0),
        0
    );

    const submit = async (values: typeof formik.values, confirm: boolean) => {
        setLoading(true);
        try {
            const body = {
                supplier_id: values.supplier_id,
                ...(values.invoice_number && { invoice_number: values.invoice_number }),
                items: values.items.map((item) => ({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: Number(item.quantity),
                    unit_cost: Number(item.unit_cost),
                    add_to_stock: item.add_to_stock
                })),
                paid_amount: Number(values.paid_amount || 0),
                ...(values.note && { note: values.note }),
                ...(values.purchased_at && { purchased_at: values.purchased_at })
            };

            if (isEdit && purchase) {
                const response = await fetcher(ApiKeys.PATCH_PURCHASE(purchase.id), 'dashboard', 'PATCH', { body });
                if (!response?.success) return;

                if (confirm) {
                    const confirmed = await fetcher(
                        ApiKeys.POST_PURCHASE_CONFIRM(purchase.id),
                        'dashboard',
                        'POST'
                    );
                    if (!confirmed?.success) return;
                }

                toast.success(confirm ? 'فاکتور ویرایش و تأیید شد' : 'فاکتور خرید ویرایش شد');
                router.push(ROUTES.PurchaseDetail(purchase.id));
                return;
            }

            const response = await fetcher(ApiKeys.POST_PURCHASE, 'dashboard', 'POST', {
                body: {
                    ...body,
                    ...(values.order_id && { order_id: values.order_id }),
                    confirm
                }
            });

            if (response?.success) {
                toast.success(confirm ? 'فاکتور خرید ثبت و تأیید شد' : 'فاکتور خرید به‌عنوان پیش‌نویس ذخیره شد');
                const id = response?.data?.purchase?.id;
                router.push(id ? ROUTES.PurchaseDetail(id) : ROUTES.Purchases);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSubmit = async () => {
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
            formik.setTouched({ supplier_id: true, items: true, paid_amount: true } as never);
            toast.error('لطفاً خطاهای فرم را برطرف کنید');
            return;
        }
        setConfirmOpen(true);
    };

    const updateItem = (index: number, patch: Partial<ItemDraft>) => {
        const items = formik.values.items.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
        formik.setFieldValue('items', items);
    };

    const removeItem = (index: number) => {
        if (formik.values.items.length === 1) return;
        formik.setFieldValue(
            'items',
            formik.values.items.filter((_, idx) => idx !== index)
        );
    };

    const itemErrors = (index: number) => {
        const errors = formik.errors.items;
        if (!Array.isArray(errors)) return undefined;
        return errors[index] as Partial<Record<keyof ItemDraft, string>> | undefined;
    };

    return (
        <ContentWrapper title={isEdit ? 'ویرایش فاکتور خرید' : 'ثبت فاکتور خرید'}>
            <form onSubmit={formik.handleSubmit}>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
                    <Fieldset label='تأمین‌کننده' name='supplier_id' touched={fieldsetTouched} errors={fieldsetErrors}>
                        <SupplierSelect
                            value={formik.values.supplier_id}
                            error={Boolean(formik.touched.supplier_id && formik.errors.supplier_id)}
                            onChange={(value) => formik.setFieldValue('supplier_id', value)}
                        />
                    </Fieldset>

                    <Fieldset
                        label='شماره فاکتور'
                        name='invoice_number'
                        touched={fieldsetTouched}
                        errors={fieldsetErrors}
                    >
                        <Input
                            name='invoice_number'
                            value={formik.values.invoice_number}
                            onChange={formik.handleChange}
                        />
                    </Fieldset>

                    <Fieldset label='تاریخ خرید' name='purchased_at' touched={fieldsetTouched} errors={fieldsetErrors}>
                        <DatePicker
                            name='purchased_at'
                            value={purchaseDate ?? undefined}
                            onChange={(value) => {
                                setPurchaseDate(value);
                                formik.setFieldValue('purchased_at', value ? toIsoDate(value.toDate()) : '');
                            }}
                        />
                    </Fieldset>
                </div>

                <div className='mt-6'>
                    <div className='mb-2 flex items-center justify-between'>
                        <h4 className='text-sm font-medium text-gray-800 dark:text-white/90'>اقلام فاکتور</h4>
                        <Button
                            type='button'
                            size='sm'
                            variant='outline'
                            onClick={() => formik.setFieldValue('items', [...formik.values.items, { ...emptyItem }])}
                        >
                            افزودن قلم
                        </Button>
                    </div>

                    <div className='space-y-3'>
                        {formik.values.items.map((item, index) => {
                            const errors = itemErrors(index);

                            return (
                                <div
                                    key={index}
                                    className='rounded-xl border border-gray-200 p-3 dark:border-gray-800'
                                >
                                    <ProductVariantPicker
                                        productId={item.product_id}
                                        variantId={item.variant_id}
                                        initialProductOption={
                                            purchase?.items?.[index]?.product_name &&
                                            purchase.items[index].product_id === item.product_id
                                                ? {
                                                      value: item.product_id,
                                                      label: purchase.items[index].product_name as string
                                                  }
                                                : null
                                        }
                                        productError={Boolean(errors?.product_id)}
                                        variantError={Boolean(errors?.variant_id)}
                                        onChange={(value) => updateItem(index, value)}
                                    />

                                    <div className='mt-3 grid grid-cols-1 gap-3 md:grid-cols-4'>
                                        <div>
                                            <label className='mb-1 block text-xs text-gray-400'>تعداد</label>
                                            <Input
                                                name={`items.${index}.quantity`}
                                                type='number'
                                                min='1'
                                                inputMode='numeric'
                                                value={item.quantity}
                                                error={Boolean(errors?.quantity)}
                                                onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className='mb-1 block text-xs text-gray-400'>قیمت واحد (تومان)</label>
                                            <Input
                                                name={`items.${index}.unit_cost`}
                                                type='number'
                                                min='1'
                                                inputMode='numeric'
                                                value={item.unit_cost}
                                                error={Boolean(errors?.unit_cost)}
                                                onChange={(e) =>
                                                    updateItem(index, { unit_cost: Number(e.target.value) })
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className='mb-1 block text-xs text-gray-400'>جمع قلم</label>
                                            <p className='pt-2.5 text-sm font-medium text-gray-800 dark:text-white/90'>
                                                {formatToman(Number(item.quantity || 0) * Number(item.unit_cost || 0))}
                                            </p>
                                        </div>
                                        <div className='flex flex-col justify-center'>
                                            <label className='flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
                                                <input
                                                    type='checkbox'
                                                    checked={item.add_to_stock}
                                                    onChange={(e) =>
                                                        updateItem(index, { add_to_stock: e.target.checked })
                                                    }
                                                    className='accent-brand-500 h-4 w-4'
                                                />
                                                وارد انبار شود
                                            </label>
                                            <span className='mt-1 text-[11px] text-gray-400'>
                                                اگر این کالا را خریدید و مستقیم به مشتری تحویل دادید، تیک را بردارید.
                                            </span>
                                        </div>
                                    </div>

                                    {(errors?.product_id || errors?.variant_id || errors?.unit_cost) && (
                                        <p className='mt-2 text-xs text-red-500'>
                                            {errors?.product_id || errors?.variant_id || errors?.unit_cost}
                                        </p>
                                    )}

                                    {formik.values.items.length > 1 && (
                                        <div className='mt-3 flex justify-end'>
                                            <Button
                                                type='button'
                                                size='sm'
                                                variant='outline'
                                                className='text-error-500'
                                                onClick={() => removeItem(index)}
                                            >
                                                حذف قلم
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {typeof formik.errors.items === 'string' && (
                        <p className='mt-2 text-xs text-red-500'>{formik.errors.items}</p>
                    )}
                </div>

                <div className='mt-6 grid grid-cols-1 gap-3 md:grid-cols-3'>
                    <Fieldset
                        label='مبلغ پرداخت‌شده (تومان)'
                        name='paid_amount'
                        touched={fieldsetTouched}
                        errors={fieldsetErrors}
                        hint='مبلغی که تا این لحظه به تأمین‌کننده پرداخت کرده‌اید'
                    >
                        <Input
                            name='paid_amount'
                            type='number'
                            min='0'
                            inputMode='numeric'
                            value={formik.values.paid_amount}
                            error={Boolean(formik.touched.paid_amount && formik.errors.paid_amount)}
                            onChange={formik.handleChange}
                        />
                    </Fieldset>

                    {!isEdit && (
                        <Fieldset
                            label='شناسه سفارش مرتبط'
                            name='order_id'
                            touched={fieldsetTouched}
                            errors={fieldsetErrors}
                            hint='اگر این خرید مخصوص یک سفارش مشتری انجام شده'
                        >
                            <Input name='order_id' value={formik.values.order_id} onChange={formik.handleChange} />
                        </Fieldset>
                    )}

                    <Fieldset label='یادداشت' name='note' touched={fieldsetTouched} errors={fieldsetErrors}>
                        <Input name='note' value={formik.values.note} onChange={formik.handleChange} />
                    </Fieldset>
                </div>

                <div className='mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
                    <span className='text-sm text-gray-500'>جمع کل فاکتور</span>
                    <span className='text-lg font-bold text-gray-900 dark:text-white'>{formatToman(total)}</span>
                </div>

                <div className='mt-5 flex items-center justify-end gap-2'>
                    <Button type='submit' size='sm' variant='outline' loading={loading} disabled={loading}>
                        {isEdit ? 'ذخیره تغییرات' : 'ذخیره به‌عنوان پیش‌نویس'}
                    </Button>
                    <Button
                        type='button'
                        size='sm'
                        loading={loading}
                        disabled={loading || !canConfirm}
                        onClick={handleConfirmSubmit}
                    >
                        {isEdit ? 'ذخیره و تأیید' : 'ثبت و تأیید'}
                    </Button>
                </div>

                <DeleteModal
                    isOpen={confirmOpen}
                    loading={loading}
                    title='تأیید فاکتور خرید'
                    description='با تأیید فاکتور، کالاها وارد انبار می‌شوند و قیمت تمام‌شده‌ی محصولات به‌روز می‌شود. پس از تأیید، این فاکتور دیگر قابل ویرایش نیست و برای اصلاح باید آن را لغو و دوباره ثبت کنید.'
                    confirmText='ثبت و تأیید'
                    cancelText='انصراف'
                    onClose={() => setConfirmOpen(false)}
                    onDelete={async () => {
                        setConfirmOpen(false);
                        await submit(formik.values, true);
                    }}
                />

                {!canConfirm && (
                    <p className='mt-2 text-left text-xs text-gray-400'>
                        برای تأیید فاکتور به مجوز «تأیید فاکتور خرید» نیاز دارید.
                    </p>
                )}
            </form>
        </ContentWrapper>
    );
};

export default PurchaseForm;
