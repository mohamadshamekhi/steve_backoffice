'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { PAYMENT_METHOD_OPTIONS } from 'libs/constants/accounting/accounting.constants';
import { PaymentMethod } from 'libs/models/accounting.model';
import { ProductKind } from 'libs/models/warehouse.model';
import { AsyncSelectInput, Input } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { OrderProps, ShippingAddress, formatPrice, lineNet, variantLabel } from '../order.types';

interface Line {
    key: string;
    productId: string;
    variantId: string;
    name: string;
    variant: string;
    quantity: string;
    /** خالی = قیمت فعلی سطر / قیمت ورینت (سطر جدید کاتالوگ) */
    unitPrice: string;
    /** خالی = برای سطر موجود تخفیف فعلی به نسبت تعداد، برای سطر جدید بدون تخفیف */
    discount: string;
    isCustom: boolean;
    isNew: boolean;
    kind: ProductKind;
    unitCost: string;
}

type CashMode = 'default' | 'yes' | 'no';

const ADDRESS_FIELDS: { key: keyof ShippingAddress; label: string; wide?: boolean; ltr?: boolean }[] = [
    { key: 'title', label: 'عنوان' },
    { key: 'province', label: 'استان' },
    { key: 'city', label: 'شهر' },
    { key: 'postcode', label: 'کد پستی', ltr: true },
    { key: 'street', label: 'آدرس', wide: true }
];

const EMPTY_ADDRESS: ShippingAddress = { title: '', province: '', city: '', street: '', postcode: '' };

const labelClass = 'mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400';
const sectionClass = 'rounded-xl border border-gray-200 p-4 dark:border-gray-800';
const selectClass =
    'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white';

const toNum = (v: string) => (v.trim() === '' ? undefined : Number(v));
let seq = 0;
const newKey = () => `new-${++seq}`;

const toLines = (o: OrderProps): Line[] =>
    (o.items ?? []).map((it, i) => ({
        key: `${it.VariantID}-${i}`,
        productId: it.ProductID,
        variantId: it.VariantID,
        name: it.ProductName,
        variant: variantLabel(it),
        quantity: String(it.Quantity),
        unitPrice: String(it.PriceAtTime),
        discount: '',
        isCustom: !!it.IsCustom,
        isNew: false,
        kind: it.Kind || 'physical',
        unitCost: ''
    }));

interface Props {
    order: OrderProps | null;
    onClose: () => void;
    onSaved: () => void;
    /** 409: سفارش هم‌زمان تغییر کرده؛ والد باید سفارش تازه را بگیرد و دوباره به مودال بدهد */
    onConflict: () => void;
}

const EditOrderModal: React.FC<Props> = ({ order, onClose, onSaved, onConflict }) => (
    <Modal isOpen={!!order} onClose={onClose} containerClassName='max-w-[960px]'>
        {order && <EditOrderForm key={order.id + order.updated_at} order={order} onClose={onClose} onSaved={onSaved} onConflict={onConflict} />}
    </Modal>
);

