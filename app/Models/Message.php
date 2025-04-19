<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $primaryKey = 'message_id';

    protected $fillable = [
        'content',
        'conversationId',
        'senderId',
        'recipientId',
        'timestamp',
        'media',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversationId', 'id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'senderId', 'user_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipientId', 'user_id');
    }

    public function readReceipts()
    {
        return $this->hasMany(ReadReceipt::class, 'messageId');
    }

    public function attachedSellable()
    {
        return $this->belongsTo(Sellable::class, 'sellable_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }
}
