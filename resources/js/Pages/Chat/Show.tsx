import React, { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import Layout from '@/Layouts/AuthenticatedLayout';
import ConversationList from '@/Components/Chat/ConversationList';
import MessageList from '@/Components/Chat/MessageList';
import MessageInput from '@/Components/Chat/MessageInput';
import AttachProductModal from '@/Components/Chat/AttachProductModal';
import CreateTransactionModal from '@/Components/Chat/CreateTransactionModal';
import TransactionDetails from '@/Components/Chat/TransactionDetails';
import CreateDisputeModal from '@/Components/Chat/CreateDisputeModal';
import DisputeDetails from '@/Components/Chat/DisputeDetails';
import {Transaction} from '@/types';

interface ChatShowProps {
  conversation: any;
  messages: any[];
  otherUser: any;
  currentUser: any;
  conversations: any[];
  business: any;
  sellables: any[];
  transactions: any[];
  auth: any;
}

export default function ChatShow({ 
  conversation, 
  messages: initialMessages, 
  otherUser, 
  currentUser, 
  conversations, 
  business, 
  sellables, 
  transactions,
  auth 
}: ChatShowProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isAttachProductModalOpen, setIsAttachProductModalOpen] = useState(false);
  const [isCreateTransactionModalOpen, setIsCreateTransactionModalOpen] = useState(false);
  const [isCreateDisputeModalOpen, setIsCreateDisputeModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Send a message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(route('chat.send-message', conversation.id), {
        content: newMessage,
      });
      
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Attach a product to a message
  const attachProduct = async (sellableId: number) => {
    setIsLoading(true);
    try {
      const response = await axios.post(route('chat.send-message', conversation.id), {
        content: 'I\'m interested in this product/service.',
        sellable_id: sellableId,
      });
      
      setMessages([...messages, response.data]);
      setIsAttachProductModalOpen(false);
    } catch (error) {
      console.error('Error attaching product:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a transaction
  const createTransaction = async (items: any[]) => {
    setIsLoading(true);
    try {
      const response = await axios.post(route('transactions.create'), {
        conversation_id: conversation.id,
        customer_id: currentUser.user_type === 'BUSINESSOWNER' ? otherUser.user_id : currentUser.user_id,
        business_id: business.business_id,
        items: items,
      });
      
      setMessages([...messages, response.data.message]);
      setIsCreateTransactionModalOpen(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update transaction status
  const updateTransactionStatus = async (transactionId: number, status: string, reason?: string) => {
    setIsLoading(true);
    try {
      const response = await axios.put(route('transactions.update-status', transactionId), {
        status: status,
        conversation_id: conversation.id,
        reason: reason,
      });
      
      setMessages([...messages, response.data.message]);
      
      // Update the transaction in the list
      const updatedTransactions = transactions.map(transaction => {
        if (transaction.transaction_id === transactionId) {
          return response.data.transaction;
        }
        return transaction;
      });
      
      // Update the selected transaction if it's the one being updated
      if (selectedTransaction && selectedTransaction.transaction_id === transactionId) {
        setSelectedTransaction(response.data.transaction);
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a dispute
  const createDispute = async (transactionId: number, reason: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(route('disputes.create'), {
        transaction_id: transactionId,
        conversation_id: conversation.id,
        reason: reason,
      });
      
      setMessages([...messages, response.data.message]);
      setIsCreateDisputeModalOpen(false);
      
      // Update the transaction in the list to include the new dispute
      const updatedTransactions = transactions.map(transaction => {
        if (transaction.transaction_id === transactionId) {
          return {
            ...transaction,
            dispute: response.data.dispute,
          };
        }
        return transaction;
      });
      
      // Update the selected transaction if it's the one being disputed
      if (selectedTransaction && selectedTransaction.transaction_id === transactionId) {
        setSelectedTransaction({
          ...selectedTransaction,
          dispute: response.data.dispute,
        });
      }
    } catch (error) {
      console.error('Error creating dispute:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add a message to a dispute
  const addDisputeMessage = async (disputeId: number, message: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(route('disputes.add-message', disputeId), {
        message: message,
        conversation_id: conversation.id,
      });
      
      setMessages([...messages, response.data.message]);
      
      // Update the dispute in the selected transaction
      if (selectedTransaction && selectedTransaction.dispute && selectedTransaction.dispute.dispute_id === disputeId) {
        const updatedDispute = {
          ...selectedTransaction.dispute,
          messages: [...selectedTransaction.dispute.messages, response.data.disputeMessage],
        };
        
        setSelectedTransaction({
          ...selectedTransaction,
          dispute: updatedDispute,
        });
      }
    } catch (error) {
      console.error('Error adding dispute message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resolve a dispute (admin only)
  const resolveDispute = async (disputeId: number, resolution: string) => {
    setIsLoading(true);
    try {
      const response = await axios.put(route('disputes.resolve', disputeId), {
        resolution: resolution,
        conversation_id: conversation.id,
      });
      
      setMessages([...messages, response.data.message]);
      
      // Update the dispute in the selected transaction
      if (selectedTransaction && selectedTransaction.dispute && selectedTransaction.dispute.dispute_id === disputeId) {
        setSelectedTransaction({
          ...selectedTransaction,
          dispute: response.data.dispute,
        });
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if user can create transactions (only business owners can)
  const canCreateTransaction = currentUser.user_type === 'BUSINESSOWNER' && business && business.owner_id === currentUser.user_id;
  
  return (
    <Layout>
      <Head title={`Chat with ${otherUser.first_name}`} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div className="flex flex-col md:flex-row h-[calc(100vh-250px)]">
                {/* Conversations List */}
                <div className="w-full md:w-1/4 border-r dark:border-gray-700 pr-4 overflow-y-auto">
                  <ConversationList 
                    conversations={conversations}
                    currentUser={currentUser}
                    activeConversationId={conversation.id}
                  />
                </div>
                
                {/* Chat Area */}
                <div className="w-full md:w-2/4 flex flex-col">
                  {/* Chat Header */}
                  <div className="border-b dark:border-gray-700 p-4 flex items-center">
                    <img 
                      src={otherUser.profile_picture || '/placeholder-user.jpg'} 
                      alt={`${otherUser.first_name} ${otherUser.last_name}`}
                      className="w-10 h-10 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h2 className="font-medium">{otherUser.first_name} {otherUser.last_name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {otherUser.user_type === 'BUSINESSOWNER' ? 'Business Owner' : 'Customer'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <MessageList 
                      messages={messages}
                      currentUser={currentUser}
                      otherUser={otherUser}
                      onTransactionClick={(transaction) => setSelectedTransaction(transaction)}
                    />
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t dark:border-gray-700 p-4">
                    <MessageInput 
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onSubmit={sendMessage}
                      isLoading={isLoading}
                      onAttachProduct={() => setIsAttachProductModalOpen(true)}
                      onCreateTransaction={() => setIsCreateTransactionModalOpen(true)}
                      canCreateTransaction={canCreateTransaction}
                    />
                  </div>
                </div>
                
                {/* Transaction/Dispute Details */}
                <div className="w-full md:w-1/4 border-l dark:border-gray-700 pl-4 overflow-y-auto">
                  {selectedTransaction ? (
                    <TransactionDetails 
                      transaction={selectedTransaction}
                      currentUser={currentUser}
                      onUpdateStatus={updateTransactionStatus}
                      onCreateDispute={() => setIsCreateDisputeModalOpen(true)}
                      onViewDispute={(dispute) => setSelectedDispute(dispute)}
                      onClose={() => setSelectedTransaction(null)}
                    />
                  ) : selectedDispute ? (
                    <DisputeDetails 
                      dispute={selectedDispute}
                      currentUser={currentUser}
                      onAddMessage={addDisputeMessage}
                      onResolve={resolveDispute}
                      onClose={() => setSelectedDispute(null)}
                    />
                  ) : (
                    <div className="p-4">
                      <h3 className="font-medium text-lg mb-4">Transactions</h3>
                      {transactions.length > 0 ? (
                        <div className="space-y-4">
                          {transactions.map((transaction) => (
                            <div 
                              key={transaction.transaction_id}
                              className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">Transaction #{transaction.transaction_id}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  transaction.status === 'COMPLETED' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : transaction.status === 'INCOMPLETE' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : transaction.status === 'APPROVED'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(transaction.date_initiated).toLocaleDateString()}
                              </p>
                              {transaction.dispute && (
                                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                                  Dispute: {transaction.dispute.status}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No transactions yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AttachProductModal 
        isOpen={isAttachProductModalOpen}
        onClose={() => setIsAttachProductModalOpen(false)}
        sellables={sellables}
        onAttach={attachProduct}
      />
      
      <CreateTransactionModal 
        isOpen={isCreateTransactionModalOpen}
        onClose={() => setIsCreateTransactionModalOpen(false)}
        sellables={sellables}
        onSubmit={createTransaction}
        customerId={currentUser.user_type === 'BUSINESSOWNER' ? otherUser.user_id : currentUser.user_id}
      />
      
      <CreateDisputeModal 
        isOpen={isCreateDisputeModalOpen}
        onClose={() => setIsCreateDisputeModalOpen(false)}
        transaction={selectedTransaction}
        onSubmit={createDispute}
      />
    </Layout>
  );
}