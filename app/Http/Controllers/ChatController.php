<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB; 

use App\Models\Conversation;
use App\Models\Message;
use App\Models\ReadReceipt;
use App\Models\User;
use App\Models\Business;
use App\Models\Sellable;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Dispute;
use App\Models\DisputeMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;


class ChatController extends Controller
{
    /**
     * Display the chat page with conversations list.
     */
    public function index()
    {
        $user = Auth::user();
        
        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
                $query->where('userId', $user->user_id);
            })
            ->with(['participants', 'latestMessage'])
            ->get()
            ->map(function ($conversation) use ($user) {
                $otherUser = $conversation->participants
                    ->where('userId', '!=', $user->user_id)
                    ->first();
                
                $unreadCount = Message::where("conversationId", $conversation->id)
                    ->where("senderId", '!=', $user->user_id)
                    ->whereDoesntHave('readReceipts', function ($query) use ($user) {
                        $query->where("userId", $user->user_id);
                    })
                    ->count();
                
                return [
                    "conversationId" => $conversation->id,
                    'other_user' => $otherUser,
                    'latest_message' => $conversation->latestMessage,
                    'unread_count' => $unreadCount,
                    'updated_at' => $conversation->updated_at,
                ];
            })
            ->sortByDesc('updated_at')
            ->values();
        
        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
            'currentUser' => $user,
        ]);
    }

    
    /**
     * Show a specific conversation or create a new one.
     */
    public function show($userId)
    {
        $currentUser = Auth::user();
        $otherUser = User::findOrFail($userId);
        
        // Find existing conversation manually
        $conversationId = DB::table('conversation_participants')
            ->select('conversationId')
            ->whereIn('userId', [$currentUser->user_id, $userId])
            ->groupBy('conversationId')
            ->havingRaw('COUNT(DISTINCT "userId") = 2')
            ->pluck('conversationId')
            ->first();

        if ($conversationId) {
            $conversation = Conversation::with(['participants', 'latestMessage'])->find($conversationId);
        } else {
            $conversation = Conversation::create([
                'title' => null,
                'isGroup' => false,
            ]);

            $conversation->participants()->syncWithoutDetaching([$currentUser->user_id, $userId]);
        }

        
        // if (!$conversation) {
        //     $conversation = Conversation::create([
        //         'user1_id' => $currentUser->user_id,
        //         'user2_id' => $userId,
        //     ]);
        // }
        
        // Get messages for this conversation
        $messages = Message::where("conversationId", $conversation->id)
            ->with(['sender', 'attachedSellable', 'transaction'])
            ->orderBy('created_at')
            ->get();
        
        // Mark messages as read
        $unreadMessages = $messages->filter(function ($message) use ($currentUser) {
            return $message->sender_id !== $currentUser->user_id && 
                   !$message->readReceipts()->where("userId", $currentUser->user_id)->exists();
        });
        
        foreach ($unreadMessages as $message) {
            ReadReceipt::create([
                "messageId" => $message->message_id,
                "userId" => $currentUser->user_id,
                'read_at' => now(),
            ]);
        }
        
        // Get all conversations for the sidebar
        $conversations = Conversation::whereHas('participants', function ($query) use ($currentUser) {
                $query->where('userId', $currentUser->user_id);
            })
            ->with(['participants', 'latestMessage'])
            ->get()
            ->map(function ($conv) use ($currentUser) {
                $otherUser = $conv->participants
                ->where('user_id', '!=', $currentUser->user_id)
                ->first();

                $unreadCount = Message::where("conversationId", $conv->id)
                    ->where("senderId", '!=', $currentUser->user_id)
                    ->whereDoesntHave('readReceipts', function ($query) use ($currentUser) {
                        $query->where("userId", $currentUser->user_id);
                    })
                    ->count();
                
                return [
                    "conversationId" => $conv->conversation_id,
                    'other_user' => $otherUser ? $otherUser : null,
                    'latest_message' => $conv->latestMessage,
                    'unread_count' => $unreadCount,
                    'updated_at' => $conv->updated_at,
                ];
            })
            ->sortByDesc('updated_at')
            ->values();
        
        // Get business info if other user is a business owner
        $business = null;
        $sellables = [];
        
        if ($otherUser->user_type === 'BUSINESSOWNER') {
            $business = Business::where('owner_id', $otherUser->user_id)->first();
            
            if ($business) {
                $sellables = Sellable::where('business_id', $business->business_id)->get();
            }
        }
        
        // Get active transactions between these users
        $transactions = Transaction::where(function ($query) use ($currentUser, $otherUser) {
            $query->where('customer_id', $currentUser->user_id)
                  ->whereHas('business', function ($q) use ($otherUser) {
                      $q->where('owner_id', $otherUser->user_id);
                  });
        })->orWhere(function ($query) use ($currentUser, $otherUser) {
            $query->whereHas('business', function ($q) use ($currentUser) {
                $q->where('owner_id', $currentUser->user_id);
            })->where('customer_id', $otherUser->user_id);
        })
        ->with(['items.sellable', 'business', 'customer', 'dispute'])
        ->orderBy('created_at', 'desc')
        ->get();
        
        return Inertia::render('Chat/Show', [
            'conversation' => $conversation,
            'messages' => $messages,
            'otherUser' => $otherUser,
            'currentUser' => $currentUser,
            'conversations' => $conversations,
            'business' => $business,
            'sellables' => $sellables,
            'transactions' => $transactions,
        ]);
    }
    
    /**
     * Send a message.
     */
    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate([
            'content' => 'required|string',
            'sellable_id' => 'nullable|exists:sellables,sellable_id',
        ]);
        
        $user = Auth::user();
        $conversation = Conversation::findOrFail($conversationId);
        
        // Ensure user is part of the conversation
        if (!$conversation->participants()->where('userId', $user->user_id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Fetch conversation participants
        $participantIds = $conversation->participants()->pluck('userId')->toArray();

        // Remove current user from participants
        $recipientId = collect($participantIds)->first(function ($id) use ($user) {
            return $id !== $user->user_id;
        });

        $message = Message::create([
            "conversationId" => $conversationId,
            "senderId" => $user->user_id,
            "recipientId" => $recipientId,
            'content' => $request->content,
            'sellable_id' => $request->sellable_id,
        ]);

        // Fire the real-time event
        event(new \App\Events\MessageSent($message));
        
        // Update conversation timestamp
        $conversation->touch();
        
        // Load relationships
        $message->load(['sender', 'attachedSellable']);
        
        // Broadcast the message (you would implement this with Laravel Echo)
        // event(new MessageSent($message));
        
        return response()->json($message);
    }
    
    /**
     * Create a transaction.
     */
    // public function createTransaction(Request $request)
    // {
    //     $request->validate([
    //         "conversationId" => 'required|exists:conversations,id',
    //         'customer_id' => 'required|exists:users,user_id',
    //         'business_id' => 'required|exists:businesses,business_id',
    //         'items' => 'required|array|min:1',
    //         'items.*.sellable_id' => 'required|exists:sellables,sellable_id',
    //         'items.*.quantity' => 'required|integer|min:1',
    //         'items.*.price' => 'required|numeric|min:0',
    //     ]);
        
    //     $user = Auth::user();
    //     $conversation = Conversation::findOrFail($request->conversationId);
        
    //     // Ensure user is part of the conversation
    //     if ($conversation->user1_id !== $user->user_id && $conversation->user2_id !== $user->user_id) {
    //         return response()->json(['message' => 'Unauthorized'], 403);
    //     }
        
    //     // Ensure user is the business owner
    //     $business = Business::findOrFail($request->business_id);
    //     if ($business->owner_id !== $user->user_id) {
    //         return response()->json(['message' => 'Unauthorized'], 403);
    //     }
        
    //     // Create transaction
    //     $transaction = Transaction::create([
    //         'customer_id' => $request->customer_id,
    //         'business_id' => $request->business_id,
    //         'status' => 'PENDING',
    //         'date_initiated' => now(),
    //     ]);
        
    //     // Create transaction items
    //     $totalAmount = 0;
    //     foreach ($request->items as $item) {
    //         $itemTotal = $item['quantity'] * $item['price'];
    //         $totalAmount += $itemTotal;
            
    //         TransactionItem::create([
    //             'transaction_id' => $transaction->transaction_id,
    //             'sellable_id' => $item['sellable_id'],
    //             'quantity' => $item['quantity'],
    //             'price' => $item['price'],
    //         ]);
    //     }
        
    //     // Update transaction with total amount
    //     $transaction->total_amount = $totalAmount;
    //     $transaction->save();
        
    //     // Send a system message about the transaction
    //     $message = Message::create([
    //         "conversationId" => $request->conversationId,
    //         "senderId" => $user->user_id,
    //         'content' => 'Created a new transaction.',
    //         'transaction_id' => $transaction->transaction_id,
    //     ]);
        
    //     // Load relationships
    //     $transaction->load(['items.sellable', 'business', 'customer']);
        
    //     return response()->json([
    //         'transaction' => $transaction,
    //         'message' => $message,
    //     ]);
    // }

    public function createTransaction(Request $request)
    {
        $request->validate([
            "conversationId" => 'required|exists:conversations,id',
            'customer_id' => 'required|exists:users,user_id',
            'business_id' => 'required|exists:businesses,business_id',
            'items' => 'required|array|min:1',
            'items.*.sellable_id' => 'required|exists:sellables,sellable_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();
        $conversation = Conversation::findOrFail($request->conversationId);

        // Ensure user is part of the conversation
        if (!$conversation->participants()->where('userId', $user->user_id)->exists()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ensure user is the business owner
        $business = Business::findOrFail($request->business_id);
        if ($business->owner_id !== $user->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Create transaction
        $transaction = Transaction::create([
            'customer_id' => $request->customer_id,
            'business_id' => $request->business_id,
            'status' => 'PENDING',
            'date_initiated' => now(),
        ]);

        // Create transaction items
        $totalAmount = 0;
        foreach ($request->items as $item) {
            $itemTotal = $item['quantity'] * $item['price'];
            $totalAmount += $itemTotal;

            TransactionItem::create([
                'transaction_id' => $transaction->transaction_id,
                'sellable_id' => $item['sellable_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        // Update transaction with total amount
        $transaction->total_amount = $totalAmount;
        $transaction->save();

        // Send a system message about the transaction
        $message = Message::create([
            "conversationId" => $request->conversationId,
            "senderId" => $user->user_id,
            'content' => 'Created a new transaction.',
            'transaction_id' => $transaction->transaction_id,
        ]);

        // Load relationships
        $transaction->load(['items.sellable', 'business', 'customer']);

        return response()->json([
            'transaction' => $transaction,
            'message' => $message,
        ]);
    }

    /**
     * Update transaction status.
     */
    public function updateTransactionStatus(Request $request, $transactionId)
    {
        $request->validate([
            'status' => 'required|in:PENDING,APPROVED,COMPLETED,INCOMPLETE',
            "conversationId" => 'required|exists:conversations,id',
            'reason' => 'nullable|string',
        ]);
        
        $user = Auth::user();
        $transaction = Transaction::findOrFail($transactionId);
        
        // Ensure user is either the customer or business owner
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;
        
        if (!$isCustomer && !$isBusinessOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Check if the status update is valid based on user role and current status
        $currentStatus = $transaction->status;
        $newStatus = $request->status;
        
        $isValidUpdate = false;
        
        if ($isCustomer) {
            if (($currentStatus === 'PENDING' && $newStatus === 'APPROVED') ||
                ($currentStatus === 'APPROVED' && ($newStatus === 'COMPLETED' || $newStatus === 'INCOMPLETE'))) {
                $isValidUpdate = true;
            }
        }
        
        if ($isBusinessOwner) {
            if (($currentStatus === 'COMPLETED' && $newStatus === 'COMPLETED') ||
                ($currentStatus === 'COMPLETED' && $newStatus === 'INCOMPLETE')) {
                $isValidUpdate = true;
            }
        }
        
        if (!$isValidUpdate) {
            return response()->json(['message' => 'Invalid status update'], 400);
        }
        
        // Update transaction status
        $transaction->status = $newStatus;
        if ($request->has('reason') && $newStatus === 'INCOMPLETE') {
            $transaction->notes = $request->reason;
        }
        $transaction->save();
        
        // Send a system message about the status update
        $statusMessage = '';
        if ($newStatus === 'APPROVED') {
            $statusMessage = 'approved the transaction.';
        } elseif ($newStatus === 'COMPLETED' && $isCustomer) {
            $statusMessage = 'marked the transaction as completed.';
        } elseif ($newStatus === 'COMPLETED' && $isBusinessOwner) {
            $statusMessage = 'confirmed the transaction is completed.';
        } elseif ($newStatus === 'INCOMPLETE') {
            $statusMessage = 'marked the transaction as incomplete: ' . ($request->reason ?? 'No reason provided.');
        }
        
        $message = Message::create([
            "conversationId" => $request->conversationId,
            "senderId" => $user->user_id,
            'content' => $statusMessage,
            'transaction_id' => $transaction->transaction_id,
        ]);
        
        // Load relationships
        $transaction->load(['items.sellable', 'business', 'customer']);
        
        return response()->json([
            'transaction' => $transaction,
            'message' => $message,
        ]);
    }
    
    /**
     * Create a dispute.
     */
    public function createDispute(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,transaction_id',
            "conversationId" => 'required|exists:conversations,conversation_id',
            'reason' => 'required|string',
        ]);
        
        $user = Auth::user();
        $transaction = Transaction::findOrFail($request->transaction_id);
        
        // Ensure user is either the customer or business owner
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;
        
        if (!$isCustomer && !$isBusinessOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Check if a dispute already exists
        if ($transaction->dispute) {
            return response()->json(['message' => 'A dispute already exists for this transaction'], 400);
        }
        
        // Create dispute
        $dispute = Dispute::create([
            'transaction_id' => $request->transaction_id,
            'complainant_id' => $user->user_id,
            'reason' => $request->reason,
            'status' => 'PENDING',
        ]);
        
        // Create initial dispute message
        DisputeMessage::create([
            'dispute_id' => $dispute->dispute_id,
            "senderId" => $user->user_id,
            'message' => $request->reason,
        ]);
        
        // Send a system message about the dispute
        $message = Message::create([
            "conversationId" => $request->conversationId,
            "senderId" => $user->user_id,
            'content' => 'Created a dispute: ' . $request->reason,
            'transaction_id' => $transaction->transaction_id,
        ]);
        
        // Load relationships
        $dispute->load(['transaction', 'complainant', 'messages']);
        
        return response()->json([
            'dispute' => $dispute,
            'message' => $message,
        ]);
    }
    
    /**
     * Add a message to a dispute.
     */
    public function addDisputeMessage(Request $request, $disputeId)
    {
        $request->validate([
            'message' => 'required|string',
            "conversationId" => 'required|exists:conversations,conversation_id',
        ]);
        
        $user = Auth::user();
        $dispute = Dispute::findOrFail($disputeId);
        
        // Ensure user is either the customer, business owner, or admin
        $transaction = $dispute->transaction;
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;
        $isAdmin = $user->user_type === 'ADMIN';
        
        if (!$isCustomer && !$isBusinessOwner && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Create dispute message
        $disputeMessage = DisputeMessage::create([
            'dispute_id' => $disputeId,
            "senderId" => $user->user_id,
            'message' => $request->message,
        ]);
        
        // Send a system message about the dispute update
        $message = Message::create([
            "conversationId" => $request->conversationId,
            "senderId" => $user->user_id,
            'content' => 'Added a message to the dispute: ' . $request->message,
            'transaction_id' => $transaction->transaction_id,
        ]);
        
        // Load relationships
        $disputeMessage->load(['sender']);
        
        return response()->json([
            'disputeMessage' => $disputeMessage,
            'message' => $message,
        ]);
    }
    
    /**
     * Resolve a dispute.
     */
    public function resolveDispute(Request $request, $disputeId)
    {
        $request->validate([
            'resolution' => 'required|string',
            "conversationId" => 'required|exists:conversations,conversation_id',
        ]);
        
        $user = Auth::user();
        $dispute = Dispute::findOrFail($disputeId);
        
        // Only admins can resolve disputes
        if ($user->user_type !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        // Update dispute status
        $dispute->status = 'RESOLVED';
        $dispute->resolution = $request->resolution;
        $dispute->resolved_by = $user->user_id;
        $dispute->resolved_at = now();
        $dispute->save();
        
        // Send a system message about the resolution
        $message = Message::create([
            "conversationId" => $request->conversationId,
            "senderId" => $user->user_id,
            'content' => 'Resolved the dispute: ' . $request->resolution,
            'transaction_id' => $dispute->transaction_id,
        ]);
        
        // Load relationships
        $dispute->load(['transaction', 'complainant', 'messages', 'resolvedBy']);
        
        return response()->json([
            'dispute' => $dispute,
            'message' => $message,
        ]);
    }
}