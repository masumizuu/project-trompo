<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConversationParticipant extends Model
{
    protected $fillable = ['conversationId', 'userId', 'joinedAt', 'lastSeen'];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'user_id');
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'conversationId');
    }
}