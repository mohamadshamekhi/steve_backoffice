'use client';

import { useIsScopedOnlyUser } from 'libs/components/common/ScopedRoleGuard';
import CartIcon from 'libs/components/icons/CartIcon';
import ROUTES from 'libs/constants/routes/routes.constants';
import { Link } from 'libs/ui';
import { Dropdown } from 'libs/ui/dropdown/Dropdown';
import Image from 'next/image';
import { useState } from 'react';
import noPic from '../../../../../../public/images/placeholder/no-pic.png';
import { formatToman } from '../constants';
import { usePartnerCart } from '../usePartnerCart';

const PartnerCartMenu = () => {
    const enabled = useIsScopedOnlyUser();

    const { cart, count } = usePartnerCart(enabled);

    const [isOpen, setIsOpen] = useState(false);

    if (!enabled) return null;

    return (
        <div className='relative'>
            <button
                type='button'
                onClick={() => setIsOpen((prev) => !prev)}
                className='dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                aria-label='سبد خرید'
            >
                <CartIcon className='h-5 w-5' />
                {count > 0 && (
                    <span className='bg-error-500 absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold text-white'>
                        {count}
                    </span>
                )}
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className='mt-3 flex max-h-[420px] w-[320px] flex-col p-3'
            >
                <div className='mb-2 flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800'>
                    <h5 className='text-sm font-semibold text-gray-800 dark:text-gray-200'>سبد خرید</h5>
                    <span className='text-xs text-gray-400'>{count} کالا</span>
                </div>

                {cart.items.length === 0 ? (
                    <p className='py-6 text-center text-sm text-gray-400'>سبد خرید شما خالی است.</p>
                ) : (
                    <ul className='custom-scrollbar flex flex-col divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800'>
                        {cart.items.map((item) => (
                            <li key={`${item.product_id}:${item.variant_id}`} className='flex gap-2 py-2'>
                                <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-50 dark:bg-gray-900'>
                                    <Image
                                        src={item.url || noPic}
                                        alt={item.product_name}
                                        fill
                                        className='object-contain p-0.5'
                                        sizes='48px'
                                    />
                                </div>
                                <div className='flex flex-1 flex-col'>
                                    <span className='line-clamp-1 text-xs font-medium text-gray-800 dark:text-white/90'>
                                        {item.product_name}
                                    </span>
                                    <span className='text-xs text-gray-400'>
                                        {item.quantity} × {formatToman(item.unit_price)}
                                    </span>
                                    {!item.in_stock && (
                                        <span className='text-error-500 text-[11px]'>ناموجود</span>
                                    )}
                                </div>
                                <span className='text-xs font-semibold whitespace-nowrap'>
                                    {formatToman(item.line_total)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}

                <div className='mt-2 space-y-2 border-t border-gray-100 pt-2 dark:border-gray-800'>
                    <div className='flex justify-between text-sm'>
                        <span className='text-gray-500'>جمع سبد</span>
                        <span className='font-semibold'>{formatToman(cart.subtotal)}</span>
                    </div>
                    <Link
                        href={ROUTES.PartnerShopCart}
                        onClick={() => setIsOpen(false)}
                        className='bg-brand-500 hover:bg-brand-600 block rounded-lg px-4 py-2 text-center text-sm font-medium text-white'
                    >
                        مشاهدهٔ سبد خرید
                    </Link>
                </div>
            </Dropdown>
        </div>
    );
};

export default PartnerCartMenu;
