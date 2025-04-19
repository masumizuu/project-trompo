import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface CreateDisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onSubmit: (transactionId: number, reason: string) => void;
}

export default function CreateDisputeModal({
  isOpen,
  onClose,
  transaction,
  onSubmit
}: CreateDisputeModalProps) {
  const [reason, setReason] = useState('');
  
  if (!isOpen || !transaction) return null;
  
  const handleSubmit = () => {
    if (!reason.trim()) return;
    
    onSubmit(transaction.transaction_id, reason);
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
              Create Dispute
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-900 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Important Information
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                    Creating a dispute will notify all parties involved and may require admin intervention to resolve. Please provide a clear and detailed reason for the dispute.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Details
              </h4>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Transaction ID
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{transaction.transaction_id}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Status
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {transaction.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Amount
                  </span>
                  <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                    ${transaction.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="dispute-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason for Dispute <span className="text-red-500">*</span>
              </label>
              <textarea
                id="dispute-reason"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="Please provide a detailed explanation of the issue..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              ></textarea>
              {reason.length > 0 && reason.length < 10 && (
                <p className="mt-1 text-xs text-red-500">
                  Please provide a more detailed explanation (at least 10 characters).
                </p>
              )}
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                !reason.trim() || reason.length < 10
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              } sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={handleSubmit}
              disabled={!reason.trim() || reason.length < 10}
            >
              Create Dispute
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