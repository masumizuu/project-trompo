import React from 'react';
import { LuFilter, LuX } from 'react-icons/lu';

interface SellableFilterSidebarProps {
  filters: {
    min_price: string;
    max_price: string;
    type: string;
    business_id: string;
  };
  businesses: any[];
  onFilterChange: (name: string, value: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export default function SellableFilterSidebar({ 
  filters, 
  businesses, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters 
}: SellableFilterSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <LuFilter className="mr-2" /> Filters
        </h3>
        <button 
          onClick={onResetFilters}
          className="text-sm text-gray-500 hover:text-red-500 flex items-center"
        >
          <LuX className="mr-1" /> Clear
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
          >
            <option value="">All Types</option>
            <option value="PRODUCT">Products</option>
            <option value="SERVICE">Services</option>
          </select>
        </div>
        
        {/* Business Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Business
          </label>
          <select
            value={filters.business_id}
            onChange={(e) => onFilterChange('business_id', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
          >
            <option value="">All Businesses</option>
            {businesses.map((business) => (
              <option key={business.business_id} value={business.business_id}>
                {business.business_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.min_price}
              onChange={(e) => onFilterChange('min_price', e.target.value)}
              className="w-1/2 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.max_price}
              onChange={(e) => onFilterChange('max_price', e.target.value)}
              className="w-1/2 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        
        <button
          onClick={onApplyFilters}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors mt-2"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}