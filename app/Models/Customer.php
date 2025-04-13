<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_id';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'saved_businesses',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'saved_businesses' => 'array',
    ];

    /**
     * Get the user that owns the customer.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the transactions for the customer.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'customer_id');
    }

    /**
     * Get the reviews written by the customer.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'customer_id');
    }

    /**
     * Get the disputes filed by the customer.
     */
    public function disputes()
    {
        return $this->hasMany(Dispute::class, 'complainant_id');
    }

    /**
     * The businesses that the customer has saved.
     */
    public function savedBusinesses()
    {
        return $this->belongsToMany(Business::class, 'saved_businesses', 'user_id', 'business_id')
            ->withPivot('saved_at')
            ->withTimestamps();
    }
}