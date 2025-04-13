<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $primaryKey = 'message_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'content',
        'timestamp',
        'media',
        'senderId',
        'recipientId',
        'conversationId',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'timestamp' => 'datetime',
        'media' => 'array',
    ];

    /**
     * Get the sender that owns the message.
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'senderId');
    }

    /**
     * Get the recipient that owns the message.
     */
    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipientId');
    }

    /**
     * Get the conversation that owns the message.
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversationId');
    }

    /**
     * Get the read receipts for the message.
     */
    public function readReceipts()
    {
        return $this->hasMany(ReadReceipt::class, 'messageId');
    }
}