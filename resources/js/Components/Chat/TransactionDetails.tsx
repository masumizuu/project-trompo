import React, { useState } from 'react';
import { X, ShoppingBag, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TransactionDetailsProps {
  transaction: any;
  currentUser: any;
  onUpdateStatus: (transactionId: number, status: string, reason?: string) => void;
  onCreateDispute: () => void;
  onViewDispute: (dispute: any) => void;
  onClose: () => void;
}

export default function TransactionDetails({
  transaction,
  currentUser,
  onUpdateStatus,
  onCreateDispute,
  onViewDispute,
  onClose
}: TransactionDetailsProps) {
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  
  const isCustomer = transaction.customer_id === currentUser.user_id;
  const isBusinessOwner = transaction.business?.owner_id === currentUser.user_id;
  const isAdmin = currentUser.user_type === 'ADMIN';
  
  const handleStatusUpdate = (status: string) => {
    if (status === 'INCOMPLETE') {
      setStatusToUpdate(status);
      setShowReasonInput(true);
    } else {
      onUpdateStatus(transaction.transaction_id, status);
    }
  };
  
  const submitStatusWithReason = () => {
    if (!reason.trim()) return;
    
    onUpdateStatus(transaction.transaction_id, statusToUpdate, reason);
    setShowReasonInput(false);
    setReason('');
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'INCOMPLETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Transaction Details
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transaction ID
            </h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              #{transaction.transaction_id}
            </p>
          </div>
          
          <div className="text-right">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date
            </h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {new Date(transaction.date_initiated).toLocaleDateString()}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                ({formatDistanceToNow(new Date(transaction.date_initiated), { addSuffix: true })})
              </span>
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Amount
            </h4>
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              ${transaction.total_amount.toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Items
          </h4>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {transaction.transaction_items.map((item: any) => (
                <li key={item.transaction_item_id} className="py-2 px-3">
                  <div className="flex items-center">
                    {item.sellable?.image_url ? (
                      <img 
                        src={item.sellable.image_url || "/placeholder.svg"} 
                        alt={item.sellable.name}
                        className="w-10 h-10 object-cover rounded-md mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                        <ShoppingBag className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.sellable?.name || 'Unknown Product'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {transaction.notes && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </h4>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">
              {transaction.notes.split('\n\n').map((note: string, index: number) => (
                <p key={index} className={index > 0 ? 'mt-2' : ''}>
                  {note}
                </p>
              ))}
            </div>
          </div>
        )}
        
        {transaction.dispute && (
          <div className="mb-4">
            <div className="p-3 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/30 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400">
                  Dispute {transaction.dispute.status}
                </h4>
              </div>
              <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                {transaction.dispute.reason}
              </p>
              <button
                type="button"
                onClick={() => onViewDispute(transaction.dispute)}
                className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                View Dispute Details
              </button>
            </div>
          </div>
        )}
        
        {showReasonInput && (
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason for marking as incomplete
            </label>
            <textarea
              id="reason"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              placeholder="Please provide a reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
            <div className="mt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowReasonInput(false);
                  setReason('');
                }}
                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitStatusWithReason}
                disabled={!reason.trim()}
                className={`px-3 py-1 text-sm rounded-md ${
                  !reason.trim()
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 transition-colors'
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 flex flex-wrap justify-between">
        {/* Customer actions */}
        {isCustomer && (
          <div className="space-x-2">
            {transaction.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('APPROVED')}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
              >
                Approve
              </button>
            )}
            
            {transaction.status === 'APPROVED' && (
              <>
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
                >
                  Mark as Completed
                </button>
                
                <button
                  type="button"
                  onClick={() => handleStatusUpdate('INCOMPLETE')}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                >
                  Mark as Incomplete
                </button>
              </>
            )}
          </div>
        )}
        
        {/* Business owner actions */}
        {isBusinessOwner && (
          <div className="space-x-2">
            {transaction.status === 'COMPLETED' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('INCOMPLETE')}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              >
                Mark as Incomplete
              </button>
            )}
            
            {transaction.status === 'INCOMPLETE' && (
              <button
                type="button"
                onClick={() => handleStatusUpdate('COMPLETED')}
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
              >
                Mark as Completed
              </button>
            )}
          </div>
        )}
        
        {/* Dispute actions */}
        {(isCustomer || isBusinessOwner) && !transaction.dispute && transaction.status !== 'PENDING' && (
          <button
            type="button"
            onClick={onCreateDispute}
            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:text-sm"
          >
            Create Dispute
          </button>
        )}
        
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}