'use client';

import { fetcher } from 'libs/api';
import ApiKeys from 'libs/api/keys';
import { ISupplier } from 'libs/models/warehouse.model';
import AsyncSelectInput from 'libs/ui/select/AsyncSelectInput';

type Option = { label: string; value: string };

export const supplierLabel = (supplier: ISupplier) =>
    supplier.shop_name ? `${supplier.name} (${supplier.shop_name})` : supplier.name;

export const loadSupplierOptions = async (inputValue: string): Promise<Option[]> => {
    try {
        const response = await fetcher(ApiKeys.GET_ALL_SUPPLIER, 'dashboard', 'GET', {
            params: {
                page_number: 1,
                page_size: 100,
                is_active: true,
                ...(inputValue && { search: inputValue })
            }
        });

        return (response?.data?.suppliers ?? []).map((supplier: ISupplier) => ({
            value: supplier.id,
            label: supplierLabel(supplier)
        }));
    } catch (error) {
        console.error('Error loading suppliers:', error);
        return [];
    }
};

interface IProps {
    name?: string;
    value: string;
    onChange: (value: string) => void;
    error?: boolean;
    isClearable?: boolean;
    initialOption?: Option | null;
    placeholder?: string;
}

const SupplierSelect = ({
    name = 'supplier_id',
    value,
    onChange,
    error,
    isClearable = true,
    initialOption = null,
    placeholder = 'جست‌وجوی تأمین‌کننده...'
}: IProps) => (
    <AsyncSelectInput
        name={name}
        value={value}
        error={error}
        isClearable={isClearable}
        initialOption={initialOption}
        placeholder={placeholder}
        defaultOptions
        loadOptions={loadSupplierOptions}
        onChange={onChange}
    />
);

export default SupplierSelect;
