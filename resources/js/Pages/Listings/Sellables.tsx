import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Layout from '@/Layouts/AuthenticatedLayout';
import SellableCard from '@/Components/SellableCard';
import SellableFilterSidebar from '@/Components/SellableFilterSidebar';
import SearchBar from '@/Components/SearchBar';
import Pagination from '@/Components/Pagination';

interface SellablesProps {
  sellables: {
    data: any[];
    links: any[];
    current_page: number;
    last_page: number;
  };
  businesses: any[];
  auth: any;
}

export default function Sellables({ sellables, businesses, auth }: SellablesProps) {
  const [filteredSellables, setFilteredSellables] = useState(sellables.data);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    min_price: '',
    max_price: '',
    type: '',
    business_id: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: sellables.current_page,
    lastPage: sellables.last_page,
    links: sellables.links,
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.get(route('search'), {
        params: { query: searchQuery }
      });
      setFilteredSellables(response.data.sellables);
      // Reset pagination since we're showing search results
      setPagination({
        currentPage: 1,
        lastPage: 1,
        links: [],
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(route('sellables.filter'), {
        params: filters
      });
      setFilteredSellables(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        links: response.data.links,
      });
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      min_price: '',
      max_price: '',
      type: '',
      business_id: '',
    });
    setSearchQuery('');
    setFilteredSellables(sellables.data);
    setPagination({
      currentPage: sellables.current_page,
      lastPage: sellables.last_page,
      links: sellables.links,
    });
  };

  // Handle pagination
  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(route('sellables.filter'), {
        params: {
          ...filters,
          page
        }
      });
      setFilteredSellables(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        links: response.data.links,
      });
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    if (Object.values(filters).some(value => value !== '')) {
      applyFilters();
    }
  }, [filters]);

  return (
    <Layout>
      <Head title="Products & Services" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <h1 className="text-2xl font-semibold mb-6">Explore Products & Services</h1>
              
              <SearchBar 
                value={searchQuery}
                onChange={handleSearchChange}
                onSubmit={handleSearch}
                placeholder="Search for products or services..."
              />
              
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                <div className="w-full md:w-1/4">
                  <SellableFilterSidebar 
                    filters={filters}
                    businesses={businesses}
                    onFilterChange={handleFilterChange}
                    onApplyFilters={applyFilters}
                    onResetFilters={resetFilters}
                  />
                </div>
                
                <div className="w-full md:w-3/4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
                    </div>
                  ) : filteredSellables.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSellables.map(sellable => (
                        <SellableCard 
                          key={sellable.sellable_id}
                          sellable={sellable}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No products or services found matching your criteria.</p>
                    </div>
                  )}
                  
                  {pagination.lastPage > 1 && (
                    <div className="mt-8">
                      <Pagination 
                        currentPage={pagination.currentPage}
                        lastPage={pagination.lastPage}
                        links={pagination.links}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}