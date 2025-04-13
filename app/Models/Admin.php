<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
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
        'permissions',
    ];

    /**
     * Get the user that owns the admin.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user verifications reviewed by the admin.
     */
    public function reviewedUserVerifications()
    {
        return $this->hasMany(UserVerification::class, 'reviewed_by');
    }

    /**
     * Get the business verifications reviewed by the admin.
     */
    public function reviewedBusinessVerifications()
    {
        return $this->hasMany(BusinessVerification::class, 'reviewed_by');
    }
}