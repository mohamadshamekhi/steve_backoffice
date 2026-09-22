'use client';

import SupplierSelect from 'libs/components/pages/supplier/select';
import { formatToman, STOCK_MODE_OPTIONS } from 'libs/constants/warehouse/warehouse.constants';
import { StockMode } from 'libs/models/warehouse.model';
import { Input, Switch } from 'libs/ui';

export interface VariantStockValues {
    stock_mode: StockMode;
    allow_backorder: boolean;
    backorder_limit: string;
    supplier_id: string;
    supply_cost: number;
}

interface IProps {
    values: VariantStockValues;
    setFieldValue: (field: string, value: unknown) => void;
    /** Service products have no stock at all; the backend forces stock_mode to `none`. */
    isService?: boolean;
    avgCost?: number;
}

/** Stock behaviour of a single variant, shared by the add/edit variant forms. */
const VariantStockFields = ({ values, setFieldValue, isService = false, avgCost }: IProps) => {
    if (isService) {
        return (
            <div className='col-span-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/[0.03]'>
                این محصول از نوع «خدمات» است؛ موجودی و انبار برای آن ثبت نمی‌شود.
            </div>
        );
    }

    const isTracked = values.stock_mode === 'tracked';
    const isOnDemand = values.stock_mode === 'on_demand';

    return (
        <div className='col-span-2 space-y-4 rounded-xl border border-gray-200 p-4 dark:border-gray-800'>
            <div>
                <p className='mb-2 text-sm font-medium text-gray-800 dark:text-white/90'>حالت موجودی</p>
                <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                    {STOCK_MODE_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className='flex cursor-pointer items-start gap-2 rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800'
                        >
                            <input
                                type='radio'
                                name='stock_mode'
                                value={option.value}
                                checked={values.stock_mode === option.value}
                                onChange={() => setFieldValue('stock_mode', option.value)}
                                className='accent-brand-500 mt-1 h-4 w-4'
                            />
                            <span>
                                <span className='block text-gray-800 dark:text-white/90'>{option.label}</span>
                                <span className='block text-xs text-gray-400'>{option.hint}</span>
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {isTracked && (
                <div className='rounded-lg border border-gray-200 p-3 dark:border-gray-800'>
                    <div className='flex items-center justify-between gap-3'>
                        <div>
                            <p className='text-sm font-medium text-gray-800 dark:text-white/90'>
                                فروش بیش از موجودی (backorder)
                            </p>
                            <p className='text-xs text-gray-400'>
                                مثلاً ۱۰ عدد در مغازه دارم؛ با فعال بودن این گزینه، یازدهمی هم قابل سفارش است و از
                                تأمین‌کننده تهیه می‌شود.
                            </p>
                        </div>
                        <Switch
                            name='allow_backorder'
                            checked={values.allow_backorder}
                            onChange={(checked) => setFieldValue('allow_backorder', checked)}
                            size='md'
                            variant='primary'
                        />
                    </div>

                    {values.allow_backorder && (
                        <div className='mt-3'>
                            <label className='mb-1 block text-xs text-gray-400'>
                                سقف فروش بیش از موجودی (خالی = نامحدود)
                            </label>
                            <Input
                                name='backorder_limit'
                                type='number'
                                min='0'
                                inputMode='numeric'
                                value={values.backorder_limit}
                                onChange={(e) => setFieldValue('backorder_limit', e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}

            {values.stock_mode !== 'none' && (
                <div
                    className={`grid grid-cols-1 gap-3 md:grid-cols-2 ${
                        isOnDemand ? 'border-brand-500/40 bg-brand-500/5 rounded-lg border p-3' : ''
                    }`}
                >
                    <div>
                        <label className='mb-1 block text-xs text-gray-400'>تأمین‌کننده پیش‌فرض</label>
                        <SupplierSelect
                            value={values.supplier_id}
                            onChange={(value) => setFieldValue('supplier_id', value)}
                        />
                    </div>
                    <div>
                        <label className='mb-1 block text-xs text-gray-400'>قیمت تخمینی خرید (تومان)</label>
                        <Input
                            name='supply_cost'
                            type='number'
                            min='0'
                            inputMode='numeric'
                            value={values.supply_cost}
                            onChange={(e) => setFieldValue('supply_cost', Number(e.target.value))}
                        />
                    </div>
                </div>
            )}

            {avgCost !== undefined && (
                <div title='میانگین موزون قیمت خرید، از فاکتورهای خرید محاسبه می‌شود.'>
                    <label className='mb-1 block text-xs text-gray-400'>میانگین قیمت خرید</label>
                    <Input name='avg_cost' value={formatToman(avgCost)} onChange={() => undefined} disabled />
                </div>
            )}
        </div>
    );
};

export default VariantStockFields;
