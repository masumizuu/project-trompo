import React, { useState } from 'react';
import { X, Search, ShoppingBag } from 'lucide-react';

interface AttachProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellables: any[];
  onAttach: (sellableId: number) => void;
}

export default function AttachProductModal({
  isOpen,
  onClose,
  sellables,
  onAttach
}: AttachProductModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!isOpen) return null;
  
  const filteredSellables = sellables.filter(sellable => 
    sellable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sellable.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Attach Product
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {filteredSellables.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No products found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Try a different search term.' : 'No products available to attach.'}
                </p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSellables.map(sellable => (
                    <li 
                      key={sellable.sellable_id}
                      className="py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors px-2 rounded-md"
                      onClick={() => onAttach(sellable.sellable_id)}
                    >
                      {sellable.image_url ? (
                        <img 
                          src={sellable.image_url || "/placeholder.svg"} 
                          alt={sellable.name}
                          className="w-12 h-12 object-cover rounded-md mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                          <ShoppingBag className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {sellable.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {sellable.description.substring(0, 60)}
                          {sellable.description.length > 60 ? '...' : ''}
                        </p>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                          ${sellable.price.toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}