<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',
        'isGroup',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'isGroup' => 'boolean',
    ];

    /**
     * Get the participants for the conversation.
     */
    public function participants()
    {
        return $this->belongsToMany(User::class, 'conversation_participants', 'conversationId', 'userId')
            ->withPivot('joinedAt', 'lastSeen')
            ->withTimestamps();
    }

    /**
     * Get the messages for the conversation.
     */
    public function messages()
    {
        return $this->hasMany(Message::class, 'conversationId');
    }

    /**
     * Get the latest message for the conversation.
     */
    public function latestMessage()
    {
        return $this->hasOne(Message::class, 'conversationId', 'id')
                    ->orderByDesc('created_at')
                    ->limit(1);
    }

}