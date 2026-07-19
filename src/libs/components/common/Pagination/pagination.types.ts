export interface PaginationProps {
    currentPage: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}
