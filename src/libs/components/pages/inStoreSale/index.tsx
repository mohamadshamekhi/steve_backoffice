'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ContentWrapper from 'libs/components/common/contentWrapper/ContentWrapper';
import { Button, Input } from 'libs/ui';
import AsyncSelectInput from 'libs/ui/asyncSelect';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import noPic from '../../../../../public/images/placeholder/no-pic.png';

type Step = 'phone' | 'name' | 'cart' | 'order';

interface UserData {
    _id: string;
    name?: string;
    phone_number: string;
}

interface CartItem {
    product_id: string;
    variant_id: string;
    quantity: number;
    product_name: string;
    variant_attributes: { key: string; value: string; label: string; meta: string }[];
    price_at_time: number;
    url: string;
}

interface CartData {
    id: string;
    status: string;
    user_id: string;
    items: CartItem[] | null;
    subtotal: number;
}

interface OrderData {
    id: string;
    subtotal_amount: number;
    discounted_subtotal?: number;
    final_amount: number;
    status: string;
    applied_discounts: { discount_id: string; discount_code?: string; amount: number }[];
}

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

    const [user, setUser] = useState<UserData | null>(null);
    const [cart, setCart] = useState<CartData | null>(null);
    const [order, setOrder] = useState<OrderData | null>(null);

    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProductVariants, setSelectedProductVariants] = useState<{ id: string; label: string }[]>([]);
    const [selectedVariantId, setSelectedVariantId] = useState('');
    const [loadingVariants, setLoadingVariants] = useState(false);

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

    const handleAddItem = async (productId: string, variantId: string) => {
        const userId = user?._id ?? searchParams.get('userId');
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
        const userId = user?._id ?? searchParams.get('userId');
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
        const userId = user?._id ?? searchParams.get('userId');
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
        const userId = user?._id ?? searchParams.get('userId');
        if (!userId) return;
        const res = await fetcher(ApiKeys.BACKOFFICE_GET_ACTIVE_CART(userId), 'dashboard', 'GET');
        if (res?.success) {
            setCart(res.data.cart);
        }
    };

    const handleRegisterOrder = async () => {
        const userId = user?._id ?? searchParams.get('userId');
        if (!userId) return;
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_REGISTER_ORDER, 'dashboard', 'POST', {
                body: { user_id: userId, discount_code: discountCode }
            });
            if (res?.success) {
                setOrder(res.data.order);
                goToStep('order');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!order) return;
        setLoading(true);
        try {
            const res = await fetcher(ApiKeys.BACKOFFICE_COMPLETE_ORDER, 'dashboard', 'POST', {
                body: { order_id: order.id, description: orderDescription }
            });
            if (res?.success) {
                toast.success('سفارش با موفقیت ثبت شد');
                router.push('/dashboard/order');
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
            setSelectedProductVariants(
                variants.map((v: { id: string; variant_attribute: { label: string }[] }) => ({
                    id: v.id,
                    label: v.variant_attribute?.map((a: { label: string }) => a.label).join(' / ') || v.id
                }))
            );
        } finally {
            setLoadingVariants(false);
        }
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
                <div className='space-y-6'>
                    {(user || activeUserId) && (
                        <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
                            <div>
                                <p className='font-medium text-gray-800 dark:text-white'>{user?.name || 'بدون نام'}</p>
                                <p className='text-sm text-gray-500' dir='ltr'>
                                    {user?.phone_number}
                                </p>
                            </div>
                            <span className='text-sm text-gray-500'>{activeUserId}</span>
                        </div>
                    )}

                    <div className='space-y-3'>
                        <h3 className='font-semibold text-gray-800 dark:text-white'>افزودن محصول</h3>
                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                            <div>
                                <label className='mb-1 block text-sm text-gray-600 dark:text-gray-400'>محصول</label>
                                <AsyncSelectInput
                                    name='product'
                                    value={selectedProductId}
                                    onChange={handleProductSelect}
                                    loadOptions={loadProductOptions}
                                />
                            </div>
                            <div>
                                <label className='mb-1 block text-sm text-gray-600 dark:text-gray-400'>ورینت</label>
                                <select
                                    value={selectedVariantId}
                                    onChange={(e) => setSelectedVariantId(e.target.value)}
                                    disabled={loadingVariants || !selectedProductVariants.length}
                                    className='h-11 w-full rounded-lg border border-gray-300 bg-transparent px-3 text-sm text-gray-800 disabled:opacity-50 dark:border-gray-700 dark:text-white'
                                >
                                    <option value=''>
                                        {loadingVariants
                                            ? 'در حال بارگذاری...'
                                            : !selectedProductId
                                              ? 'ابتدا محصول انتخاب کنید'
                                              : 'ورینت را انتخاب کنید'}
                                    </option>
                                    {selectedProductVariants.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Button
                            size='sm'
                            disabled={!selectedProductId || !selectedVariantId || loading}
                            loading={loading}
                            onClick={() => handleAddItem(selectedProductId, selectedVariantId)}
                        >
                            افزودن به سبد
                        </Button>
                    </div>

                    <div>
                        <h3 className='mb-3 font-semibold text-gray-800 dark:text-white'>آیتم‌های سبد خرید</h3>
                        {!cart.items || cart.items.length === 0 ? (
                            <div className='rounded-lg border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-600'>
                                سبد خرید خالی است
                            </div>
                        ) : (
                            <div className='space-y-3'>
                                {cart.items.map((item) => (
                                    <div
                                        key={item.variant_id}
                                        className='flex items-center gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700'
                                    >
                                        <div className='shrink-0'>
                                            <Image
                                                src={item.url || noPic}
                                                alt={item.product_name}
                                                width={56}
                                                height={56}
                                                className='rounded-md object-cover'
                                            />
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                            <p className='truncate text-sm font-medium text-gray-800 dark:text-white'>
                                                {item.product_name}
                                            </p>
                                            <div className='mt-1 flex flex-wrap gap-1'>
                                                {item.variant_attributes.map((attr, i) => (
                                                    <span
                                                        key={i}
                                                        className='inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700'
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
                                            <p className='mt-1 text-xs text-gray-500'>
                                                {formatPrice(item.price_at_time)}
                                            </p>
                                        </div>
                                        <div className='flex shrink-0 items-center gap-1'>
                                            <button
                                                onClick={() => handleRemoveItem(item.product_id, item.variant_id)}
                                                disabled={loading}
                                                className='flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300'
                                                title='کاهش تعداد'
                                            >
                                                −
                                            </button>
                                            <span className='w-6 text-center text-sm font-medium'>{item.quantity}</span>
                                            <button
                                                onClick={() => handleAddItem(item.product_id, item.variant_id)}
                                                disabled={loading}
                                                className='flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300'
                                                title='افزایش تعداد'
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.variant_id)}
                                                disabled={loading}
                                                className='mr-2 flex h-7 w-7 items-center justify-center rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800'
                                                title='حذف کامل'
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className='flex items-center justify-between border-t pt-3 dark:border-gray-700'>
                                    <span className='text-sm text-gray-500'>جمع کل:</span>
                                    <span className='font-semibold text-gray-800 dark:text-white'>
                                        {formatPrice(cart.subtotal)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
                        <h3 className='font-semibold text-gray-800 dark:text-white'>کد تخفیف (اختیاری)</h3>
                        <Input
                            type='text'
                            placeholder='کد تخفیف'
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            dir='ltr'
                        />
                    </div>

                    <div className='flex justify-end'>
                        <Button
                            onClick={handleRegisterOrder}
                            loading={loading}
                            disabled={loading || !cart.items || cart.items.length === 0}
                        >
                            ثبت سفارش
                        </Button>
                    </div>
                </div>
            )}

            {step === 'order' && order && (
                <div className='space-y-6'>
                    <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20'>
                        <p className='font-semibold text-green-700 dark:text-green-400'>سفارش آماده تأیید نهایی است</p>
                        <p className='mt-1 text-sm text-green-600 dark:text-green-500'>شناسه: {order.id}</p>
                    </div>

                    <div className='space-y-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700'>
                        <div className='flex justify-between text-sm'>
                            <span className='text-gray-500'>جمع کل:</span>
                            <span>{formatPrice(order.subtotal_amount)}</span>
                        </div>
                        {order.applied_discounts?.length > 0 && (
                            <div className='flex justify-between text-sm text-green-600'>
                                <span>تخفیف:</span>
                                <span>−{formatPrice(order.subtotal_amount - order.final_amount)}</span>
                            </div>
                        )}
                        <div className='flex justify-between border-t pt-2 text-base font-bold dark:border-gray-700'>
                            <span>مبلغ نهایی:</span>
                            <span className='text-green-600'>{formatPrice(order.final_amount)}</span>
                        </div>
                    </div>

                    {order.applied_discounts?.length > 0 && (
                        <div className='space-y-2'>
                            <h3 className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                تخفیف‌های اعمال‌شده
                            </h3>
                            {order.applied_discounts.map((d) => (
                                <div
                                    key={d.discount_id}
                                    className='flex justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800'
                                >
                                    <span className='text-gray-500'>
                                        {d.discount_code ? `کد: ${d.discount_code}` : 'تخفیف خودکار'}
                                    </span>
                                    <span className='text-green-600'>−{formatPrice(d.amount)}</span>
                                </div>
                            ))}
                        </div>
                    )}

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

                    <div className='flex justify-end'>
                        <Button onClick={handleCompleteOrder} loading={loading} disabled={loading}>
                            تأیید و بستن سفارش
                        </Button>
                    </div>
                </div>
            )}
        </ContentWrapper>
    );
};

export default InStoreSale;

