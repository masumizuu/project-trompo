<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'user_id';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone_number',
        'user_type',
        'user_auth',
        'is_verified',
        'profile_picture',
        'date_registered',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'date_registered' => 'datetime',
    ];

    /**
     * Get the admin record associated with the user.
     */
    public function admin()
    {
        return $this->hasOne(Admin::class, 'user_id');
    }

    /**
     * Get the business owner record associated with the user.
     */
    public function businessOwner()
    {
        return $this->hasOne(BusinessOwner::class, 'user_id');
    }

    /**
     * Get the customer record associated with the user.
     */
    public function customer()
    {
        return $this->hasOne(Customer::class, 'user_id');
    }

    /**
     * Get the messages sent by the user.
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'senderId');
    }

    /**
     * Get the messages received by the user.
     */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'recipientId');
    }

    /**
     * Get the conversations the user is participating in.
     */
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants', 'userId', 'conversationId')
            ->withPivot('joinedAt', 'lastSeen')
            ->withTimestamps();
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class, 'userId');
    }

    /**
     * Get the read receipts for the user.
     */
    public function readReceipts()
    {
        return $this->hasMany(ReadReceipt::class, 'userId');
    }

    /**
     * Get the user verifications for the user.
     */
    public function userVerifications()
    {
        return $this->hasOne(UserVerification::class, 'user_id');
    }

    /**
     * Get the full name of the user.
     */
    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }
}