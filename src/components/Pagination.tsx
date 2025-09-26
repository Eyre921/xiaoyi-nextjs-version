import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext: boolean;
  hasPrev: boolean;
  total: number;
  limit: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  total,
  limit
}) => {
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

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
      
      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
      <div className="flex items-center text-sm text-white/70">
        显示 {startItem} - {endItem} 条，共 {total} 条记录
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                page === currentPage
                  ? 'bg-blue-500 text-white'
                  : page === '...'
                  ? 'text-white/50 cursor-default'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;