import React from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  links: any[];
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, links, onPageChange }: PaginationProps) {
  // Filter out the "prev" and "next" links
  const pageLinks = links.filter(link => 
    link.label !== '&laquo; Previous' && 
    link.label !== 'Next &raquo;'
  );

  return (
    <div className="flex justify-center">
      <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
            currentPage === 1 
              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Previous</span>
          <LuChevronLeft className="h-5 w-5" />
        </button>
        
        {pageLinks.map((link, index) => {
          // Convert label to number
          const page = parseInt(link.label);
          const isActive = link.active;
          
          return (
            <button
              key={index}
              onClick={() => !isActive && onPageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 border ${
                isActive
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-300'
              }`}
            >
              {link.label}
            </button>
          );
        })}
        
        <button
          onClick={() => currentPage < lastPage && onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
            currentPage === lastPage 
              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Next</span>
          <LuChevronRight className="h-5 w-5" />
        </button>
      </nav>
    </div>
  );
}