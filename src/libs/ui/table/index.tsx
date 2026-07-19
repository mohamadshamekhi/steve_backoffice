'use client';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';
import { cn } from 'libs/utilities';
import React from 'react';
import EmptyState from '../emptyState';
import LoadingState from '../loadingState';
import { TableProps } from './table.type';

export default function Table<T>({
    columns,
    data,
    cellClass = '',
    headerClass = '',
    tableClass = '',
    loading = false
}: TableProps<T>) {
    const table = useReactTable<T>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableColumnFilters: true,
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true
    });

    return (
        <div className='max-w-full! overflow-x-auto!'>
            <table className={cn('min-w-full', tableClass)} dir='rtl'>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <React.Fragment key={headerGroup.id}>
                            <tr>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        onClick={
                                            header.column.getCanSort()
                                                ? header.column.getToggleSortingHandler()
                                                : undefined
                                        }
                                        className='text-theme-xs py-3 text-start font-medium text-gray-500 dark:text-gray-400'
                                        style={{
                                            width: header.getSize(),
                                            minWidth: header.column.columnDef.minSize,
                                            maxWidth: header.column.columnDef.maxSize
                                        }}
                                    >
                                        <div className={cn('flex items-center gap-1 p-2 font-semibold', headerClass)}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}

                                            {/* Show sort icon only if sortable */}
                                            {header.column.getCanSort()
                                                ? ({
                                                      asc: (
                                                          <svg
                                                              className='w-2 text-blue-600'
                                                              width='14'
                                                              height='18'
                                                              viewBox='0 0 14 18'
                                                              fill='none'
                                                              xmlns='http://www.w3.org/2000/svg'
                                                          >
                                                              <path
                                                                  d='M7 17V1M7 1L1 7M7 1L13 7'
                                                                  stroke='currentColor'
                                                                  strokeWidth='1.5'
                                                                  strokeLinecap='round'
                                                                  strokeLinejoin='round'
                                                              />
                                                          </svg>
                                                      ),
                                                      desc: (
                                                          <svg
                                                              className='w-2 text-blue-600'
                                                              width='14'
                                                              height='18'
                                                              viewBox='0 0 14 18'
                                                              fill='none'
                                                              xmlns='http://www.w3.org/2000/svg'
                                                          >
                                                              <path
                                                                  d='M7 1V17M7 17L13 11M7 17L1 11'
                                                                  stroke='currentColor'
                                                                  strokeWidth='1.5'
                                                                  strokeLinecap='round'
                                                                  strokeLinejoin='round'
                                                              />
                                                          </svg>
                                                      )
                                                  }[header.column.getIsSorted() as string] ?? (
                                                      <svg
                                                          className='w-3 text-blue-600'
                                                          width='20'
                                                          height='18'
                                                          viewBox='0 0 20 18'
                                                          fill='none'
                                                          xmlns='http://www.w3.org/2000/svg'
                                                      >
                                                          <path
                                                              d='M5 1V17M5 17L1 13M5 17L9 13M15 17V1M15 1L11 5M15 1L19 5'
                                                              stroke='currentColor'
                                                              strokeWidth='1.5'
                                                              strokeLinecap='round'
                                                              strokeLinejoin='round'
                                                          />
                                                      </svg>
                                                  ))
                                                : null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </React.Fragment>
                    ))}
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={table.getAllColumns().length}>
                                <LoadingState />
                            </td>
                        </tr>
                    ) : table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td colSpan={table.getAllColumns().length}>
                                <div className='p-4 text-center text-gray-500'>
                                    <EmptyState title='داده ای یافت نشد' />
                                </div>
                            </td>
                        </tr>
                    ) : (
                        <>
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className='border-t'>
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            className='text-theme-sm py-3 text-gray-900 dark:text-gray-400'
                                            key={cell.id}
                                            style={{
                                                width: cell.column.getSize(),
                                                minWidth: cell.column.columnDef.minSize,
                                                maxWidth: cell.column.columnDef.maxSize
                                            }}
                                        >
                                            <div className={cn('p-2', cellClass)}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}
