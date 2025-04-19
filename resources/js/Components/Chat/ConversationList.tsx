import React from 'react';
import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: any[];
  currentUser: any;
  activeConversationId?: number;
}

export default function ConversationList({ 
  conversations, 
  currentUser,
  activeConversationId 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Conversations
      </h2>
      
      <ul className="space-y-2">
        {conversations.map(conversation => {
          const otherUser = conversation.other_user;
          const isActive = activeConversationId === conversation.conversation_id;
          
          return (
            <li key={conversation.conversation_id}>
              <Link
                href={route('chat.show', otherUser.user_id)}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/30 border-l-4 border-primary-500' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="relative">
                  <img 
                    src={otherUser.profile_picture || '/placeholder-user.jpg'} 
                    alt={`${otherUser.first_name} ${otherUser.last_name}`}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  {conversation.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {otherUser.first_name} {otherUser.last_name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className={`text-xs truncate ${
                    conversation.unread_count > 0
                      ? 'font-medium text-gray-900 dark:text-gray-100'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {conversation.latest_message?.content || 'No messages yet'}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}