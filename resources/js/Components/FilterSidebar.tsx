import React from 'react';
import { LuFilter, LuX } from 'react-icons/lu';

interface FilterSidebarProps {
  filters: {
    category: string;
    location_id: string;
    min_price: string;
    max_price: string;
    verified: boolean;
  };
  categories: any[];
  locations: any[];
  onFilterChange: (name: string, value: any) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

export default function FilterSidebar({ 
  filters, 
  categories, 
  locations, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters 
}: FilterSidebarProps) {
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
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.category_name} value={category.category_name}>
                {category.category_name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <select
            value={filters.location_id}
            onChange={(e) => onFilterChange('location_id', e.target.value)}
            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50"
          >
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location.location_id} value={location.location_id}>
                {location.city}, {location.province}
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
        
        {/* Verified Filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="verified"
            checked={filters.verified}
            onChange={(e) => onFilterChange('verified', e.target.checked)}
            className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
          />
          <label htmlFor="verified" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Verified Businesses Only
          </label>
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