'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { CSelect } from 'libs/ui';
import AsyncSelectInput from 'libs/ui/select/AsyncSelectInput';
import { useEffect, useState } from 'react';

type Option = { label: string; value: string };

export const loadProductOptions = async (inputValue: string): Promise<Option[]> => {
    const res = await fetcher(ApiKeys.GET_ALL_PRODUCT, 'dashboard', 'GET', {
        params: { page_number: 1, page_size: 20, ...(inputValue && { name: inputValue }) }
    });
    return (res?.data?.products ?? []).map((product: { id: string; name: string }) => ({
        value: product.id,
        label: product.name
    }));
};

interface IProps {
    productId: string;
    variantId: string;
    onChange: (value: { product_id: string; variant_id: string; product_name?: string }) => void;
    productError?: boolean;
    variantError?: boolean;
    initialProductOption?: Option | null;
    disabled?: boolean;
}

/** Product search + dependent variant picker, shared by purchase items and inventory adjustment. */
const ProductVariantPicker = ({
    productId,
    variantId,
    onChange,
    productError,
    variantError,
    initialProductOption = null,
    disabled = false
}: IProps) => {
    const [variants, setVariants] = useState<Option[]>([]);
    const [loadingVariants, setLoadingVariants] = useState(false);

    useEffect(() => {
        let ignore = false;

        if (!productId) {
            setVariants([]);
            return;
        }

        setLoadingVariants(true);
        fetcher(ApiKeys.GET_PRODUCT(productId), 'dashboard', 'GET')
            .then((res) => {
                if (ignore) return;
                const list = res?.data?.product?.variants ?? [];
                setVariants(
                    list.map((variant: { id: string; variant_attribute?: { label: string }[] }) => ({
                        value: variant.id,
                        label: variant.variant_attribute?.map((attr) => attr.label).join(' / ') || variant.id
                    }))
                );
            })
            .finally(() => !ignore && setLoadingVariants(false));

        return () => {
            ignore = true;
        };
    }, [productId]);

    return (
        <div className='flex flex-col gap-2 md:flex-row'>
            <div className='min-w-0 flex-1'>
                <AsyncSelectInput
                    name='product_id'
                    value={productId}
                    error={productError}
                    isDisabled={disabled}
                    initialOption={initialProductOption}
                    placeholder='جست‌وجوی محصول...'
                    defaultOptions
                    loadOptions={loadProductOptions}
                    onChange={(value) => onChange({ product_id: value, variant_id: '' })}
                />
            </div>
            <div className='min-w-0 flex-1'>
                <CSelect
                    name='variant_id'
                    options={variants}
                    value={variantId}
                    error={variantError}
                    isDisabled={disabled || !productId || loadingVariants}
                    placeholder={loadingVariants ? 'در حال بارگذاری...' : 'انتخاب واریانت'}
                    onChange={(value) => onChange({ product_id: productId, variant_id: value })}
                />
            </div>
        </div>
    );
};

export default ProductVariantPicker;
