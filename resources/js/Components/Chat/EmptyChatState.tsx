import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full mb-4">
        <MessageSquare className="w-12 h-12 text-primary-600 dark:text-primary-300" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No conversation selected</h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md">
        Select a conversation from the list or start a new one to begin messaging.
      </p>
    </div>
  );
}