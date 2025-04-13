<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessVerification extends Model
{
    use HasFactory;

    protected $primaryKey = 'bv_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'business_id',
        'bv_file',
        'status',
        'reviewed_by',
        'response_date',
        'denial_reason',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'response_date' => 'datetime',
    ];

    /**
     * Get the business that owns the verification.
     */
    public function business()
    {
        return $this->belongsTo(Business::class, 'business_id');
    }

    /**
     * Get the admin that reviewed the verification.
     */
    public function reviewer()
    {
        return $this->belongsTo(Admin::class, 'reviewed_by', 'user_id');
    }
}