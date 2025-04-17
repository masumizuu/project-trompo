<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Sellable;
use App\Models\Dispute;
use App\Models\DisputeMessage;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    /**
     * Create a new transaction.
     */
    public function create(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:users,user_id',
            'business_id' => 'required|exists:businesses,business_id',
            'items' => 'required|array',
            'items.*.sellable_id' => 'required|exists:sellables,sellable_id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Check if the authenticated user is the business owner
        $business = \App\Models\Business::find($request->business_id);
        if (!$business || $business->owner_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Calculate total amount
        $totalAmount = 0;
        foreach ($request->items as $item) {
            $totalAmount += $item['quantity'] * $item['price'];
        }

        // Create transaction
        $transaction = Transaction::create([
            'customer_id' => $request->customer_id,
            'business_id' => $request->business_id,
            'status' => 'PENDING',
            'total_amount' => $totalAmount,
            'date_initiated' => now(),
            'notes' => $request->notes,
        ]);

        // Create transaction items
        foreach ($request->items as $item) {
            TransactionItem::create([
                'transaction_id' => $transaction->transaction_id,
                'sellable_id' => $item['sellable_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        // Find or create conversation
        $conversation = Conversation::where(function ($query) use ($request) {
            $query->where('user1_id', Auth::id())
                ->where('user2_id', $request->customer_id);
        })->orWhere(function ($query) use ($request) {
            $query->where('user1_id', $request->customer_id)
                ->where('user2_id', Auth::id());
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user1_id' => Auth::id(),
                'user2_id' => $request->customer_id,
            ]);
        }

        // Create a system message about the transaction
        $message = Message::create([
            'conversation_id' => $conversation->conversation_id,
            'sender_id' => Auth::id(),
            'content' => 'Created a new transaction. Click to view details.',
            'transaction_id' => $transaction->transaction_id,
        ]);

        // Load the transaction with its items and related data
        $transaction->load([
            'transaction_items.sellable', 
            'business', 
            'customer'
        ]);

        return response()->json([
            'transaction' => $transaction,
            'message' => $message,
        ]);
    }

    /**
     * Update transaction status.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:PENDING,APPROVED,COMPLETED,INCOMPLETE',
            'reason' => 'nullable|string|required_if:status,INCOMPLETE',
        ]);

        $transaction = Transaction::with(['business', 'customer', 'transaction_items.sellable'])
            ->findOrFail($id);

        // Check authorization based on user type and transaction status
        $user = Auth::user();
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;

        if (!$isCustomer && !$isBusinessOwner && $user->user_type !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate status transitions
        if ($isCustomer) {
            if ($transaction->status === 'PENDING' && $request->status === 'APPROVED') {
                // Customer can approve a pending transaction
            } elseif ($transaction->status === 'APPROVED' && in_array($request->status, ['COMPLETED', 'INCOMPLETE'])) {
                // Customer can mark an approved transaction as completed or incomplete
            } else {
                return response()->json(['message' => 'Invalid status transition'], 400);
            }
        } elseif ($isBusinessOwner) {
            if ($transaction->status === 'COMPLETED' && $request->status === 'INCOMPLETE') {
                // Business owner can mark a completed transaction as incomplete
            } elseif ($transaction->status === 'INCOMPLETE' && $request->status === 'COMPLETED') {
                // Business owner can mark an incomplete transaction as completed
            } else {
                return response()->json(['message' => 'Invalid status transition'], 400);
            }
        }

        // Update transaction status
        $transaction->status = $request->status;
        $transaction->notes = $transaction->notes . "\n\n" . ($request->reason ?? '');
        $transaction->save();

        // Find conversation
        $conversation = Conversation::where(function ($query) use ($transaction) {
            $query->where('user1_id', $transaction->customer_id)
                ->where('user2_id', $transaction->business->owner_id);
        })->orWhere(function ($query) use ($transaction) {
            $query->where('user1_id', $transaction->business->owner_id)
                ->where('user2_id', $transaction->customer_id);
        })->first();

        if ($conversation) {
            // Create a system message about the status update
            $statusMessage = '';
            switch ($request->status) {
                case 'APPROVED':
                    $statusMessage = 'Transaction has been approved.';
                    break;
                case 'COMPLETED':
                    $statusMessage = 'Transaction has been marked as completed.';
                    break;
                case 'INCOMPLETE':
                    $statusMessage = 'Transaction has been marked as incomplete: ' . ($request->reason ?? '');
                    break;
                default:
                    $statusMessage = 'Transaction status has been updated to ' . $request->status;
            }

            $message = Message::create([
                'conversation_id' => $conversation->conversation_id,
                'sender_id' => Auth::id(),
                'content' => $statusMessage,
                'transaction_id' => $transaction->transaction_id,
            ]);
        }

        return response()->json([
            'transaction' => $transaction,
            'message' => $message ?? null,
        ]);
    }

    /**
     * Create a dispute for a transaction.
     */
    public function createDispute(Request $request)
    {
        $request->validate([
            'transaction_id' => 'required|exists:transactions,transaction_id',
            'reason' => 'required|string',
        ]);

        $transaction = Transaction::with(['business', 'customer'])
            ->findOrFail($request->transaction_id);

        // Check authorization
        $user = Auth::user();
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;

        if (!$isCustomer && !$isBusinessOwner) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if a dispute already exists
        $existingDispute = Dispute::where('transaction_id', $transaction->transaction_id)->first();
        if ($existingDispute) {
            return response()->json(['message' => 'A dispute already exists for this transaction'], 400);
        }

        // Create dispute
        $dispute = Dispute::create([
            'transaction_id' => $transaction->transaction_id,
            'initiator_id' => Auth::id(),
            'reason' => $request->reason,
            'status' => 'PENDING',
        ]);

        // Find conversation
        $conversation = Conversation::where(function ($query) use ($transaction) {
            $query->where('user1_id', $transaction->customer_id)
                ->where('user2_id', $transaction->business->owner_id);
        })->orWhere(function ($query) use ($transaction) {
            $query->where('user1_id', $transaction->business->owner_id)
                ->where('user2_id', $transaction->customer_id);
        })->first();

        if ($conversation) {
            // Create a system message about the dispute
            $message = Message::create([
                'conversation_id' => $conversation->conversation_id,
                'sender_id' => Auth::id(),
                'content' => 'A dispute has been created for this transaction: ' . $request->reason,
                'transaction_id' => $transaction->transaction_id,
            ]);
        }

        return response()->json([
            'dispute' => $dispute,
            'message' => $message ?? null,
        ]);
    }

    /**
     * Add a message to a dispute.
     */
    public function addDisputeMessage(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $dispute = Dispute::with('transaction')->findOrFail($id);
        $transaction = $dispute->transaction;

        // Check authorization
        $user = Auth::user();
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;
        $isAdmin = $user->user_type === 'ADMIN';

        if (!$isCustomer && !$isBusinessOwner && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Create dispute message
        $disputeMessage = DisputeMessage::create([
            'dispute_id' => $dispute->dispute_id,
            'sender_id' => Auth::id(),
            'message' => $request->message,
        ]);

        return response()->json([
            'message' => $disputeMessage,
        ]);
    }

    /**
     * Resolve a dispute.
     */
    public function resolveDispute(Request $request, $id)
    {
        $request->validate([
            'resolution' => 'required|string',
        ]);

        $dispute = Dispute::with('transaction')->findOrFail($id);

        // Only admins can resolve disputes
        if (Auth::user()->user_type !== 'ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Update dispute
        $dispute->status = 'RESOLVED';
        $dispute->resolution = $request->resolution;
        $dispute->resolved_at = now();
        $dispute->resolver_id = Auth::id();
        $dispute->save();

        // Find conversation
        $transaction = $dispute->transaction;
        $conversation = Conversation::where(function ($query) use ($transaction) {
            $query->where('user1_id', $transaction->customer_id)
                ->where('user2_id', $transaction->business->owner_id);
        })->orWhere(function ($query) use ($transaction) {
            $query->where('user1_id', $transaction->business->owner_id)
                ->where('user2_id', $transaction->customer_id);
        })->first();

        if ($conversation) {
            // Create a system message about the resolution
            $message = Message::create([
                'conversation_id' => $conversation->conversation_id,
                'sender_id' => Auth::id(),
                'content' => 'The dispute has been resolved: ' . $request->resolution,
                'transaction_id' => $transaction->transaction_id,
            ]);
        }

        return response()->json([
            'dispute' => $dispute,
            'message' => $message ?? null,
        ]);
    }

    /**
     * Get transaction details.
     */
    public function show($id)
    {
        $transaction = Transaction::with([
            'transaction_items.sellable', 
            'business', 
            'customer',
            'dispute'
        ])->findOrFail($id);

        // Check authorization
        $user = Auth::user();
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;
        $isAdmin = $user->user_type === 'ADMIN';

        if (!$isCustomer && !$isBusinessOwner && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'transaction' => $transaction,
        ]);
    }

    /**
     * Get dispute details.
     */
    public function getDispute($id)
    {
        $dispute = Dispute::with([
            'transaction.business', 
            'transaction.customer',
            'messages' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
            'initiator',
            'resolver'
        ])->findOrFail($id);

        // Check authorization
        $user = Auth::user();
        $transaction = $dispute->transaction;
        $isCustomer = $transaction->customer_id === $user->user_id;
        $isBusinessOwner = $transaction->business->owner_id === $user->user_id;
        $isAdmin = $user->user_type === 'ADMIN';

        if (!$isCustomer && !$isBusinessOwner && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'dispute' => $dispute,
        ]);
    }
}