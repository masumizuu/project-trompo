<?php

namespace App\Http\Controllers;

use App\Models\EmailOtp;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OtpController extends Controller
{
    /**
     * Send OTP for email verification.
     */
    public function sendVerificationOtp(Request $request)
    {
        $user = $request->user();
        
        // Generate a 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store OTP in database
        EmailOtp::updateOrCreate(
            ['user_id' => $user->id],
            [
                'otp' => $otp,
                'expires_at' => Carbon::now()->addMinutes(10), // OTP expires in 10 minutes
            ]
        );
        
        // Send OTP via email
        Mail::raw("Your verification code is: $otp", function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Email Verification Code');
        });
        
        return back()->with('status', 'verification-link-sent');
    }
    
    /**
     * Verify OTP and mark email as verified.
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);
        
        $user = $request->user();
        $emailOtp = EmailOtp::where('user_id', $user->id)->first();
        
        if (!$emailOtp || $emailOtp->otp !== $request->otp || !$emailOtp->isValid()) {
            return back()->withErrors([
                'otp' => 'The verification code is invalid or expired.',
            ]);
        }
        
        // Mark email as verified
        $user->email_verified_at = Carbon::now();
        $user->save();
        
        // Delete the OTP
        $emailOtp->delete();
        
        return redirect()->route('dashboard')->with('status', 'email-verified');
    }
    
    /**
     * Show the email verification form.
     */
    public function showVerificationForm(Request $request)
    {
        return Inertia::render('Auth/VerifyEmail', [
            'status' => session('status'),
        ]);
    }
}