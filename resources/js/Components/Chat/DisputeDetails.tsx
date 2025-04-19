import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DisputeDetailsProps {
  dispute: any;
  currentUser: any;
  onAddMessage: (disputeId: number, message: string) => void;
  onResolve: (disputeId: number, resolution: string) => void;
  onClose: () => void;
}

export default function DisputeDetails({
  dispute,
  currentUser,
  onAddMessage,
  onResolve,
  onClose
}: DisputeDetailsProps) {
  const [message, setMessage] = useState('');
  const [resolution, setResolution] = useState('');
  const [showResolutionInput, setShowResolutionInput] = useState(false);
  
  const isAdmin = currentUser.user_type === 'ADMIN';
  const canResolve = isAdmin && dispute.status === 'PENDING';
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    onAddMessage(dispute.dispute_id, message);
    setMessage('');
  };
  
  const handleResolve = () => {
    if (!resolution.trim()) return;
    
    onResolve(dispute.dispute_id, resolution);
    setShowResolutionInput(false);
    setResolution('');
  };
  
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Dispute Details
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
              Dispute ID
            </h4>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              #{dispute.dispute_id}
            </p>
          </div>
          
          <div className="text-right">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              dispute.status === 'RESOLVED'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            }`}>
              {dispute.status}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason
          </h4>
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-900 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                {dispute.reason}
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
                #{dispute.transaction.transaction_id}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Status
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {dispute.transaction.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Amount
              </span>
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                ${dispute.transaction.total_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        
        {dispute.status === 'RESOLVED' && dispute.resolution && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution
            </h4>
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-900 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-300">
                {dispute.resolution}
              </p>
              <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                Resolved {formatDistanceToNow(new Date(dispute.resolved_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Messages
          </h4>
          
          {dispute.messages.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No messages yet
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md max-h-60 overflow-y-auto p-3">
              <div className="space-y-3">
                {dispute.messages.map((msg: any) => {
                  const isCurrentUser = msg.sender_id === currentUser.user_id;
                  const sender = msg.sender;
                  
                  return (
                    <div key={msg.dispute_message_id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[75%]">
                        <div className={`rounded-lg px-3 py-2 ${
                          isCurrentUser 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        }`}>
                          <p className="text-xs font-medium mb-1">
                            {sender.first_name} {sender.last_name}
                            {sender.user_type === 'ADMIN' && (
                              <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[10px] rounded-full">
                                ADMIN
                              </span>
                            )}
                          </p>
                          {msg.message}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {dispute.status === 'PENDING' && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className={`p-2 rounded-md ${
                  !message.trim()
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700 transition-colors'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        {showResolutionInput && (
          <div className="mb-4">
            <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution <span className="text-red-500">*</span>
            </label>
            <textarea
              id="resolution"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
              placeholder="Provide a resolution for this dispute..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            ></textarea>
            <div className="mt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowResolutionInput(false);
                  setResolution('');
                }}
                className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                disabled={!resolution.trim()}
                className={`px-3 py-1 text-sm rounded-md ${
                  !resolution.trim()
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transition-colors'
                }`}
              >
                Resolve Dispute
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
        {canResolve && !showResolutionInput && (
          <button
            type="button"
            onClick={() => setShowResolutionInput(true)}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Resolve Dispute
          </button>
        )}
        
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}