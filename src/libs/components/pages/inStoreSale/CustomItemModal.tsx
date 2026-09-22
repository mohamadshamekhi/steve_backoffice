'use client';

import { Button, Input } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export type CustomItemKind = 'service' | 'physical';

export interface CustomItemDraft {
    variant_id?: string;
    title: string;
    unit_price: number;
    quantity: number;
    kind: CustomItemKind;
    unit_cost: number;
}

interface Props {
    isOpen: boolean;
    initial?: CustomItemDraft | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (draft: CustomItemDraft) => void;
}

const emptyDraft: CustomItemDraft = {
    title: '',
    unit_price: 0,
    quantity: 1,
    kind: 'service',
    unit_cost: 0
};

const iconProps = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true
};

const WrenchIcon = () => (
    <svg {...iconProps}>
        <path d='M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.5-.5-2.4 2.5-2.7Z' />
    </svg>
);

const BoxIcon = () => (
    <svg {...iconProps}>
        <path d='M21 8 12 3 3 8v8l9 5 9-5V8Z' />
        <path d='m3 8 9 5 9-5M12 13v8' />
    </svg>
);

const kinds: { key: CustomItemKind; label: string; hint: string; icon: React.ReactNode }[] = [
    { key: 'service', label: 'خدمات', hint: 'تعمیر، اپل‌آیدی و…', icon: <WrenchIcon /> },
    { key: 'physical', label: 'کالای بیرونی', hint: 'قطعه‌ی تهیه‌شده از بیرون', icon: <BoxIcon /> }
];

const toNumber = (v: string) => Number(v.replace(/[^\d۰-۹]/g, '').replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) || 0;

const formatToman = (value: number) => `${value.toLocaleString('fa-IR')} تومان`;

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';

