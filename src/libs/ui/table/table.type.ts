import { ColumnDef } from '@tanstack/react-table';

export type TableProps<T> = {
    columns: ColumnDef<T>[];
    data: T[];
    tableClass?: string;
    cellClass?: string;
    headerClass?: string;
    loading?: boolean;
};
