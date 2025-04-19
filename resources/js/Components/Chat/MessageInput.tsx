import React from 'react';
import { Send, Paperclip, ShoppingBag } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onAttachProduct: () => void;
  onCreateTransaction: () => void;
  canCreateTransaction: boolean;
}

export default function MessageInput({
  value,
  onChange,
  onSubmit,
  isLoading,
  onAttachProduct,
  onCreateTransaction,
  canCreateTransaction
}: MessageInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-center space-x-2">
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={onAttachProduct}
          className="p-2 rounded-full text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Attach Product"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        {canCreateTransaction && (
          <button
            type="button"
            onClick={onCreateTransaction}
            className="p-2 rounded-full text-gray-500 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Create Transaction"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        )}
      </div>
      
      <div className="flex-1 relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Type a message..."
          className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        className={`p-2 rounded-full ${
          !value.trim() || isLoading
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600 transition-colors'
        }`}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}