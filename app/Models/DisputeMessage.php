<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DisputeMessage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'dispute_id',
        'user_id',
        'content',
    ];

    /**
     * Get the dispute that owns the message.
     */
    public function dispute()
    {
        return $this->belongsTo(Dispute::class, 'dispute_id');
    }

    /**
     * Get the user that owns the message.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}