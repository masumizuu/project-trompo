import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck, AlertCircle, ShoppingBag } from 'lucide-react';

interface MessageListProps {
  messages: any[];
  currentUser: any;
  otherUser: any;
  onTransactionClick: (transaction: any) => void;
}

export default function MessageList({ messages, currentUser, otherUser, onTransactionClick }: MessageListProps) {
  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { [key: string]: any[] } = {};
  messages.forEach(message => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  return (
    <div className="space-y-8">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </div>
          </div>

          {dateMessages.map(message => {
            const isCurrentUser = message.sender_id === currentUser.user_id;
            const hasAttachedSellable = message.sellable_id && message.attachedSellable;
            const hasTransaction = message.transaction_id && message.transaction;

            return (
              <div 
                key={message.message_id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex flex-col max-w-[75%]">
                  {/* Message bubble */}
                  <div 
                    className={`rounded-lg px-4 py-2 ${
                      isCurrentUser 
                        ? 'bg-primary-500 text-white rounded-tr-none' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-none'
                    }`}
                  >
                    {message.content}
                    
                    {/* Attached sellable */}
                    {hasAttachedSellable && (
                      <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center">
                          {message.attachedSellable.image_url ? (
                            <img 
                              src={message.attachedSellable.image_url || "/placeholder.svg"} 
                              alt={message.attachedSellable.name}
                              className="w-12 h-12 object-cover rounded-md mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                              <ShoppingBag className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {message.attachedSellable.name}
                            </h4>
                            <p className="text-sm text-primary-600 dark:text-primary-400">
                              ${message.attachedSellable.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Transaction */}
                    {hasTransaction && (
                      <div 
                        className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => onTransactionClick(message.transaction)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <ShoppingBag className="w-4 h-4 text-primary-500 mr-1" />
                            <span className="text-sm font-medium">Transaction</span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            message.transaction.status === 'COMPLETED' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : message.transaction.status === 'PENDING' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : message.transaction.status === 'APPROVED'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {message.transaction.status}
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {message.transaction.transaction_items?.length || 0} items • ${message.transaction.total_amount?.toFixed(2)}
                        </div>
                        {message.transaction.dispute && (
                          <div className="mt-1 flex items-center text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Dispute: {message.transaction.dispute.status}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp and read status */}
                  <div 
                    className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${
                      isCurrentUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    
                    {isCurrentUser && (
                      <span className="ml-1">
                        {message.readReceipts?.length > 0 ? (
                          <CheckCheck className="w-3 h-3 inline" />
                        ) : (
                          <Check className="w-3 h-3 inline" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}