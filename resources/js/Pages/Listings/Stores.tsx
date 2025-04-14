import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Layout from '@/Layouts/AuthenticatedLayout';
import BusinessCard from '@/Components/BusinessCard';
import FilterSidebar from '@/Components/FilterSidebar';
import SearchBar from '@/Components/SearchBar';
import Pagination from '@/Components/Pagination';

interface StoresProps {
  businesses: {
    data: any[];
    links: any[];
    current_page: number;
    last_page: number;
  };
  categories: any[];
  locations: any[];
  auth: any;
}

export default function Stores({ businesses, categories, locations, auth }: StoresProps) {
  const [filteredBusinesses, setFilteredBusinesses] = useState(businesses.data);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location_id: '',
    min_price: '',
    max_price: '',
    verified: true,
  });
  const [pagination, setPagination] = useState({
    currentPage: businesses.current_page,
    lastPage: businesses.last_page,
    links: businesses.links,
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
      setFilteredBusinesses(response.data.businesses);
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
      // Create a new object with only non-empty filter values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      );
      
      // Convert boolean to string for verified parameter
      if (cleanFilters.verified !== undefined) {
        cleanFilters.verified = cleanFilters.verified.toString();
      }
      
      const response = await axios.get(route('businesses.filter'), {
        params: cleanFilters
      });
      
      setFilteredBusinesses(response.data.data);
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
      category: '',
      location_id: '',
      min_price: '',
      max_price: '',
      verified: true,
    });
    setSearchQuery('');
    setFilteredBusinesses(businesses.data);
    setPagination({
      currentPage: businesses.current_page,
      lastPage: businesses.last_page,
      links: businesses.links,
    });
  };

  // Handle pagination
  const handlePageChange = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await axios.get(route('businesses.filter'), {
        params: {
          ...filters,
          page
        }
      });
      setFilteredBusinesses(response.data.data);
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

  // Save/unsave business
  const toggleSaveBusiness = async (businessId: number, isSaved: boolean) => {
    if (!auth.user) {
      // Redirect to login if not authenticated
      window.location.href = route('login');
      return;
    }

    try {
      if (isSaved) {
        await axios.delete(route('business.unsave', businessId));
      } else {
        await axios.post(route('business.save', businessId));
      }
      
      // Update the UI to reflect the change
      // This is a simple approach - in a real app you might want to update the state more elegantly
      const updatedBusinesses = filteredBusinesses.map(business => {
        if (business.business_id === businessId) {
          return {
            ...business,
            is_saved: !isSaved
          };
        }
        return business;
      });
      
      setFilteredBusinesses(updatedBusinesses);
    } catch (error) {
      console.error('Error toggling save status:', error);
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
      <Head title="Stores" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <h1 className="text-2xl font-semibold mb-6">Explore Stores</h1>
              
              <SearchBar 
                value={searchQuery}
                onChange={handleSearchChange}
                onSubmit={handleSearch}
                placeholder="Search for businesses..."
              />
              
              <div className="flex flex-col md:flex-row gap-6 mt-6">
                <div className="w-full md:w-1/4">
                  <FilterSidebar 
                    filters={filters}
                    categories={categories}
                    locations={locations}
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
                  ) : filteredBusinesses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBusinesses.map(business => (
                        <BusinessCard 
                          key={business.business_id}
                          business={business}
                          isSaved={business.is_saved || false}
                          onToggleSave={() => toggleSaveBusiness(business.business_id, business.is_saved || false)}
                          isAuthenticated={!!auth.user}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No businesses found matching your criteria.</p>
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