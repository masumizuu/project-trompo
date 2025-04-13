<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $primaryKey = 'location_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'city',
        'province',
        'postal_code',
    ];

    /**
     * Get the businesses for the location.
     */
    public function businesses()
    {
        return $this->hasMany(Business::class, 'location_id');
    }
}