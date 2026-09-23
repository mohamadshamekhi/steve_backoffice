'use client';

import { OrderEdit, OrderEditChange, OrderItem, ShippingAddress, formatDate, formatPrice, variantLabel } from '../order.types';

const CHANGE_LABELS: Record<OrderEditChange, string> = {
    items: 'اقلام',
    user_id: 'مشتری',
    shipping_address: 'آدرس',
    shipping_amount: 'هزینه‌ی ارسال',
    manual_discount_amount: 'تخفیف دستی'
};

const addressText = (a?: ShippingAddress) =>
    [a?.province, a?.city, a?.street, a?.postcode].filter(Boolean).join('، ') || '—';

const lineKey = (it: OrderItem) => it.VariantID || it.ProductName;
const lineText = (it?: OrderItem) =>
    it ? `${it.Quantity.toLocaleString('fa-IR')} × ${formatPrice(it.PriceAtTime)}${it.DiscountAmount ? ` − ${formatPrice(it.DiscountAmount)}` : ''}` : '—';

const Diff = ({ label, before, after }: { label: string; before: string; after: string }) => (
    <div className='grid grid-cols-1 gap-1 py-1.5 text-xs sm:grid-cols-[120px_1fr]'>
        <span className='text-gray-500'>{label}</span>
        <span className='flex flex-wrap items-center gap-1.5'>
            <span className='text-gray-400 line-through'>{before}</span>
            <span aria-hidden className='text-gray-400'>←</span>
            <span className='font-medium text-gray-800 dark:text-white/90'>{after}</span>
        </span>
    </div>
);

const ItemsDiff = ({ before, after }: { before: OrderItem[]; after: OrderItem[] }) => {
    const keys = Array.from(new Set([...before.map(lineKey), ...after.map(lineKey)]));
    const rows = keys
        .map((k) => ({ b: before.find((it) => lineKey(it) === k), a: after.find((it) => lineKey(it) === k) }))
        .filter(({ b, a }) => lineText(b) !== lineText(a));
    if (!rows.length) return null;
    return (
        <div className='py-1.5'>
            <span className='text-xs text-gray-500'>اقلام</span>
            <ul className='mt-1 space-y-1'>
                {rows.map(({ b, a }) => {
                    const it = (a ?? b)!;
                    const tag = !b ? 'افزوده' : !a ? 'حذف' : '';
                    return (
                        <li key={lineKey(it)} className='rounded-md bg-gray-50 px-2 py-1.5 text-xs dark:bg-white/[0.03]'>
                            <span className='font-medium text-gray-700 dark:text-gray-300'>
                                {it.ProductName}
                                {variantLabel(it) && <span className='text-gray-400'> ({variantLabel(it)})</span>}
                            </span>
                            {tag && (
                                <span className={`ms-2 rounded px-1.5 text-[11px] ${!b ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
                                    {tag}
                                </span>
                            )}
                            <div className='mt-0.5 flex flex-wrap gap-1.5 tabular-nums'>
                                <span className='text-gray-400 line-through'>{lineText(b)}</span>
                                <span aria-hidden className='text-gray-400'>←</span>
                                <span className='text-gray-800 dark:text-white/90'>{lineText(a)}</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const EditHistory = ({ edits }: { edits?: OrderEdit[] }) => {
    if (!edits?.length) return null;
    return (
        <div>
            <h3 className='mb-3 font-semibold text-gray-700 dark:text-gray-300'>تاریخچه‌ی ویرایش</h3>
            <ol className='space-y-3 border-s-2 border-gray-200 ps-4 dark:border-gray-800'>
                {[...edits].reverse().map((e) => {
                    const { before: b, after: a } = e;
                    return (
                        <li key={e.id} className='relative rounded-lg border border-gray-200 p-3 dark:border-gray-800'>
                            <span aria-hidden className='absolute -start-[23px] top-4 h-2.5 w-2.5 rounded-full bg-warning-500' />
                            <div className='flex flex-wrap items-center justify-between gap-2'>
                                <span className='text-xs text-gray-500'>{formatDate(e.edited_at)}</span>
                                <div className='flex flex-wrap gap-1'>
                                    {(e.changes ?? []).map((c) => (
                                        <span key={c} className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
                                            {CHANGE_LABELS[c] ?? c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <p className='mt-2 text-sm text-gray-800 dark:text-white/90'>{e.reason}</p>
                            <p dir='ltr' className='mt-0.5 font-mono text-[11px] text-gray-400 [text-align:right]'>
                                {e.edited_by}
                            </p>

                            <div className='mt-2 divide-y divide-gray-100 dark:divide-gray-800'>
                                {b.final_amount !== a.final_amount && (
                                    <Diff label='مبلغ نهایی' before={formatPrice(b.final_amount)} after={formatPrice(a.final_amount)} />
                                )}
                                {e.changes?.includes('items') && <ItemsDiff before={b.items ?? []} after={a.items ?? []} />}
                                {b.shipping_amount !== a.shipping_amount && (
                                    <Diff label='هزینه‌ی ارسال' before={formatPrice(b.shipping_amount)} after={formatPrice(a.shipping_amount)} />
                                )}
                                {b.manual_discount_amount !== a.manual_discount_amount && (
                                    <Diff
                                        label='تخفیف دستی'
                                        before={formatPrice(b.manual_discount_amount)}
                                        after={formatPrice(a.manual_discount_amount)}
                                    />
                                )}
                                {e.changes?.includes('shipping_address') && (
                                    <Diff label='آدرس' before={addressText(b.shipping_address)} after={addressText(a.shipping_address)} />
                                )}
                                {b.user_id !== a.user_id && <Diff label='شناسه‌ی مشتری' before={b.user_id} after={a.user_id} />}
                            </div>

                            {!!e.cash_difference && (
                                <p className={`mt-2 text-xs ${e.cash_difference > 0 ? 'text-success-600' : 'text-error-600'}`}>
                                    صندوق: {formatPrice(Math.abs(e.cash_difference))}{' '}
                                    {e.cash_difference > 0 ? 'دریافت از مشتری' : 'پرداخت به مشتری'}
                                </p>
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export default EditHistory;
