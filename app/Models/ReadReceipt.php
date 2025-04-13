<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReadReceipt extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'messageId',
        'userId',
        'readAt',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'readAt' => 'datetime',
    ];

    /**
     * Get the message that owns the read receipt.
     */
    public function message()
    {
        return $this->belongsTo(Message::class, 'messageId', 'message_id');
    }

    /**
     * Get the user that owns the read receipt.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}