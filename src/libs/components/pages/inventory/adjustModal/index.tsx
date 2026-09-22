'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import ProductVariantPicker from 'libs/components/common/productVariantPicker';
import { Button, Input } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { inventoryAdjustSchema } from 'libs/validator/schemas/warehouse.schema';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    mutate: () => void;
    /** Pre-selected variant when opened from a stock row. */
    target?: { product_id: string; variant_id: string; product_name?: string } | null;
}

const AdjustModal = ({ isOpen, onClose, mutate, target }: IProps) => {
    const [loading, setLoading] = useState(false);
    const [productId, setProductId] = useState(target?.product_id ?? '');
    const [variantId, setVariantId] = useState(target?.variant_id ?? '');

    const formik = useFormik<{
        direction: 'increase' | 'decrease';
        quantity: number;
        unit_cost: number;
        note: string;
    }>({
        initialValues: { direction: 'increase', quantity: 1, unit_cost: 0, note: '' },
        validationSchema: toFormikValidationSchema(inventoryAdjustSchema),
        onSubmit: async (values) => {
            if (!productId || !variantId) {
                toast.error('محصول و واریانت را انتخاب کنید');
                return;
            }

            setLoading(true);
            try {
                const signedQuantity =
                    values.direction === 'decrease' ? -Math.abs(values.quantity) : Math.abs(values.quantity);

                const response = await fetcher(ApiKeys.POST_INVENTORY_ADJUST, 'dashboard', 'POST', {
                    body: {
                        product_id: productId,
                        variant_id: variantId,
                        quantity: signedQuantity,
                        // unit_cost only affects the weighted average on positive adjustments.
                        ...(values.direction === 'increase' && values.unit_cost > 0 && { unit_cost: values.unit_cost }),
                        note: values.note
                    }
                });

                if (response?.success) {
                    toast.success('موجودی اصلاح شد');
                    mutate();
                    onClose();
                }
            } finally {
                setLoading(false);
            }
        }
    });

    const isIncrease = formik.values.direction === 'increase';

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[620px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>اصلاح موجودی (انبارگردانی)</h3>

            <form onSubmit={formik.handleSubmit} className='mt-5 space-y-4'>
                <div>
                    <label className='mb-1 block text-xs text-gray-400'>محصول و واریانت</label>
                    <ProductVariantPicker
                        productId={productId}
                        variantId={variantId}
                        disabled={Boolean(target)}
                        initialProductOption={
                            target?.product_name ? { value: target.product_id, label: target.product_name } : null
                        }
                        onChange={({ product_id, variant_id }) => {
                            setProductId(product_id);
                            setVariantId(variant_id);
                        }}
                    />
                </div>

                <div className='flex items-center gap-4'>
                    {[
                        { value: 'increase' as const, label: 'افزایش' },
                        { value: 'decrease' as const, label: 'کاهش' }
                    ].map((option) => (
                        <label key={option.value} className='flex cursor-pointer items-center gap-2 text-sm'>
                            <input
                                type='radio'
                                name='direction'
                                value={option.value}
                                checked={formik.values.direction === option.value}
                                onChange={() => formik.setFieldValue('direction', option.value)}
                                className='accent-brand-500 h-4 w-4'
                            />
                            {option.label}
                        </label>
                    ))}
                </div>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    <Fieldset label='تعداد' name='quantity' touched={formik.touched} errors={formik.errors}>
                        <Input
                            name='quantity'
                            type='number'
                            min='1'
                            inputMode='numeric'
                            value={formik.values.quantity}
                            error={Boolean(formik.touched.quantity && formik.errors.quantity)}
                            onChange={formik.handleChange}
                        />
                    </Fieldset>

                    {isIncrease && (
                        <Fieldset
                            label='قیمت واحد (اختیاری)'
                            name='unit_cost'
                            touched={formik.touched}
                            errors={formik.errors}
                            hint='اگر وارد شود، میانگین موزون قیمت خرید هم به‌روز می‌شود.'
                        >
                            <Input
                                name='unit_cost'
                                type='number'
                                min='0'
                                inputMode='numeric'
                                value={formik.values.unit_cost}
                                error={Boolean(formik.touched.unit_cost && formik.errors.unit_cost)}
                                onChange={formik.handleChange}
                            />
                        </Fieldset>
                    )}
                </div>

                <Fieldset
                    label='دلیل اصلاح'
                    name='note'
                    touched={formik.touched}
                    errors={formik.errors}
                    hint='مثلاً: مغایرت انبارگردانی مهر'
                >
                    <Input
                        name='note'
                        value={formik.values.note}
                        error={Boolean(formik.touched.note && formik.errors.note)}
                        onChange={formik.handleChange}
                    />
                </Fieldset>

                <div className='flex justify-end gap-2'>
                    <Button type='button' size='sm' variant='outline' onClick={onClose}>
                        انصراف
                    </Button>
                    <Button type='submit' size='sm' loading={loading} disabled={loading}>
                        ثبت اصلاح
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AdjustModal;
