'use client';

import { useFormik } from 'formik';
import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import SupplierSelect from 'libs/components/pages/supplier/select';
import { formatToman, STOCK_MODE_OPTIONS } from 'libs/constants/warehouse/warehouse.constants';
import { StockMode } from 'libs/models/warehouse.model';
import { Button, Input, Switch } from 'libs/ui';
import Fieldset from 'libs/ui/form/FieldSet/Fieldset';
import { Modal } from 'libs/ui/modal';
import { stockConfigSchema } from 'libs/validator/schemas/warehouse.schema';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { toFormikValidationSchema } from 'zod-formik-adapter';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    mutate: () => void;
    productId: string;
    variantId: string;
    productName?: string;
}

interface VariantConfig {
    stock_mode?: StockMode;
    allow_backorder?: boolean;
    backorder_limit?: number | null;
    supplier_id?: string;
    supply_cost?: number;
    avg_cost?: number;
}

const StockConfigModal = ({ isOpen, onClose, mutate, productId, variantId, productName }: IProps) => {
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState<VariantConfig | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!isOpen || !productId || !variantId) return;

        setFetching(true);
        fetcher(ApiKeys.GET_PRODUCT(productId), 'dashboard', 'GET')
            .then((res) => {
                const variant = (res?.data?.product?.variants ?? []).find(
                    (item: { id: string }) => item.id === variantId
                );
                setCurrent(variant ?? null);
            })
            .finally(() => setFetching(false));
    }, [isOpen, productId, variantId]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            stock_mode: (current?.stock_mode ?? 'tracked') as StockMode,
            allow_backorder: current?.allow_backorder ?? false,
            backorder_limit:
                current?.backorder_limit === null || current?.backorder_limit === undefined
                    ? ''
                    : String(current.backorder_limit),
            supplier_id: current?.supplier_id ?? '',
            supply_cost: current?.supply_cost ?? 0
        },
        validationSchema: toFormikValidationSchema(stockConfigSchema),
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const response = await fetcher(ApiKeys.PATCH_INVENTORY_STOCK_CONFIG, 'dashboard', 'PATCH', {
                    body: {
                        product_id: productId,
                        variant_id: variantId,
                        stock_mode: values.stock_mode,
                        allow_backorder: values.stock_mode === 'tracked' ? values.allow_backorder : false,
                        backorder_limit:
                            values.stock_mode === 'tracked' && values.allow_backorder && values.backorder_limit !== ''
                                ? Number(values.backorder_limit)
                                : null,
                        // An empty string clears the default supplier on the backend.
                        supplier_id: values.supplier_id,
                        supply_cost: Number(values.supply_cost || 0)
                    }
                });

                if (response?.success) {
                    toast.success('تنظیمات موجودی ذخیره شد');
                    mutate();
                    onClose();
                }
            } finally {
                setLoading(false);
            }
        }
    });

    const isTracked = formik.values.stock_mode === 'tracked';
    const isOnDemand = formik.values.stock_mode === 'on_demand';

    return (
        <Modal isOpen={isOpen} onClose={onClose} className='max-w-[620px] p-6'>
            <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>
                تنظیم حالت موجودی {productName ? `— ${productName}` : ''}
            </h3>

            {fetching ? (
                <div className='py-14 text-center text-sm text-gray-400'>در حال بارگذاری...</div>
            ) : (
                <form onSubmit={formik.handleSubmit} className='mt-5 space-y-4'>
                    <div className='space-y-2'>
                        <label className='block text-xs text-gray-400'>حالت موجودی</label>
                        {STOCK_MODE_OPTIONS.map((option) => (
                            <label
                                key={option.value}
                                className='flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800'
                            >
                                <input
                                    type='radio'
                                    name='stock_mode'
                                    value={option.value}
                                    checked={formik.values.stock_mode === option.value}
                                    onChange={() => formik.setFieldValue('stock_mode', option.value)}
                                    className='accent-brand-500 mt-1 h-4 w-4'
                                />
                                <span>
                                    <span className='block font-medium text-gray-800 dark:text-white/90'>
                                        {option.label}
                                    </span>
                                    <span className='block text-xs text-gray-400'>{option.hint}</span>
                                </span>
                            </label>
                        ))}
                    </div>

                    {isTracked && (
                        <div className='rounded-lg border border-gray-200 p-3 dark:border-gray-800'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-800 dark:text-white/90'>
                                        فروش بیش از موجودی (backorder)
                                    </p>
                                    <p className='text-xs text-gray-400'>
                                        مثلاً ۱۰ عدد در مغازه دارم؛ با فعال بودن این گزینه، یازدهمی هم قابل سفارش است و
                                        از تأمین‌کننده تهیه می‌شود.
                                    </p>
                                </div>
                                <Switch
                                    name='allow_backorder'
                                    checked={formik.values.allow_backorder}
                                    onChange={(checked) => formik.setFieldValue('allow_backorder', checked)}
                                    size='md'
                                    variant='primary'
                                />
                            </div>

                            {formik.values.allow_backorder && (
                                <div className='mt-3'>
                                    <label className='mb-1 block text-xs text-gray-400'>
                                        سقف فروش بیش از موجودی (خالی = نامحدود)
                                    </label>
                                    <Input
                                        name='backorder_limit'
                                        type='number'
                                        min='0'
                                        inputMode='numeric'
                                        value={formik.values.backorder_limit}
                                        onChange={formik.handleChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {formik.values.stock_mode !== 'none' && (
                        <div
                            className={`grid grid-cols-1 gap-3 md:grid-cols-2 ${
                                isOnDemand ? 'rounded-lg border border-brand-500/40 bg-brand-500/5 p-3' : ''
                            }`}
                        >
                            <Fieldset
                                label='تأمین‌کننده پیش‌فرض'
                                name='supplier_id'
                                touched={formik.touched}
                                errors={formik.errors}
                            >
                                <SupplierSelect
                                    value={formik.values.supplier_id}
                                    onChange={(value) => formik.setFieldValue('supplier_id', value)}
                                />
                            </Fieldset>

                            <Fieldset
                                label='قیمت تخمینی خرید (تومان)'
                                name='supply_cost'
                                touched={formik.touched}
                                errors={formik.errors}
                            >
                                <Input
                                    name='supply_cost'
                                    type='number'
                                    min='0'
                                    inputMode='numeric'
                                    value={formik.values.supply_cost}
                                    error={Boolean(formik.touched.supply_cost && formik.errors.supply_cost)}
                                    onChange={formik.handleChange}
                                />
                            </Fieldset>
                        </div>
                    )}

                    <div
                        className='rounded-lg bg-gray-50 p-3 text-sm text-gray-500 dark:bg-white/[0.03]'
                        title='میانگین موزون قیمت خرید، از فاکتورهای خرید محاسبه می‌شود.'
                    >
                        میانگین قیمت خرید: {formatToman(current?.avg_cost ?? 0)}
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button type='button' size='sm' variant='outline' onClick={onClose}>
                            انصراف
                        </Button>
                        <Button type='submit' size='sm' loading={loading} disabled={loading}>
                            ذخیره
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default StockConfigModal;
