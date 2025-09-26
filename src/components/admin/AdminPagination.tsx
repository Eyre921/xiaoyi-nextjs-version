import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminButton } from './AdminButton';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({
  currentPage,
  totalPages,
  onPageChange
}: AdminPaginationProps) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <AdminButton
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </AdminButton>

      {getPageNumbers().map((page) => (
        <AdminButton
          key={page}
          variant={page === currentPage ? "primary" : "secondary"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="min-w-[40px]"
        >
          {page}
        </AdminButton>
      ))}

      <AdminButton
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </AdminButton>
    </div>
  );
}