'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { Badge } from 'libs/ui';
import { Modal } from 'libs/ui/modal';
import { useEffect } from 'react';
import useSWR from 'swr';

// TODO:  move to types and use this list and details page
enum DiscountTypeFa {
    fixed_amount = 'مبلغ ثابت',
    percentage = 'درصدی'
}

interface ApplicableProductDetail {
    product_id: string;
    variant_id: string;
    discount_type: 'fixed_amount' | 'percentage';
    discount_value: number;
}

interface DiscountDetail {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    starts_at: string;
    expires_at: string;
    applicable_to: string;
    applicable_product_ids: ApplicableProductDetail[];
    is_active: boolean;
    is_special?: boolean;
    minimum_purchase_amount?: number;
    total_usage_limit?: number;
    created_at: string;
    updated_at: string;
}

interface IDataProps {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number;
    expires_at: string;
    starts_at: string;
    applicable_product_ids: string[];
}

interface IDetailProps {
    data: IDataProps;
    onClose: () => void;
    isOpen: boolean;
}

interface ProductItemProps {
    productId: string;
    variantId: string;
    discountType: 'fixed_amount' | 'percentage';
    discountValue: number;
}

const ProductItem = ({ productId, variantId, discountType, discountValue }: ProductItemProps) => {
    const { data: productData, isLoading } = useSWR(productId ? ApiKeys.GET_PRODUCT(productId) : null, (url) =>
        fetcher(url, 'dashboard', 'GET')
    );

    const product = productData?.data?.product;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variant = product?.variants?.find((v: any) => v.id === variantId);

    if (isLoading) {
        return (
            <div className='rounded border border-gray-200 p-3'>
                <div className='text-sm text-gray-500'>در حال بارگذاری...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className='rounded border border-gray-200 p-3'>
                <div className='text-sm text-red-500'>محصول یافت نشد</div>
            </div>
        );
    }

    const variantLabel = variant?.variant_attribute
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ?.map((attr: any) => `${attr.key}: ${attr.label}`)
        .join(', ');

    return (
        <div className='rounded border border-gray-200 p-3'>
            <div className='mb-2 font-medium'>{product.name}</div>
            <div className='space-y-1 text-sm text-gray-600'>
                <div>
                    <span className='font-medium'>ورینت:</span> {variantLabel || 'نامشخص'}
                </div>
                <div>
                    <span className='font-medium'>نوع تخفیف:</span>{' '}
                    <Badge size='sm'>{DiscountTypeFa[discountType]}</Badge>
                </div>
                <div>
                    <span className='font-medium'>مقدار تخفیف:</span>{' '}
                    {discountType === 'percentage' ? `${discountValue}%` : `${discountValue.toLocaleString()} تومان`}
                </div>
            </div>
        </div>
    );
};

const Detail = ({ isOpen, onClose, data }: IDetailProps) => {
    const { data: discountDetails } = useSWR(isOpen && data?.id ? ApiKeys.GET_DISCOUNT(data.id) : null, (url) =>
        fetcher(url, 'dashboard', 'GET')
    );

    useEffect(() => {
        if (discountDetails) {
            console.log('Discount Details:', discountDetails);
        }
    }, [discountDetails]);

    const discount: DiscountDetail | undefined = discountDetails?.data?.discount;

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[800px]'>
            <div className='space-y-6'>
                <h2 className='text-xl font-bold'>جزئیات تخفیف</h2>

                <ul className='space-y-2 *:border-b *:border-gray-200 *:py-2'>
                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>نوع تخفیف کلی</span>
                        <Badge>{DiscountTypeFa[data.type]}</Badge>
                    </li>

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>کد تخفیف</span>
                        <span>{discount?.code || data.code || '-'}</span>
                    </li>

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>مقدار کلی</span>
                        <span>
                            {data.type === 'percentage' ? `${data.value}%` : `${data.value.toLocaleString()} تومان`}
                        </span>
                    </li>

                    {discount?.minimum_purchase_amount && (
                        <li className='flex flex-wrap items-center gap-2'>
                            <span className='basis-1/4 text-gray-400'>حداقل مبلغ خرید</span>
                            <span>{discount.minimum_purchase_amount.toLocaleString()} تومان</span>
                        </li>
                    )}

                    {discount?.total_usage_limit && (
                        <li className='flex flex-wrap items-center gap-2'>
                            <span className='basis-1/4 text-gray-400'>محدودیت استفاده</span>
                            <span>{discount.total_usage_limit} بار</span>
                        </li>
                    )}

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>وضعیت</span>
                        <Badge color={discount?.is_active ? 'success' : 'error'}>
                            {discount?.is_active ? 'فعال' : 'غیرفعال'}
                        </Badge>
                    </li>

                    {discount?.is_special && (
                        <li className='flex flex-wrap items-center gap-2'>
                            <span className='basis-1/4 text-gray-400'>تخفیف ویژه</span>
                            <Badge color='warning'>ویژه</Badge>
                        </li>
                    )}

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>زمان شروع</span>
                        <span>{new Date(data.starts_at).toLocaleDateString('fa-IR')}</span>
                    </li>

                    <li className='flex flex-wrap items-center gap-2'>
                        <span className='basis-1/4 text-gray-400'>زمان پایان</span>
                        <span>{new Date(data.expires_at).toLocaleDateString('fa-IR')}</span>
                    </li>
                </ul>

                {discount?.applicable_product_ids && discount.applicable_product_ids.length > 0 && (
                    <div>
                        <h3 className='mb-3 text-lg font-semibold'>محصولات قابل اعمال تخفیف</h3>
                        <div className='space-y-3'>
                            {discount.applicable_product_ids.map((item, index) => (
                                <ProductItem
                                    key={index}
                                    productId={item.product_id}
                                    variantId={item.variant_id}
                                    discountType={item.discount_type}
                                    discountValue={item.discount_value}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default Detail;
