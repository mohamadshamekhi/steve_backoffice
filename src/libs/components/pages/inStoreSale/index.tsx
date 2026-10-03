'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { InvoiceModal } from 'libs/components/common';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { InvoiceData } from 'libs/components/common/invoice/invoice.types';
import CustomItemModal, { CustomItemDraft } from './CustomItemModal';
import {
    PAYMENT_METHOD_OPTIONS,
    paymentMethodLabel
} from 'libs/constants/accounting/accounting.constants';
import { PaymentMethod } from 'libs/models/accounting.model';
import { Button, Input } from 'libs/ui';
import AsyncSelectInput from 'libs/ui/asyncSelect';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import noPic from '../../../../../public/images/placeholder/no-pic.png';

// درگاه آنلاین برای فروش حضوری معنا ندارد.
const IN_STORE_PAYMENT_METHODS = PAYMENT_METHOD_OPTIONS.filter((method) => method.value !== 'gateway');

const iconProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true
};

const PlusIcon = () => (
    <svg {...iconProps} width={16} height={16}>
        <path d='M12 5v14M5 12h14' />
    </svg>
);

const PencilIcon = () => (
    <svg {...iconProps}>
        <path d='M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z' />
        <path d='m14.5 7.5 3 3' />
    </svg>
);

const TrashIcon = () => (
    <svg {...iconProps}>
        <path d='M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3' />
    </svg>
);

const BagIcon = () => (
    <svg {...iconProps} width={24} height={24}>
        <path d='M6 7h12l1 13H5L6 7Z' />
        <path d='M9 10V6a3 3 0 0 1 6 0v4' />
    </svg>
);

const WrenchIcon = () => (
    <svg {...iconProps} width={24} height={24}>
        <path d='M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.5-.5-2.4 2.5-2.7Z' />
    </svg>
);

const BoxIcon = () => (
    <svg {...iconProps} width={24} height={24}>
        <path d='M21 8 12 3 3 8v8l9 5 9-5V8Z' />
        <path d='m3 8 9 5 9-5M12 13v8' />
    </svg>
);

type Step = 'phone' | 'name' | 'cart' | 'order';

interface UserData {
    _id: string;
    name?: string;
    phone_number: string;
}

interface CartItem {
    product_id?: string;
    variant_id: string;
    quantity: number;
    product_name: string;
    variant_attributes?: { key: string; value: string; label: string; meta: string }[];
    price_at_time: number;
    url?: string;
    manual_discount?: number;
    is_custom?: boolean;
    kind?: 'service' | 'physical';
    unit_cost?: number;
}

interface CartData {
    id: string;
    status: string;
    user_id: string;
    items: CartItem[] | null;
    subtotal: number;
    items_manual_discount?: number;
    manual_discount?: number;
    payable_amount?: number;
}

interface OrderItem {
    product_id?: string;
    variant_id: string;
    product_name: string;
    quantity: number;
    total_price_at_time: number;
    discount_amount?: number;
    manual_discount?: number;
    is_custom?: boolean;
    kind?: 'service' | 'physical';
}

interface OrderData {
    id: string;
    subtotal_amount: number;
    discounted_subtotal?: number;
    final_amount: number;
    status: string;
    items?: OrderItem[] | null;
    total_discount_amount?: number;
    items_manual_discount?: number;
    manual_discount?: number;
    applied_discounts: { discount_id: string; discount_code?: string; amount: number }[];
}

const toAmount = (v: string) => Number(v.replace(/[^\d]/g, '')) || 0;

const formatPrice = (price: number) => Math.abs(price).toLocaleString('fa-IR') + ' تومان';

