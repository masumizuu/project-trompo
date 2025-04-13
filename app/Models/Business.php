<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    protected $primaryKey = 'business_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'owner_id',
        'business_name',
        'banner',
        'logo',
        'description',
        'category',  // This should be 'category', not 'category_id'
        'address',
        'location_id',
        'contact_number',
        'website_url',
        'is_verified',
        'date_registered',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_verified' => 'boolean',
        'date_registered' => 'datetime',
    ];

    /**
     * Get the owner of the business.
     */
    public function owner()
    {
        return $this->belongsTo(BusinessOwner::class, 'owner_id', 'user_id');
    }

    /**
     * Get the category of the business.
     */
    public function categoryRef()
    {
        return $this->belongsTo(Category::class, 'category', 'category_name');
    }

    /**
     * Get the location of the business.
     */
    public function location()
    {
        return $this->belongsTo(Location::class, 'location_id');
    }

    /**
     * Get the sellables for the business.
     */
    public function sellables()
    {
        return $this->hasMany(Sellable::class, 'business_id');
    }

    /**
     * Get the transactions for the business.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'business_id');
    }

    /**
     * Get the reviews for the business.
     */
    public function reviews()
    {
        return $this->hasMany(Review::class, 'business_id');
    }

    /**
     * Get the business verification for the business.
     */
    public function businessVerification()
    {
        return $this->hasOne(BusinessVerification::class, 'business_id');
    }

    /**
     * The customers that have saved this business.
     */
    public function savedByCustomers()
    {
        return $this->belongsToMany(Customer::class, 'saved_businesses', 'business_id', 'user_id')
            ->withPivot('saved_at')
            ->withTimestamps();
    }
}