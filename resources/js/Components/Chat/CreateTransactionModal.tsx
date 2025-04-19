import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellables: any[];
  onSubmit: (items: any[]) => void;
  customerId: number;
}

export default function CreateTransactionModal({
  isOpen,
  onClose,
  sellables,
  onSubmit,
  customerId
}: CreateTransactionModalProps) {
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  
  if (!isOpen) return null;
  
  const handleAddItem = (sellable: any) => {
    const existingItem = selectedItems.find(item => item.sellable_id === sellable.sellable_id);
    
    if (existingItem) {
      setSelectedItems(
        selectedItems.map(item => 
          item.sellable_id === sellable.sellable_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          sellable_id: sellable.sellable_id,
          name: sellable.name,
          price: sellable.price,
          quantity: 1,
          image_url: sellable.image_url
        }
      ]);
    }
  };
  
  const handleRemoveItem = (sellableId: number) => {
    setSelectedItems(selectedItems.filter(item => item.sellable_id !== sellableId));
  };
  
  const handleUpdateQuantity = (sellableId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setSelectedItems(
      selectedItems.map(item => 
        item.sellable_id === sellableId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };
  
  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleSubmit = () => {
    if (selectedItems.length === 0) return;
    
    const items = selectedItems.map(item => ({
      sellable_id: item.sellable_id,
      quantity: item.quantity,
      price: item.price
    }));
    
    onSubmit(items);
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>
        
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Create Transaction
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Available Products/Services
              </h4>
              
              {sellables.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                  <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No products available
                  </p>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sellables.map(sellable => (
                      <li 
                        key={sellable.sellable_id}
                        className="py-2 px-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleAddItem(sellable)}
                      >
                        {sellable.image_url ? (
                          <img 
                            src={sellable.image_url || "/placeholder.svg"} 
                            alt={sellable.name}
                            className="w-10 h-10 object-cover rounded-md mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                            <ShoppingBag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {sellable.name}
                          </p>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                            ${sellable.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="ml-2">
                          <Plus className="w-4 h-4 text-primary-500" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Items
              </h4>
              
              {selectedItems.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No items selected
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-md">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedItems.map(item => (
                      <li key={item.sellable_id} className="py-2 px-3">
                        <div className="flex items-center">
                          {item.image_url ? (
                            <img 
                              src={item.image_url || "/placeholder.svg"} 
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-md mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                              <ShoppingBag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${item.price.toFixed(2)} each
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.sellable_id, item.quantity - 1)}
                              className="p-1 rounded-full text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="text-sm text-gray-700 dark:text-gray-300 w-6 text-center">
                              {item.quantity}
                            </span>
                            
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.sellable_id, item.quantity + 1)}
                              className="p-1 rounded-full text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.sellable_id)}
                              className="p-1 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors ml-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-1 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total
                    </span>
                    <span className="text-base font-semibold text-primary-600 dark:text-primary-400">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="Add any special instructions or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                selectedItems.length === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              } sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={handleSubmit}
              disabled={selectedItems.length === 0}
            >
              Create Transaction
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
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