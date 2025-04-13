<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $primaryKey = 'review_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'business_id',
        'rating',
        'review_text',
        'media',
        'review_date',
        'is_verified',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'rating' => 'integer',
        'media' => 'array',
        'review_date' => 'datetime',
        'is_verified' => 'boolean',
    ];

    /**
     * Get the customer that owns the review.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'user_id');
    }

    /**
     * Get the business that owns the review.
     */
    public function business()
    {
        return $this->belongsTo(Business::class, 'business_id');
    }
}