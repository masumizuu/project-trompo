import React from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/AuthenticatedLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import EmptyChatState from '@/Components/Chat/EmptyChatState';

interface ChatIndexProps {
  conversations: any[];
  currentUser: any;
  auth: any;
}

export default function ChatIndex({ conversations, currentUser, auth }: ChatIndexProps) {
  return (
    <Layout>
      <Head title="Messages" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <h1 className="text-2xl font-semibold mb-6">Messages</h1>
              
              <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
                {/* Conversations List */}
                <div className="w-full md:w-1/3 border-r dark:border-gray-700 pr-4 overflow-y-auto">
                  {conversations.length > 0 ? (
                    <ConversationList 
                      conversations={conversations}
                      currentUser={currentUser}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No conversations yet.</p>
                    </div>
                  )}
                </div>
                
                {/* Empty State */}
                <div className="w-full md:w-2/3 flex items-center justify-center">
                  <EmptyChatState />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}