const StepIndicator = ({ current }: { current: Step }) => {
    const steps: { key: Step; label: string }[] = [
        { key: 'phone', label: 'احراز مشتری' },
        { key: 'cart', label: 'سبد خرید' },
        { key: 'order', label: 'ثبت سفارش' }
    ];

    const visibleSteps = steps.filter((s) => s.key !== 'name');
    const effectiveCurrent = current === 'name' ? 'phone' : current;
    const currentIdx = visibleSteps.findIndex((s) => s.key === effectiveCurrent);

    return (
        <div className='mb-8 flex items-center justify-center gap-0'>
            {visibleSteps.map((step, idx) => (
                <div key={step.key} className='flex items-center'>
                    <div className='flex flex-col items-center gap-1'>
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                                idx <= currentIdx
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            }`}
                        >
                            {idx + 1}
                        </div>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>{step.label}</span>
                    </div>
                    {idx < visibleSteps.length - 1 && (
                        <div
                            className={`mb-4 h-0.5 w-16 ${idx < currentIdx ? 'bg-brand-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const InStoreSale = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState<Step>('phone');
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(false);

    const [phone, setPhone] = useState('');
    const [userName, setUserName] = useState('');
    const [discountCode, setDiscountCode] = useState('');
    const [orderDescription, setOrderDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

    const [user, setUser] = useState<UserData | null>(null);
    const [cart, setCart] = useState<CartData | null>(null);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProductVariants, setSelectedProductVariants] = useState<{ id: string; label: string }[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [loadingVariants, setLoadingVariants] = useState(false);

    const [customModalOpen, setCustomModalOpen] = useState(false);
    const [editingCustom, setEditingCustom] = useState<CustomItemDraft | null>(null);
    const [savingCustom, setSavingCustom] = useState(false);
    const [rowDiscountDraft, setRowDiscountDraft] = useState<Record<string, string>>({});
    const [cartDiscountDraft, setCartDiscountDraft] = useState<string | null>(null);

    const setParam = useCallback(
        (key: string, value: string | null) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
            router.replace(`?${params.toString()}`);
        },
        [router, searchParams]
    );

    const goToStep = useCallback(
        (nextStep: Step) => {
            setStep(nextStep);
            setParam('step', nextStep);
        },
        [setParam]
    );

    const fetchActiveCart = useCallback(
        async (userId: string, userData?: UserData) => {
            setLoading(true);
            try {
                const res = await fetcher(ApiKeys.BACKOFFICE_GET_ACTIVE_CART(userId), 'dashboard', 'GET');
                if (res?.success) {
                    const cartData: CartData = res.data.cart;
                    if (userData) setUser(userData);

                    if (cartData.id) {
                        setCart(cartData);
                        goToStep('cart');
                    } else {
                        const pendingRes = await fetcher(
                            ApiKeys.BACKOFFICE_CHECK_PENDING_ORDER(userId),
                            'dashboard',
                            'GET'
                        );
                        if (pendingRes?.success && pendingRes.data?.order?.id) {
                            setOrder(pendingRes.data.order);
                            goToStep('order');
                        } else {
                            const created = await fetcher(ApiKeys.BACKOFFICE_CREATE_CART, 'dashboard', 'POST', {
                                body: { user_id: userId }
                            });
                            if (created?.success) {
                                const refreshed = await fetcher(
                                    ApiKeys.BACKOFFICE_GET_ACTIVE_CART(userId),
                                    'dashboard',
                                    'GET'
                                );
                                if (refreshed?.success) {
                                    setCart(refreshed.data.cart);
                                    goToStep('cart');
                                }
                            }
                        }
                    }
                }
            } finally {
                setLoading(false);
            }
        },
        [goToStep]
    );

    useEffect(() => {
        const userId = searchParams.get('userId');
        const urlStep = searchParams.get('step') as Step | null;

        if (!userId) return;

        setInitializing(true);
        fetcher(ApiKeys.BACKOFFICE_GET_ACTIVE_CART(userId), 'dashboard', 'GET')
            .then((res) => {
                if (res?.success) {
                    const cartData: CartData = res.data.cart;
                    setCart(cartData);
                    if (!cartData.id) {
                        setStep('phone');
                        return;
                    }
                    setStep(urlStep === 'order' ? 'cart' : (urlStep ?? 'cart'));
                }
            })
            .finally(() => setInitializing(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpsertUser = async () => {
        if (!phone.trim()) {
            toast.error('شماره موبایل را وارد کنید');
            return;
        }
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_UPSERT_USER, 'dashboard', 'POST', {
                body: { phone_number: phone }
            });
            if (res?.success) {
                const userData: UserData = res.data.user;
                setUser(userData);
                setParam('userId', userData._id);
                if (!userData.name) {
                    goToStep('name');
                } else {
                    await fetchActiveCart(userData._id, userData);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!userName.trim()) {
            toast.error('نام مشتری را وارد کنید');
            return;
        }
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_UPDATE_USER(user._id), 'dashboard', 'PATCH', {
                body: { name: userName }
            });
            if (res?.success) {
                setUser({ ...user, name: userName });
                await fetchActiveCart(user._id);
            }
        } finally {
            setLoading(false);
        }
    };

    const getCartUserId = () => cart?.user_id ?? user?._id ?? searchParams.get('userId');

    const handleAddItem = async (productId: string, variantId: string) => {
        const userId = getCartUserId();
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_ADD_ITEM, 'dashboard', 'POST', {
                body: { user_id: userId, product_id: productId, variant_id: variantId }
            });
            if (res?.success) {
                toast.success('آیتم اضافه شد');
                await refreshCart();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveItem = async (productId: string, variantId: string) => {
        const userId = getCartUserId();
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_REMOVE_ITEM, 'dashboard', 'POST', {
                body: { user_id: userId, product_id: productId, variant_id: variantId }
            });
            if (res?.success) {
                await refreshCart();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (variantId: string) => {
        const userId = getCartUserId();
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_DELETE_ITEM, 'dashboard', 'POST', {
                body: { user_id: userId, variant_id: variantId }
            });
            if (res?.success) {
                toast.success('آیتم حذف شد');
                await refreshCart();
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshCart = async () => {
        const userId = cart?.user_id ?? user?._id ?? searchParams.get('userId');
        if (!userId) return;
        const res = await fetcher(ApiKeys.BACKOFFICE_GET_ACTIVE_CART(userId), 'dashboard', 'GET');
        if (res?.success) {
            setCart(res.data.cart);
            setRowDiscountDraft({});
            setCartDiscountDraft(null);
        }
    };

    const handleSaveCustomItem = async (draft: CustomItemDraft) => {
        const userId = getCartUserId();
        if (!userId) return;
        setSavingCustom(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_CUSTOM_ITEM, 'dashboard', 'POST', {
                body: {
                    user_id: userId,
                    ...(draft.variant_id && { variant_id: draft.variant_id }),
                    title: draft.title,
                    unit_price: draft.unit_price,
                    quantity: draft.quantity,
                    kind: draft.kind,
                    ...(draft.kind === 'physical' ? { unit_cost: draft.unit_cost } : {})
                }
            });
            if (res?.success) {
                toast.success(draft.variant_id ? 'ردیف به‌روزرسانی شد' : 'ردیف دستی اضافه شد');
                setCustomModalOpen(false);
                setEditingCustom(null);
                await refreshCart();
            }
        } finally {
            setSavingCustom(false);
        }
    };

    const handleCustomQuantity = async (item: CartItem, delta: number) => {
        const userId = getCartUserId();
        if (!userId || !item.variant_id) return;
        const nextQuantity = item.quantity + delta;
        if (nextQuantity < 1) {
            await handleDeleteItem(item.variant_id);
            return;
        }
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_CUSTOM_ITEM, 'dashboard', 'POST', {
                body: {
                    user_id: userId,
                    variant_id: item.variant_id,
                    title: item.product_name,
                    unit_price: item.price_at_time,
                    quantity: nextQuantity,
                    kind: item.kind ?? 'physical',
                    unit_cost: item.unit_cost ?? 0
                }
            });
            if (!res?.success) {
                await refreshCart();
                return;
            }
            await refreshCart();
        } finally {
            setLoading(false);
        }
    };

    const handleItemNewPrice = async (item: CartItem, unitPrice: number) => {
        const userId = getCartUserId();
        if (!userId) return;
        setLoading(true);
        try {
            await fetcher(ApiKeys.BACKOFFICE_ITEM_NEW_PRICE, 'dashboard', 'POST', {
                body: { user_id: userId, variant_id: item.variant_id, unit_price: unitPrice }
            });
            await refreshCart();
        } finally {
            setLoading(false);
        }
    };

    const handleCartDiscount = async (amount: number) => {
        const userId = getCartUserId();
        if (!userId) return;
        setLoading(true);
        try {
            await fetcher(ApiKeys.BACKOFFICE_CART_DISCOUNT, 'dashboard', 'POST', {
                body: { user_id: userId, amount }
            });
            await refreshCart();
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterOrder = () => {
        goToStep('order');
    };

    const handleCompleteOrder = async () => {
        if (!cart || !user) return;
        const userId = user._id ?? searchParams.get('userId');
        if (!userId) return;
        setLoading(true);
        try {
            const registerRes = await fetcher(ApiKeys.BACKOFFICE_REGISTER_ORDER, 'dashboard', 'POST', {
                body: { user_id: userId, ...(discountCode && { discount_code: discountCode }) }
            });
            if (!registerRes?.success) {
                await refreshCart();
                goToStep('cart');
                return;
            }
            const registeredOrder: OrderData = registerRes.data.order;
            setOrder(registeredOrder);

            const completeRes = await fetcher(ApiKeys.BACKOFFICE_COMPLETE_ORDER, 'dashboard', 'POST', {
                body: { order_id: registeredOrder.id, description: orderDescription, payment_method: paymentMethod }
            });
            if (completeRes?.success) {
                toast.success('سفارش با موفقیت ثبت شد');
                setInvoiceData({
                    orderId: registeredOrder.id,
                    createdAt: new Date().toISOString(),
                    type: 'in_person',
                    customer: { name: user?.name, phone: user?.phone_number ?? phone },
                    items: (cart.items ?? []).map((item) => ({
                        name: item.product_name,
                        variant: item.is_custom
                            ? item.kind === 'service' ? 'خدمات' : 'ردیف دستی'
                            : item.variant_attributes?.map((a) => a.label).join('، '),
                        quantity: item.quantity,
                        unitPrice: item.price_at_time,
                        discount: item.manual_discount || undefined,
                        totalPrice: item.price_at_time * item.quantity - (item.manual_discount ?? 0)
                    })),
                    subtotal: cart.subtotal,
                    discount:
                        registeredOrder.total_discount_amount ??
                        (cart.subtotal > (cart.payable_amount ?? cart.subtotal)
                            ? cart.subtotal - (cart.payable_amount ?? cart.subtotal)
                            : undefined),
                    discountCode:
                        registeredOrder.applied_discounts
                            ?.map((d) => d.discount_code)
                            .filter(Boolean)
                            .join('، ') || undefined,
                    total: registeredOrder.final_amount,
                    advancePaid: registeredOrder.final_amount,
                    paymentMethod: `حضوری - ${paymentMethodLabel(paymentMethod)}`,
                    note: orderDescription || undefined
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const loadProductOptions = async (inputValue: string) => {
        const res = await fetcher(ApiKeys.GET_ALL_PRODUCT, 'dashboard', 'GET', {
            params: { page_number: 1, page_size: 20, ...(inputValue && { name: inputValue }) }
        });
        return (res?.data?.products ?? []).map((p: { id: string; name: string }) => ({
            value: p.id,
            label: p.name
        }));
    };

    const handleProductSelect = async (productId: string) => {
        setSelectedProductId(productId);
        setSelectedVariantId('');
        setSelectedProductVariants([]);
        if (!productId) return;
        setLoadingVariants(true);
        try {
            const res = await fetcher(ApiKeys.GET_PRODUCT(productId), 'dashboard', 'GET');
            const variants = res?.data?.product?.variants ?? [];
            const options = variants.map((v: { id: string; variant_attribute: { label: string }[] }, index: number) => ({
                id: v.id,
                label: v.variant_attribute?.map((a: { label: string }) => a.label).join(' / ') || `ورینت ${(index + 1).toLocaleString('fa-IR')}`
            }));
            setSelectedProductVariants(options);
            // خدمات و محصولات تک‌ورینتی مستقیم آماده‌ی افزودن‌اند.
            if (options.length === 1) setSelectedVariantId(options[0].id);
        } finally {
            setLoadingVariants(false);
        }
    };

    const openCustomModal = () => {
        setEditingCustom(null);
        setCustomModalOpen(true);
    };

    const handleChangeCustomer = () => {
        setUser(null);
        setCart(null);
        setOrder(null);
        setPhone('');
        setUserName('');
        setDiscountCode('');
        setSelectedProductId('');
        setSelectedProductVariants([]);
        setSelectedVariantId('');
        setStep('phone');
        router.replace('?');
    };

if (initializing) {
        return (
            <ContentWrapper title='ثبت خرید حضوری'>
                <div className='flex items-center justify-center py-20 text-sm text-gray-400'>در حال بارگذاری...</div>
            </ContentWrapper>
        );
    }

    const activeUserId = user?._id ?? searchParams.get('userId');

    return (
        <ContentWrapper title='ثبت خرید حضوری'>
            <StepIndicator current={step} />

            {step === 'phone' && (
                <div className='mx-auto max-w-md space-y-4'>
                    <h2 className='text-center text-lg font-semibold text-gray-800 dark:text-white'>
                        شماره موبایل مشتری
                    </h2>
                    <Input
                        type='text'
                        placeholder='مثال: 09111234567'
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpsertUser()}
                        dir='ltr'
                    />
                    <Button className='w-full' onClick={handleUpsertUser} loading={loading} disabled={loading}>
                        ادامه
                    </Button>
                </div>
            )}

            {step === 'name' && (
                <div className='mx-auto max-w-md space-y-4'>
                    <h2 className='text-center text-lg font-semibold text-gray-800 dark:text-white'>
                        نام مشتری را وارد کنید
                    </h2>
                    <p className='text-center text-sm text-gray-500'>
                        این مشتری برای اولین بار ثبت شده است. لطفاً نام او را وارد کنید.
                    </p>
                    <Input
                        type='text'
                        placeholder='مثال: رضا احمدی'
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                    />
                    <Button className='w-full' onClick={handleUpdateName} loading={loading} disabled={loading}>
                        ادامه
                    </Button>
                </div>
            )}

            {step === 'cart' && cart && (
                <div className='grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]'>
                    <div className='min-w-0 space-y-6'>
                        <section className='rounded-2xl border border-gray-200 p-4 md:p-5 dark:border-gray-800'>
                            <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
                                <h3 className='font-semibold text-gray-800 dark:text-white'>افزودن محصول</h3>
                                <button
                                    type='button'
                                    disabled={loading}
                                    onClick={openCustomModal}
                                    className='text-brand-500 hover:text-brand-600 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-medium disabled:opacity-50'
                                >
                                    <PlusIcon />
                                    ردیف دستی (خدمات / کالای بیرونی)
                                </button>
                            </div>

                            <div className='flex flex-col gap-3 md:flex-row md:items-end'>
                                <div className='min-w-0 flex-1'>
                                    <label className='mb-1 block text-sm text-gray-600 dark:text-gray-400'>محصول</label>
                                    <AsyncSelectInput
                                        name='product'
                                        value={selectedProductId}
                                        onChange={handleProductSelect}
                                        loadOptions={loadProductOptions}
                                    />
                                </div>

                                {/* محصول تک‌ورینتی (مثل خدمات) نیازی به انتخاب ورینت ندارد. */}
                                {selectedProductVariants.length !== 1 && (
                                    <div className='min-w-0 md:w-64'>
                                        <label
                                            htmlFor='variant'
                                            className='mb-1 block text-sm text-gray-600 dark:text-gray-400'
                                        >
                                            ورینت
                                        </label>
                                        <select
                                            id='variant'
                                            value={selectedVariantId}
                                            onChange={(e) => setSelectedVariantId(e.target.value)}
                                            disabled={loadingVariants || !selectedProductVariants.length}
                                            className='h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-700 dark:text-white dark:disabled:bg-white/[0.03]'
                                        >
                                            <option value=''>
                                                {loadingVariants
                                                    ? 'در حال بارگذاری...'
                                                    : !selectedProductId
                                                      ? 'ابتدا محصول را انتخاب کنید'
                                                      : 'انتخاب ورینت'}
                                            </option>
                                            {selectedProductVariants.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {v.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <Button
                                    className='h-11 shrink-0'
                                    disabled={!selectedProductId || !selectedVariantId || loading}
                                    loading={loading}
                                    onClick={() => handleAddItem(selectedProductId, selectedVariantId)}
                                >
                                    افزودن به سبد
                                </Button>
                            </div>
                        </section>

                        <section>
                            <div className='mb-3 flex items-center justify-between'>
                                <h3 className='font-semibold text-gray-800 dark:text-white'>آیتم‌های سبد خرید</h3>
                                {!!cart.items?.length && (
                                    <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300'>
                                        {cart.items.reduce((sum, item) => sum + item.quantity, 0).toLocaleString('fa-IR')}{' '}
                                        قلم
                                    </span>
                                )}
                            </div>

                            {!cart.items || cart.items.length === 0 ? (
                                <div className='flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-12 text-center dark:border-gray-700'>
                                    <span className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800'>
                                        <BagIcon />
                                    </span>
                                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>سبد خرید خالی است</p>
                                    <p className='text-xs text-gray-400'>
                                        محصول را از بالا جست‌وجو کنید یا برای خدمات، ردیف دستی اضافه کنید.
                                    </p>
                                </div>
                            ) : (
                                <ul className='space-y-3'>
                                    {cart.items.map((item) => {
                                        const lineTotal = item.price_at_time * item.quantity;
                                        const effectiveUnitPrice = Math.round(
                                            (lineTotal - (item.manual_discount ?? 0)) / item.quantity
                                        );
                                        const rawDraft = rowDiscountDraft[item.variant_id];
                                        const newPriceRaw =
                                            rawDraft !== undefined ? rawDraft : String(effectiveUnitPrice);
                                        const newPriceDisplayed = toAmount(newPriceRaw)
                                            ? toAmount(newPriceRaw).toLocaleString('fa-IR')
                                            : '';
                                        const applyNewPrice = () => {
                                            const newUnitPrice = toAmount(newPriceRaw);
                                            if (!newUnitPrice) return;
                                            if (newUnitPrice === effectiveUnitPrice) return;
                                            handleItemNewPrice(item, newUnitPrice);
                                        };

                                        return (
                                            <li
                                                key={item.variant_id}
                                                className='rounded-2xl border border-gray-200 p-3 md:p-4 dark:border-gray-800'
                                            >
                                                <div className='flex gap-3'>
                                                    <div className='shrink-0'>
                                                        {item.is_custom ? (
                                                            <div
                                                                aria-hidden='true'
                                                                className='flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
                                                            >
                                                                {item.kind === 'service' ? <WrenchIcon /> : <BoxIcon />}
                                                            </div>
                                                        ) : (
                                                            <Image
                                                                src={item.url || noPic}
                                                                alt={item.product_name}
                                                                width={56}
                                                                height={56}
                                                                className='h-14 w-14 rounded-xl object-cover'
                                                            />
                                                        )}
                                                    </div>

                                                    <div className='min-w-0 flex-1'>
                                                        <div className='flex items-start justify-between gap-2'>
                                                            <div className='min-w-0'>
                                                                <div className='flex flex-wrap items-center gap-2'>
                                                                    <p className='truncate text-sm font-medium text-gray-800 dark:text-white'>
                                                                        {item.product_name}
                                                                    </p>
                                                                    {item.is_custom && (
                                                                        <span className='rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'>
                                                                            {item.kind === 'service' ? 'خدمات' : 'دستی'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {!item.is_custom && !!item.variant_attributes?.length && (
                                                                    <div className='mt-1 flex flex-wrap gap-1'>
                                                                        {item.variant_attributes.map((attr, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className='inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                                                            >
                                                                                {attr.key}:{' '}
                                                                                {attr.value.startsWith('#') && (
                                                                                    <span
                                                                                        className='inline-block h-3 w-3 rounded-full border'
                                                                                        style={{ backgroundColor: attr.value }}
                                                                                    />
                                                                                )}
                                                                                {attr.label}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className='shrink-0 text-left'>
                                                                <p
                                                                    className={`text-sm font-semibold ${
                                                                        item.manual_discount
                                                                            ? 'text-xs font-normal text-gray-400 line-through'
                                                                            : 'text-gray-800 dark:text-white'
                                                                    }`}
                                                                >
                                                                    {formatPrice(lineTotal)}
                                                                </p>
                                                                {!!item.manual_discount && (
                                                                    <p className='text-sm font-semibold text-gray-800 dark:text-white'>
                                                                        {formatPrice(lineTotal - item.manual_discount)}
                                                                    </p>
                                                                )}
                                                                <p className='mt-0.5 text-xs text-gray-400'>
                                                                    واحد:{' '}
                                                                    {item.manual_discount
                                                                        ? formatPrice(
                                                                              Math.round(
                                                                                  (lineTotal - item.manual_discount) /
                                                                                      item.quantity
                                                                              )
                                                                          )
                                                                        : formatPrice(item.price_at_time)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 dark:border-gray-800'>
                                                    <div className='flex items-center rounded-lg border border-gray-300 dark:border-gray-700'>
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                item.is_custom
                                                                    ? handleCustomQuantity(item, 1)
                                                                    : handleAddItem(item.product_id!, item.variant_id)
                                                            }
                                                            disabled={loading}
                                                            className='flex h-11 w-11 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/5'
                                                            aria-label={`افزایش تعداد ${item.product_name}`}
                                                        >
                                                            +
                                                        </button>
                                                        <span className='w-8 text-center text-sm font-medium text-gray-800 dark:text-white'>
                                                            {item.quantity.toLocaleString('fa-IR')}
                                                        </span>
                                                        <button
                                                            type='button'
                                                            onClick={() =>
                                                                item.is_custom
                                                                    ? handleCustomQuantity(item, -1)
                                                                    : handleRemoveItem(item.product_id!, item.variant_id)
                                                            }
                                                            disabled={loading}
                                                            className='flex h-11 w-11 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-white/5'
                                                            aria-label={`کاهش تعداد ${item.product_name}`}
                                                        >
                                                            −
                                                        </button>
                                                    </div>

                                                    <div className='flex items-center gap-2'>
                                                        <label
                                                            htmlFor={`discount-${item.variant_id}`}
                                                            className='text-xs whitespace-nowrap text-gray-500 dark:text-gray-400'
                                                        >
                                                            قیمت جدید
                                                        </label>
                                                        <Input
                                                            id={`discount-${item.variant_id}`}
                                                            name={`discount-${item.variant_id}`}
                                                            inputMode='numeric'
                                                            className='h-11 w-32'
                                                            disabled={loading}
                                                            value={newPriceDisplayed}
                                                            placeholder={effectiveUnitPrice.toLocaleString('fa-IR')}
                                                            onChange={(e) =>
                                                                setRowDiscountDraft((d) => ({
                                                                    ...d,
                                                                    [item.variant_id]: e.target.value
                                                                }))
                                                            }
                                                            onKeyDown={(e) => e.key === 'Enter' && applyNewPrice()}
                                                        />
                                                        <button
                                                            type='button'
                                                            onClick={applyNewPrice}
                                                            disabled={loading || toAmount(newPriceRaw) === effectiveUnitPrice}
                                                            className='flex h-11 items-center gap-1 rounded-lg bg-brand-500 px-3 text-xs font-medium text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40'
                                                        >
                                                            اعمال
                                                        </button>
                                                    </div>

                                                    <div className='flex items-center gap-1'>
                                                        {item.is_custom && (
                                                            <button
                                                                type='button'
                                                                onClick={() => {
                                                                    setEditingCustom({
                                                                        variant_id: item.variant_id,
                                                                        title: item.product_name,
                                                                        unit_price: item.price_at_time,
                                                                        quantity: item.quantity,
                                                                        kind: item.kind ?? 'physical',
                                                                        unit_cost: item.unit_cost ?? 0
                                                                    });
                                                                    setCustomModalOpen(true);
                                                                }}
                                                                disabled={loading}
                                                                className='flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-white/5'
                                                                aria-label={`ویرایش ${item.product_name}`}
                                                                title='ویرایش ردیف'
                                                            >
                                                                <PencilIcon />
                                                            </button>
                                                        )}
                                                        <button
                                                            type='button'
                                                            onClick={() => handleDeleteItem(item.variant_id)}
                                                            disabled={loading}
                                                            className='flex h-11 w-11 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10'
                                                            aria-label={`حذف ${item.product_name}`}
                                                            title='حذف از سبد'
                                                        >
                                                            <TrashIcon />
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>
                    </div>

                    <aside className='space-y-4 xl:sticky xl:top-24 xl:self-start'>
                        {(user || activeUserId) && (
                            <div className='flex items-center gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800'>
                                <span
                                    aria-hidden='true'
                                    className='bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold'
                                >
                                    {(user?.name || 'م').trim().charAt(0)}
                                </span>
                                <div className='min-w-0 flex-1'>
                                    <p className='truncate font-medium text-gray-800 dark:text-white'>
                                        {user?.name || 'مشتری بدون نام'}
                                    </p>
                                    <p className='text-sm text-gray-500' dir='ltr' style={{ textAlign: 'right' }}>
                                        {user?.phone_number}
                                    </p>
                                </div>
                                <button
                                    type='button'
                                    onClick={handleChangeCustomer}
                                    disabled={loading}
                                    className='text-brand-500 hover:text-brand-600 min-h-11 shrink-0 rounded-lg px-2 text-sm font-medium disabled:opacity-50'
                                >
                                    تغییر
                                </button>
                            </div>
                        )}

                        <div className='space-y-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800'>
                            <h3 className='font-semibold text-gray-800 dark:text-white'>خلاصه فاکتور</h3>

                            <dl className='space-y-2 text-sm'>
                                <div className='flex items-center justify-between'>
                                    <dt className='text-gray-500'>جمع ناخالص</dt>
                                    <dd className='text-gray-800 dark:text-white'>{formatPrice(cart.subtotal)}</dd>
                                </div>
                                {!!cart.items_manual_discount && (
                                    <div
                                        className={`flex items-center justify-between ${
                                            cart.items_manual_discount > 0 ? 'text-green-600' : 'text-red-500'
                                        }`}
                                    >
                                        <dt>تعدیل قیمت سطری</dt>
                                        <dd>
                                            {cart.items_manual_discount > 0 ? '−' : '+'}
                                            {formatPrice(Math.abs(cart.items_manual_discount))}
                                        </dd>
                                    </div>
                                )}
                                {!!cart.manual_discount && (
                                    <div className='flex items-center justify-between text-green-600'>
                                        <dt>تخفیف کل فاکتور</dt>
                                        <dd>−{formatPrice(cart.manual_discount)}</dd>
                                    </div>
                                )}
                            </dl>

                            <div>
                                <label
                                    htmlFor='cart-discount'
                                    className='mb-1 block text-xs text-gray-500 dark:text-gray-400'
                                >
                                    تخفیف کل فاکتور (تومان)
                                </label>
                                <Input
                                    id='cart-discount'
                                    name='cart-discount'
                                    inputMode='numeric'
                                    disabled={loading || !cart.items?.length}
                                    placeholder='۰'
                                    value={(() => {
                                        const raw = cartDiscountDraft ?? String(cart.manual_discount ?? 0);
                                        return toAmount(raw) ? toAmount(raw).toLocaleString('fa-IR') : '';
                                    })()}
                                    onChange={(e) => setCartDiscountDraft(e.target.value)}
                                    onBlur={() => {
                                        if (cartDiscountDraft === null) return;
                                        const amount = toAmount(cartDiscountDraft);
                                        if (amount === (cart.manual_discount ?? 0)) return;
                                        handleCartDiscount(amount);
                                    }}
                                    onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                                />
                            </div>

                            <div>
                                <label htmlFor='discount-code' className='mb-1 block text-xs text-gray-500 dark:text-gray-400'>
                                    کد تخفیف (اختیاری)
                                </label>
                                <Input
                                    id='discount-code'
                                    type='text'
                                    placeholder='مثلاً OFF20'
                                    value={discountCode}
                                    onChange={(e) => setDiscountCode(e.target.value)}
                                    dir='ltr'
                                />
                            </div>

                            <div className='flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-800'>
                                <span className='text-sm text-gray-500'>قابل پرداخت</span>
                                <span className='text-lg font-bold text-gray-900 dark:text-white'>
                                    {formatPrice(cart.payable_amount ?? cart.subtotal)}
                                </span>
                            </div>

                            <Button
                                className='w-full'
                                onClick={handleRegisterOrder}
                                loading={loading}
                                disabled={loading || !cart.items || cart.items.length === 0}
                            >
                                ثبت سفارش
                            </Button>

                            <p className='text-xs leading-5 text-gray-400'>
                                {!cart.items?.length
                                    ? 'برای ثبت سفارش حداقل یک قلم به سبد اضافه کنید.'
                                    : 'مبلغ نهایی پس از اعمال کمپین‌ها و کد تخفیف، در مرحله‌ی بعد نمایش داده می‌شود.'}
                            </p>
                        </div>
                    </aside>
                </div>
            )}

            {step === 'order' && cart && (
                <div className='space-y-6'>
                    <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
                        <p className='font-semibold text-green-700 dark:text-green-400'>سفارش آماده تأیید نهایی است</p>
                        <p className='mt-1 text-sm text-green-600 dark:text-green-500'>پس از تأیید پرداخت، سفارش ثبت می‌شود</p>
                    </div>

                    <div className='space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>جمع کل:</span>
                            <span>{formatPrice(cart.subtotal)}</span>
                        </div>
                        {!!cart.items_manual_discount && (
                            <div
                                className={`flex justify-between text-sm ${
                                    cart.items_manual_discount > 0 ? 'text-green-600' : 'text-red-500'
                                }`}
                            >
                                <span>تعدیل قیمت سطری:</span>
                                <span>
                                    {cart.items_manual_discount > 0 ? '−' : '+'}
                                    {formatPrice(Math.abs(cart.items_manual_discount))}
                                </span>
                            </div>
                        )}
                        {!!cart.manual_discount && (
                            <div className='flex justify-between text-sm text-green-600'>
                                <span>تخفیف کل فاکتور:</span>
                                <span>−{formatPrice(cart.manual_discount)}</span>
                            </div>
                        )}
                        <div className='flex justify-between border-t pt-2 text-base font-bold dark:border-gray-700'>
                            <span>مبلغ نهایی:</span>
                            <span className='text-green-600'>{formatPrice(cart.payable_amount ?? cart.subtotal)}</span>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>روش پرداخت</label>
                        <div className='flex flex-wrap gap-2' role='radiogroup' aria-label='روش پرداخت'>
                            {IN_STORE_PAYMENT_METHODS.map((method) => (
                                <button
                                    key={method.value}
                                    type='button'
                                    role='radio'
                                    aria-checked={paymentMethod === method.value}
                                    onClick={() => setPaymentMethod(method.value)}
                                    className={`min-h-11 rounded-lg border px-4 text-sm transition-colors ${
                                        paymentMethod === method.value
                                            ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                            : 'border-gray-300 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                            توضیحات (اختیاری)
                        </label>
                        <textarea
                            value={orderDescription}
                            onChange={(e) => setOrderDescription(e.target.value)}
                            placeholder='توضیحات سفارش...'
                            rows={3}
                            className='w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 dark:border-gray-700 dark:text-white'
                        />
                    </div>

                    <div className='flex items-center justify-between gap-3'>
                        <div className='flex gap-2'>
                            <button
                                type='button'
                                onClick={() => goToStep('cart')}
                                disabled={loading}
                                className='inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5'
                            >
                                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                    <path d='M11 17l-5-5 5-5' /><path d='M18 17l-5-5 5-5' />
                                </svg>
                                ویرایش سبد
                            </button>
                            <button
                                type='button'
                                onClick={handleChangeCustomer}
                                disabled={loading}
                                className='inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:hover:bg-red-500/10'
                            >
                                <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                                    <path d='M18 6 6 18' /><path d='M6 6l12 12' />
                                </svg>
                                کنسل کردن
                            </button>
                        </div>
                        <Button onClick={handleCompleteOrder} loading={loading} disabled={loading}>
                            تأیید و بستن سفارش
                        </Button>
                    </div>
                </div>
            )}

            <CustomItemModal
                isOpen={customModalOpen}
                initial={editingCustom}
                loading={savingCustom}
                onClose={() => {
                    setCustomModalOpen(false);
                    setEditingCustom(null);
                }}
                onSubmit={handleSaveCustomItem}
            />

            <InvoiceModal
                isOpen={!!invoiceData}
                onClose={() => router.push('/dashboard/order')}
                data={invoiceData}
            />
        </ContentWrapper>
    );
};

export default InStoreSale;

