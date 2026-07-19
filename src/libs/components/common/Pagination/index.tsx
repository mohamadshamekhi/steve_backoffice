'use client';

import ChevronLeftIcon from 'libs/components/icons/ChevronLeftIcon';
import { Button } from 'libs/ui';
import { PaginationProps } from './pagination.types';

const Pagination = ({ currentPage, total, pageSize, onPageChange }: PaginationProps) => {
    const totalPages = Math.ceil(total / pageSize);

    if (totalPages <= 1) return null;

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    return (
        <div className='mt-4 flex items-center justify-end gap-2'>
            <Button
                size='sm'
                startIcon={<ChevronLeftIcon className='rotate-180 transform' />}
                variant='outline'
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
            >
                قبلی
            </Button>

            <span className='md:text-md px-3 text-sm'>
                صفحه {currentPage} از {totalPages}
            </span>

            <Button
                size='sm'
                endIcon={<ChevronLeftIcon />}
                variant='outline'
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
            >
                بعدی
            </Button>
        </div>
    );
};
export default Pagination;
