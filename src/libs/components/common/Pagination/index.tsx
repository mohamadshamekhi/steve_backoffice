"use client";

import ChevronLeftIcon from "libs/components/icons/ChevronLeftIcon";
import { Button } from "libs/ui";
import { PaginationProps } from "./pagination.types";

const DOTS = "DOTS" as const;

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const getPaginationRange = (
  currentPage: number,
  totalPages: number,
  siblingCount: number
) => {
  // first page + last page + current page + 2 dots + 2 * siblingCount
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  const showLeftDots = leftSiblingIndex > 2;
  const showRightDots = rightSiblingIndex < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = range(1, 3 + siblingCount * 2);
    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const rightRange = range(
      totalPages - (3 + siblingCount * 2) + 1,
      totalPages
    );
    return [1, DOTS, ...rightRange];
  }

  return [
    1,
    DOTS,
    ...range(leftSiblingIndex, rightSiblingIndex),
    DOTS,
    totalPages,
  ];
};

const Pagination = ({
  currentPage,
  total,
  pageSize,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) => {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const pages = getPaginationRange(currentPage, totalPages, siblingCount);

  return (
    <div dir="ltr" className="mt-4 flex items-center justify-center gap-2">
      <Button
        disabled={currentPage === 1}
        size="sm"
        startIcon={<ChevronLeftIcon />}
        variant="outline"
        onClick={() => goToPage(currentPage - 1)}
      >
        قبلی
      </Button>

      {pages.map((page, index) =>
        page === DOTS ? (
          <span
            key={`dots-${index}`}
            className="md:text-md px-2 text-sm text-gray-400"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "primary" : "outline"}
            onClick={() => goToPage(page as number)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        disabled={currentPage === totalPages}
        size="sm"
        endIcon={<ChevronLeftIcon className="rotate-180 transform" />}
        variant="outline"
        onClick={() => goToPage(currentPage + 1)}
      >
        بعدی
      </Button>
    </div>
  );
};

export default Pagination;