const EditOrderForm: React.FC<Omit<Props, 'order'> & { order: OrderProps }> = ({ order, onClose, onSaved, onConflict }) => {
    const itemsLocked = order.status === 'cancelled' || order.status === 'refunded';
    const originalAddress = order.shipping_address ?? EMPTY_ADDRESS;
    const originalManual = order.manual_discount ?? 0;
    const originalShipping = order.shipping_amount ?? 0;

    const [reason, setReason] = useState('');
    const [userId, setUserId] = useState(order.user_id);
    const [address, setAddress] = useState<ShippingAddress>(originalAddress);
    const [shipping, setShipping] = useState(String(originalShipping));
    const [manual, setManual] = useState(String(originalManual));
    const [lines, setLines] = useState<Line[]>(() => toLines(order));
    const [itemsDirty, setItemsDirty] = useState(false);
    const [cashMode, setCashMode] = useState<CashMode>('default');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [saving, setSaving] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // انتخاب کالای جدید
    const [productId, setProductId] = useState('');
    const [productName, setProductName] = useState('');
    const [variants, setVariants] = useState<{ id: string; label: string }[]>([]);
    const [variantId, setVariantId] = useState('');
    const [loadingVariants, setLoadingVariants] = useState(false);

    const userOption = useMemo(
        () => ({
            value: order.user_id,
            label: [order.user_name, order.user_phone_number].filter(Boolean).join(' — ')
        }),
        [order.user_id, order.user_name, order.user_phone_number]
    );

    useEffect(() => {
        if (!productId) return;
        setLoadingVariants(true);
        fetcher(ApiKeys.GET_PRODUCT(productId), 'dashboard', 'GET')
            .then((res) => {
                const list = res?.data?.product?.variants ?? [];
                setProductName(res?.data?.product?.name ?? '');
                const opts = list.map((v: { id: string; variant_attribute?: { label: string }[] }, i: number) => ({
                    id: v.id,
                    label:
                        v.variant_attribute?.map((a) => a.label).join(' / ') ||
                        `ورینت ${(i + 1).toLocaleString('fa-IR')}`
                }));
                setVariants(opts);
                setVariantId(opts.length === 1 ? opts[0].id : '');
            })
            .finally(() => setLoadingVariants(false));
    }, [productId]);

    const loadUsers = async (q: string) => {
        const term = q.trim();
        const isPhone = /^[0-9۰-۹+]+$/.test(term);
        const res = await fetcher(ApiKeys.GET_ALL_USER, 'dashboard', 'GET', {
            params: { page_number: 1, page_size: 20, ...(term && (isPhone ? { phone_number: term } : { name: term })) }
        });
        return (res?.data?.users ?? []).map((u: { _id: string; name?: string; phone_number: string }) => ({
            value: u._id,
            label: [u.name, u.phone_number].filter(Boolean).join(' — ')
        }));
    };

    const loadProducts = async (q: string) => {
        const res = await fetcher(ApiKeys.GET_ALL_PRODUCT, 'dashboard', 'GET', {
            params: { page_number: 1, page_size: 20, ...(q && { name: q }) }
        });
        return (res?.data?.products ?? []).map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }));
    };

    const updateLine = (key: string, patch: Partial<Line>) => {
        setItemsDirty(true);
        setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
    };

    const removeLine = (key: string) => {
        setItemsDirty(true);
        setLines((prev) => prev.filter((l) => l.key !== key));
    };

    const addCatalogLine = () => {
        if (!variantId) return;
        if (lines.some((l) => !l.isCustom && l.variantId === variantId)) {
            toast.error('این ورینت در سفارش هست؛ تعدادش را زیاد کنید');
            return;
        }
        setItemsDirty(true);
        setLines((prev) => [
            ...prev,
            {
                key: newKey(),
                productId,
                variantId,
                name: productName,
                variant: variants.length > 1 ? variants.find((v) => v.id === variantId)?.label ?? '' : '',
                quantity: '1',
                unitPrice: '',
                discount: '',
                isCustom: false,
                isNew: true,
                kind: 'physical',
                unitCost: ''
            }
        ]);
        setProductId('');
        setVariants([]);
        setVariantId('');
    };

    const addCustomLine = () => {
        setItemsDirty(true);
        setLines((prev) => [
            ...prev,
            {
                key: newKey(),
                productId: '',
                variantId: '',
                name: '',
                variant: '',
                quantity: '1',
                unitPrice: '',
                discount: '',
                isCustom: true,
                isNew: true,
                kind: 'service',
                unitCost: '0'
            }
        ]);
    };

    // خطای هر سطر برای نمایش کنار همان فیلد
    const lineErrors = (l: Line): Partial<Record<'name' | 'quantity' | 'unitPrice' | 'discount', string>> => {
        const e: Partial<Record<'name' | 'quantity' | 'unitPrice' | 'discount', string>> = {};
        const qty = Number(l.quantity);
        if (!Number.isInteger(qty) || qty < 1) e.quantity = 'حداقل ۱';
        if (l.isCustom && l.isNew && !l.name.trim()) e.name = 'نام لازم است';
        if (l.isCustom && l.isNew && l.unitPrice.trim() === '') e.unitPrice = 'قیمت لازم است';
        const price = toNum(l.unitPrice);
        const disc = toNum(l.discount);
        if (disc !== undefined && price !== undefined && disc > price * qty) e.discount = 'بیشتر از مبلغ سطر';
        return e;
    };

    const hasLineErrors = itemsDirty && lines.some((l) => Object.keys(lineErrors(l)).length > 0);

    // برآورد: اختلاف با وضعیت فعلی روی مبلغ نهایی فعلی اعمال می‌شود؛ رقم قطعی را سرور حساب می‌کند
    const originalItemsNet = (order.items ?? []).reduce((s, it) => s + lineNet(it), 0);
    const newItemsNet = lines.reduce((s, l) => {
        const orig = order.items?.find((it) => !l.isNew && it.VariantID === l.variantId);
        const qty = Number(l.quantity) || 0;
        const price = toNum(l.unitPrice) ?? orig?.PriceAtTime ?? 0;
        const disc =
            toNum(l.discount) ??
            (orig && orig.Quantity ? Math.round(((orig.DiscountAmount || 0) * qty) / orig.Quantity) : 0);
        return s + price * qty - disc;
    }, 0);
    const hasUnknownPrice = lines.some((l) => l.isNew && !l.isCustom && l.unitPrice.trim() === '');
    const estimatedFinal =
        order.final_amount +
        (itemsDirty ? newItemsNet - originalItemsNet : 0) +
        ((toNum(shipping) ?? 0) - originalShipping) -
        ((toNum(manual) ?? 0) - originalManual);
    const difference = estimatedFinal - order.final_amount;

    const addressChanged = (Object.keys(EMPTY_ADDRESS) as (keyof ShippingAddress)[]).some(
        (k) => (address[k] ?? '') !== (originalAddress[k] ?? '')
    );

    const buildBody = () => {
        const body: Record<string, unknown> = { reason: reason.trim() };
        if (userId && userId !== order.user_id) body.user_id = userId;
        if (addressChanged) body.shipping_address = address;
        if ((toNum(shipping) ?? 0) !== originalShipping) body.shipping_amount = toNum(shipping) ?? 0;
        if ((toNum(manual) ?? 0) !== originalManual) body.manual_discount_amount = toNum(manual) ?? 0;
        if (itemsDirty && !itemsLocked) {
            body.items = lines.map((l) => {
                const common = {
                    quantity: Number(l.quantity),
                    ...(toNum(l.unitPrice) !== undefined && { unit_price: toNum(l.unitPrice) }),
                    ...(toNum(l.discount) !== undefined && { discount_amount: toNum(l.discount) })
                };
                if (l.isCustom && l.isNew)
                    return {
                        is_custom: true,
                        product_name: l.name.trim(),
                        kind: l.kind,
                        unit_cost: toNum(l.unitCost) ?? 0,
                        ...common
                    };
                if (l.isNew) return { product_id: l.productId, variant_id: l.variantId, ...common };
                return { variant_id: l.variantId, ...common };
            });
        }
        if (cashMode !== 'default') body.record_cash_difference = cashMode === 'yes';
        if (cashMode !== 'no') body.payment_method = paymentMethod;
        return body;
    };

    const reasonError = reason.trim().length < 3 ? 'دلیل ویرایش حداقل ۳ کاراکتر' : reason.length > 500 ? 'حداکثر ۵۰۰ کاراکتر' : '';

    const submit = async () => {
        setSubmitted(true);
        if (reasonError || hasLineErrors) return;
        const body = buildBody();
        if (Object.keys(body).filter((k) => !['reason', 'record_cash_difference', 'payment_method'].includes(k)).length === 0) {
            toast.error('تغییری ثبت نشده است');
            return;
        }
        if (itemsDirty && !lines.length) {
            toast.error('سفارش باید حداقل یک قلم داشته باشد');
            return;
        }
        setSaving(true);
        try {
            const res = await fetcher(ApiKeys.EDIT_ORDER(order.id), 'dashboard', 'PATCH', { body });
            if (res?.success) {
                toast.success('سفارش ویرایش شد');
                onSaved();
            } else if ((res as { status?: number })?.status === 409) {
                toast.warning('سفارش هم‌زمان تغییر کرده است؛ فرم با داده‌ی تازه پر شد', { toastId: 'order-edit-conflict' });
                onConflict();
            }
        } finally {
            setSaving(false);
        }
    };

    const isInStore = order.payments?.some((p) => p.gateway === 'in_person');

    return (
        <div className='mt-8 space-y-5'>
            <div className='flex flex-wrap items-center gap-3 border-b border-gray-200 pb-4 dark:border-gray-800'>
                <h2 className='text-xl font-bold text-gray-800 dark:text-white/90'>ویرایش سفارش</h2>
                <span dir='ltr' className='font-mono text-xs text-gray-400'>
                    #{order.id.slice(-6).toUpperCase()}
                </span>
            </div>

            <div className='rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'>
                اختلاف تعداد روی موجودی انبار و دفتر کالا اعمال می‌شود. شمارنده‌ی کد تخفیف، تعداد فروش محصول و پرداخت‌های درگاه تغییر نمی‌کنند.
            </div>

            <section className={sectionClass}>
                <h3 className='mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300'>مشتری</h3>
                <AsyncSelectInput
                    name='user_id'
                    value={userId}
                    initialOption={userOption}
                    onChange={(v) => setUserId(v || order.user_id)}
                    loadOptions={loadUsers}
                    placeholder='جستجو با نام یا موبایل'
                />
            </section>

            {!isInStore && (
                <section className={sectionClass}>
                    <h3 className='mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300'>آدرس ارسال</h3>
                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                        {ADDRESS_FIELDS.map((f) => (
                            <div key={f.key} className={f.wide ? 'sm:col-span-2 lg:col-span-4' : ''}>
                                <label htmlFor={`addr-${f.key}`} className={labelClass}>
                                    {f.label}
                                </label>
                                <Input
                                    id={`addr-${f.key}`}
                                    name={`addr-${f.key}`}
                                    dir={f.ltr ? 'ltr' : undefined}
                                    value={address[f.key] ?? ''}
                                    onChange={(e) => setAddress((a) => ({ ...a, [f.key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className={sectionClass}>
                <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
                    <h3 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>اقلام</h3>
                    {!itemsLocked && (
                        <button
                            type='button'
                            onClick={addCustomLine}
                            className='h-9 rounded-lg border border-dashed border-gray-300 px-3 text-xs text-gray-600 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                        >
                            + سطر دستی (خدمات / کالای بیرونی)
                        </button>
                    )}
                </div>

                {itemsLocked && (
                    <p className='mb-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/[0.03]'>
                        اقلام سفارش لغو یا مرجوع‌شده قابل ویرایش نیست؛ فقط مشتری، آدرس و مبالغ.
                    </p>
                )}

                <div className='space-y-3'>
                    {lines.map((l) => {
                        const errs = submitted ? lineErrors(l) : {};
                        const orig = order.items?.find((it) => !l.isNew && it.VariantID === l.variantId);
                        return (
                            <div
                                key={l.key}
                                className={`rounded-lg border p-3 ${
                                    l.isNew
                                        ? 'border-brand-200 bg-brand-50/40 dark:border-brand-500/30 dark:bg-brand-500/5'
                                        : 'border-gray-200 dark:border-gray-800'
                                }`}
                            >
                                <div className='mb-3 flex items-start justify-between gap-2'>
                                    <div className='min-w-0 flex-1'>
                                        {l.isCustom && l.isNew ? (
                                            <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                                                <div className='sm:col-span-2'>
                                                    <label htmlFor={`${l.key}-name`} className={labelClass}>
                                                        نام سطر
                                                    </label>
                                                    <Input
                                                        id={`${l.key}-name`}
                                                        name={`${l.key}-name`}
                                                        value={l.name}
                                                        onChange={(e) => updateLine(l.key, { name: e.target.value })}
                                                    />
                                                    {errs.name && <p className='mt-1 text-xs text-error-500'>{errs.name}</p>}
                                                </div>
                                                <div>
                                                    <label htmlFor={`${l.key}-kind`} className={labelClass}>
                                                        نوع
                                                    </label>
                                                    <select
                                                        id={`${l.key}-kind`}
                                                        value={l.kind}
                                                        onChange={(e) => updateLine(l.key, { kind: e.target.value as ProductKind })}
                                                        className={selectClass}
                                                    >
                                                        <option value='service'>خدمات</option>
                                                        <option value='physical'>کالای بیرونی</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className='truncate text-sm font-medium text-gray-800 dark:text-white/90'>
                                                    {l.name}
                                                    {l.isCustom && (
                                                        <span className='ms-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500 dark:bg-gray-800'>
                                                            دستی
                                                        </span>
                                                    )}
                                                    {l.isNew && (
                                                        <span className='ms-2 rounded bg-brand-100 px-1.5 py-0.5 text-[11px] text-brand-700 dark:bg-brand-500/20 dark:text-brand-300'>
                                                            جدید
                                                        </span>
                                                    )}
                                                </p>
                                                {l.variant && <p className='mt-0.5 text-xs text-gray-500'>{l.variant}</p>}
                                            </>
                                        )}
                                    </div>
                                    {!itemsLocked && (
                                        <button
                                            type='button'
                                            onClick={() => removeLine(l.key)}
                                            title='حذف سطر'
                                            aria-label={`حذف ${l.name || 'سطر'}`}
                                            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 dark:hover:bg-red-500/10'
                                        >
                                            <svg aria-hidden width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round'>
                                                <path d='M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14' />
                                            </svg>
                                        </button>
                                    )}
                                </div>

                                <div className={`grid grid-cols-2 gap-2 ${l.isCustom && l.isNew ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
                                    <div>
                                        <label htmlFor={`${l.key}-qty`} className={labelClass}>
                                            تعداد
                                        </label>
                                        <Input
                                            id={`${l.key}-qty`}
                                            name={`${l.key}-qty`}
                                            type='number'
                                            min='1'
                                            disabled={itemsLocked}
                                            value={l.quantity}
                                            onChange={(e) => updateLine(l.key, { quantity: e.target.value })}
                                        />
                                        {errs.quantity && <p className='mt-1 text-xs text-error-500'>{errs.quantity}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor={`${l.key}-price`} className={labelClass}>
                                            قیمت واحد (تومان)
                                        </label>
                                        <Input
                                            id={`${l.key}-price`}
                                            name={`${l.key}-price`}
                                            type='number'
                                            min='0'
                                            disabled={itemsLocked}
                                            placeholder={l.isNew && !l.isCustom ? 'قیمت فعلی ورینت' : undefined}
                                            value={l.unitPrice}
                                            onChange={(e) => updateLine(l.key, { unitPrice: e.target.value })}
                                        />
                                        {errs.unitPrice && <p className='mt-1 text-xs text-error-500'>{errs.unitPrice}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor={`${l.key}-disc`} className={labelClass}>
                                            تخفیف کل سطر (تومان)
                                        </label>
                                        <Input
                                            id={`${l.key}-disc`}
                                            name={`${l.key}-disc`}
                                            type='number'
                                            min='0'
                                            disabled={itemsLocked}
                                            placeholder={
                                                orig?.DiscountAmount
                                                    ? `فعلی: ${orig.DiscountAmount.toLocaleString('fa-IR')}`
                                                    : '۰'
                                            }
                                            value={l.discount}
                                            onChange={(e) => updateLine(l.key, { discount: e.target.value })}
                                        />
                                        {errs.discount && <p className='mt-1 text-xs text-error-500'>{errs.discount}</p>}
                                    </div>
                                    {l.isCustom && l.isNew && (
                                        <div>
                                            <label htmlFor={`${l.key}-cost`} className={labelClass}>
                                                بهای تمام‌شده واحد
                                            </label>
                                            <Input
                                                id={`${l.key}-cost`}
                                                name={`${l.key}-cost`}
                                                type='number'
                                                min='0'
                                                value={l.unitCost}
                                                onChange={(e) => updateLine(l.key, { unitCost: e.target.value })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {!lines.length && <p className='py-4 text-center text-sm text-gray-400'>قلمی باقی نمانده است</p>}
                </div>

                {!itemsLocked && (
                    <div className='mt-4 flex flex-col gap-2 border-t border-gray-200 pt-4 md:flex-row md:items-end dark:border-gray-800'>
                        <div className='min-w-0 flex-1'>
                            <label className={labelClass}>افزودن محصول</label>
                            <AsyncSelectInput
                                name='new-product'
                                value={productId}
                                onChange={(v) => {
                                    setProductId(v);
                                    setVariants([]);
                                    setVariantId('');
                                }}
                                loadOptions={loadProducts}
                            />
                        </div>
                        {variants.length !== 1 && (
                            <div className='min-w-0 md:w-56'>
                                <label htmlFor='new-variant' className={labelClass}>
                                    ورینت
                                </label>
                                <select
                                    id='new-variant'
                                    value={variantId}
                                    disabled={loadingVariants || !variants.length}
                                    onChange={(e) => setVariantId(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value=''>
                                        {loadingVariants ? 'در حال بارگذاری...' : !productId ? 'ابتدا محصول' : 'انتخاب ورینت'}
                                    </option>
                                    {variants.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            type='button'
                            onClick={addCatalogLine}
                            disabled={!variantId}
                            className='h-11 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            افزودن
                        </button>
                    </div>
                )}
            </section>

            <section className={sectionClass}>
                <h3 className='mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300'>مبالغ و صندوق</h3>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                    <div>
                        <label htmlFor='shipping_amount' className={labelClass}>
                            هزینه‌ی ارسال (تومان)
                        </label>
                        <Input
                            id='shipping_amount'
                            name='shipping_amount'
                            type='number'
                            min='0'
                            value={shipping}
                            onChange={(e) => setShipping(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor='manual_discount_amount' className={labelClass}>
                            تخفیف دستی کل فاکتور (تومان)
                        </label>
                        <Input
                            id='manual_discount_amount'
                            name='manual_discount_amount'
                            type='number'
                            min='0'
                            value={manual}
                            onChange={(e) => setManual(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor='cash_mode' className={labelClass}>
                            ثبت اختلاف در صندوق
                        </label>
                        <select
                            id='cash_mode'
                            value={cashMode}
                            onChange={(e) => setCashMode(e.target.value as CashMode)}
                            className={selectClass}
                        >
                            <option value='default'>پیش‌فرض (فقط فروش حضوری تحویل‌شده)</option>
                            <option value='yes'>ثبت شود</option>
                            <option value='no'>ثبت نشود</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor='payment_method' className={labelClass}>
                            روش دریافت / پرداخت
                        </label>
                        <select
                            id='payment_method'
                            value={paymentMethod}
                            disabled={cashMode === 'no'}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className={selectClass}
                        >
                            {PAYMENT_METHOD_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <dl className='mt-4 grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 text-sm sm:grid-cols-3 dark:bg-white/[0.03]'>
                    <div className='flex justify-between gap-2 sm:flex-col'>
                        <dt className='text-gray-500'>مبلغ نهایی فعلی</dt>
                        <dd className='tabular-nums'>{formatPrice(order.final_amount)}</dd>
                    </div>
                    <div className='flex justify-between gap-2 sm:flex-col'>
                        <dt className='text-gray-500'>برآورد مبلغ جدید{hasUnknownPrice && ' (بدون قیمت سطرهای جدید)'}</dt>
                        <dd className='font-semibold tabular-nums'>{formatPrice(Math.max(estimatedFinal, 0))}</dd>
                    </div>
                    <div className='flex justify-between gap-2 sm:flex-col'>
                        <dt className='text-gray-500'>اختلاف</dt>
                        <dd
                            className={`font-semibold tabular-nums ${
                                difference > 0 ? 'text-success-600' : difference < 0 ? 'text-error-600' : ''
                            }`}
                        >
                            {difference === 0
                                ? '—'
                                : `${formatPrice(Math.abs(difference))} ${difference > 0 ? 'دریافت از مشتری' : 'پرداخت به مشتری'}`}
                        </dd>
                    </div>
                </dl>
            </section>

            <section>
                <label htmlFor='edit-reason' className={labelClass}>
                    دلیل ویرایش <span className='text-error-500'>*</span>
                </label>
                <textarea
                    id='edit-reason'
                    rows={3}
                    maxLength={500}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    aria-invalid={submitted && !!reasonError}
                    className='w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-gray-700 dark:text-white'
                />
                <div className='mt-1 flex justify-between text-xs'>
                    <span className='text-error-500'>{submitted && reasonError}</span>
                    <span className='text-gray-400 tabular-nums'>{reason.length.toLocaleString('fa-IR')}/۵۰۰</span>
                </div>
            </section>

            <div className='flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800'>
                <button
                    type='button'
                    onClick={onClose}
                    className='h-11 rounded-lg border border-gray-300 px-5 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                    انصراف
                </button>
                <button
                    type='button'
                    onClick={submit}
                    disabled={saving}
                    className='h-11 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60'
                >
                    {saving ? 'در حال ثبت...' : 'ثبت ویرایش'}
                </button>
            </div>
        </div>
    );
};

export default EditOrderModal;
