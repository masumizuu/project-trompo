<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sellable extends Model
{
    use HasFactory;

    protected $primaryKey = 'sellable_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'sellable_type',
        'price',
        'description',
        'media',
        'is_active',
        'business_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'price' => 'float',
        'media' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the business that owns the sellable.
     */
    public function business()
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    /**
     * Get the transaction items for the sellable.
     */
    public function transactionItems()
    {
        return $this->hasMany(TransactionItem::class, 'sellable_id');
    }
}