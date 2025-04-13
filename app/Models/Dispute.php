<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    use HasFactory;

    protected $primaryKey = 'dispute_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'transaction_id',
        'complainant_id',
        'reason',
        'status',
        'admin_response',
    ];

    /**
     * Get the transaction that owns the dispute.
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    /**
     * Get the complainant that owns the dispute.
     */
    public function complainant()
    {
        return $this->belongsTo(Customer::class, 'complainant_id', 'user_id');
    }

    /**
     * Get the messages for the dispute.
     */
    public function messages()
    {
        return $this->hasMany(DisputeMessage::class, 'dispute_id');
    }
}