const CustomItemModal = ({ isOpen, initial, loading, onClose, onSubmit }: Props) => {
    const [draft, setDraft] = useState<CustomItemDraft>(emptyDraft);
    const isEdit = Boolean(initial?.variant_id);

    useEffect(() => {
        if (isOpen) setDraft(initial ?? emptyDraft);
    }, [isOpen, initial]);

    const setQuantity = (quantity: number) => setDraft((d) => ({ ...d, quantity: Math.max(1, quantity) }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!draft.title.trim()) {
            toast.error('عنوان ردیف را وارد کنید');
            return;
        }
        if (draft.unit_price <= 0) {
            toast.error('قیمت واحد باید بیشتر از صفر باشد');
            return;
        }
        if (draft.quantity < 1) {
            toast.error('تعداد باید حداقل ۱ باشد');
            return;
        }
        onSubmit({
            ...draft,
            title: draft.title.trim(),
            unit_cost: draft.kind === 'physical' ? draft.unit_cost : 0
        });
    };

    const total = draft.unit_price * draft.quantity;
    const profit = (draft.unit_price - draft.unit_cost) * draft.quantity;
    const showProfit = draft.kind === 'physical' && draft.unit_cost > 0 && draft.unit_price > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton={false}
            containerClassName='max-w-[520px]'
            className='p-0! lg:p-0!'
        >
            <form onSubmit={handleSubmit} noValidate>
                <header className='flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800'>
                    <div>
                        <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                            {isEdit ? 'ویرایش ردیف دستی' : 'افزودن ردیف دستی'}
                        </h2>
                        <p className='mt-0.5 text-sm text-gray-500 dark:text-gray-400'>
                            برای خدمات یا کالایی که در لیست محصولات نیست.
                        </p>
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        aria-label='بستن'
                        className='-m-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/5 dark:hover:text-white'
                    >
                        <svg {...iconProps} width={20} height={20}>
                            <path d='M18 6 6 18M6 6l12 12' />
                        </svg>
                    </button>
                </header>

                <div className='space-y-5 px-5 py-5 sm:px-6'>
                    <fieldset>
                        <legend className={labelClass}>نوع ردیف</legend>
                        <div role='radiogroup' className='grid grid-cols-2 gap-3'>
                            {kinds.map((k) => {
                                const active = draft.kind === k.key;
                                return (
                                    <button
                                        key={k.key}
                                        type='button'
                                        role='radio'
                                        aria-checked={active}
                                        onClick={() => setDraft((d) => ({ ...d, kind: k.key }))}
                                        className={`relative flex min-h-11 items-center gap-3 rounded-xl border p-3 text-right transition-colors ${
                                            active
                                                ? 'border-brand-500 bg-brand-50 ring-brand-500 ring-1 dark:bg-brand-500/10'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        <span
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                                                active
                                                    ? 'bg-brand-500 text-white'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                            }`}
                                        >
                                            {k.icon}
                                        </span>
                                        <span className='min-w-0'>
                                            <span className='block text-sm font-semibold text-gray-800 dark:text-white'>
                                                {k.label}
                                            </span>
                                            <span className='block truncate text-xs text-gray-500 dark:text-gray-400'>
                                                {k.hint}
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>

                    <div>
                        <label htmlFor='custom-title' className={labelClass}>
                            عنوان
                        </label>
                        <Input
                            id='custom-title'
                            name='title'
                            placeholder={draft.kind === 'service' ? 'مثلاً: تعویض باتری آیفون ۱۳' : 'مثلاً: گلس سرامیکی'}
                            value={draft.title}
                            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto]'>
                        <div>
                            <label htmlFor='custom-price' className={labelClass}>
                                قیمت فروش هر واحد
                            </label>
                            <div className='relative'>
                                <Input
                                    id='custom-price'
                                    name='unit_price'
                                    inputMode='numeric'
                                    placeholder='۰'
                                    className='pl-14'
                                    value={draft.unit_price ? draft.unit_price.toLocaleString('fa-IR') : ''}
                                    onChange={(e) => setDraft((d) => ({ ...d, unit_price: toNumber(e.target.value) }))}
                                />
                                <span className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-gray-400'>
                                    تومان
                                </span>
                            </div>
                        </div>

                        <div>
                            <span id='custom-qty-label' className={labelClass}>
                                تعداد
                            </span>
                            <div
                                role='group'
                                aria-labelledby='custom-qty-label'
                                className='flex h-11 items-center rounded-lg border border-gray-300 dark:border-gray-700'
                            >
                                <button
                                    type='button'
                                    onClick={() => setQuantity(draft.quantity + 1)}
                                    aria-label='افزایش تعداد'
                                    className='flex h-full w-11 items-center justify-center text-lg text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5'
                                >
                                    +
                                </button>
                                <input
                                    id='custom-qty'
                                    inputMode='numeric'
                                    aria-label='تعداد'
                                    value={draft.quantity ? draft.quantity.toLocaleString('fa-IR') : ''}
                                    onChange={(e) => setDraft((d) => ({ ...d, quantity: toNumber(e.target.value) }))}
                                    onBlur={() => setQuantity(draft.quantity)}
                                    className='h-full w-12 border-x border-gray-300 bg-transparent text-center text-sm font-medium text-gray-800 outline-none dark:border-gray-700 dark:text-white'
                                />
                                <button
                                    type='button'
                                    onClick={() => setQuantity(draft.quantity - 1)}
                                    disabled={draft.quantity <= 1}
                                    aria-label='کاهش تعداد'
                                    className='flex h-full w-11 items-center justify-center text-lg text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-white/5'
                                >
                                    −
                                </button>
                            </div>
                        </div>
                    </div>

                    {draft.kind === 'physical' && (
                        <div>
                            <label htmlFor='custom-cost' className={labelClass}>
                                قیمت خرید هر واحد <span className='font-normal text-gray-400'>(اختیاری)</span>
                            </label>
                            <div className='relative'>
                                <Input
                                    id='custom-cost'
                                    name='unit_cost'
                                    inputMode='numeric'
                                    placeholder='۰'
                                    className='pl-14'
                                    value={draft.unit_cost ? draft.unit_cost.toLocaleString('fa-IR') : ''}
                                    onChange={(e) => setDraft((d) => ({ ...d, unit_cost: toNumber(e.target.value) }))}
                                />
                                <span className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-gray-400'>
                                    تومان
                                </span>
                            </div>
                            <p className='mt-1.5 text-xs leading-5 text-gray-500 dark:text-gray-400'>
                                روی فاکتور مشتری نمی‌آید؛ فقط برای محاسبه‌ی سود استفاده می‌شود.
                            </p>
                        </div>
                    )}

                    <div className='rounded-xl bg-gray-50 px-4 py-3 dark:bg-white/[0.03]'>
                        <div className='flex items-center justify-between'>
                            <span className='text-sm text-gray-500 dark:text-gray-400'>مبلغ ردیف</span>
                            <span className='text-lg font-bold text-gray-900 dark:text-white'>{formatToman(total)}</span>
                        </div>
                        {draft.quantity > 1 && draft.unit_price > 0 && (
                            <p className='mt-0.5 text-left text-xs text-gray-400'>
                                {formatToman(draft.unit_price)} × {draft.quantity.toLocaleString('fa-IR')}
                            </p>
                        )}
                        {showProfit && (
                            <div className='mt-2 flex items-center justify-between border-t border-gray-200 pt-2 text-sm dark:border-gray-700'>
                                <span className='text-gray-500 dark:text-gray-400'>سود این ردیف</span>
                                <span className={profit >= 0 ? 'text-success-600' : 'text-error-600'}>
                                    {profit < 0 && '−'}
                                    {formatToman(Math.abs(profit))}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <footer className='flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:px-6 dark:border-gray-800'>
                    <Button type='submit' className='sm:flex-1' loading={loading} disabled={loading}>
                        {isEdit ? 'ذخیره تغییرات' : 'افزودن به سبد'}
                    </Button>
                    <Button type='button' variant='outline' onClick={onClose} disabled={loading}>
                        انصراف
                    </Button>
                </footer>
            </form>
        </Modal>
    );
};

export default CustomItemModal;
