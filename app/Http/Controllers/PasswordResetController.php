<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\EmailOtp;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PasswordResetController extends Controller
{
    /**
     * Show the forgot password form.
     */
    public function showForgotForm()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }
    
    /**
     * Send OTP for password reset.
     */
    public function sendResetOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return back()->withErrors([
                'email' => 'We can\'t find a user with that email address.',
            ]);
        }
        
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
        Mail::raw("Your password reset code is: $otp", function ($message) use ($user) {
            $message->to($user->email)
                    ->subject('Password Reset Code');
        });
        
        return back()->with([
            'status' => 'We have emailed your password reset code!',
            'email' => $request->email,
        ]);
    }
    
    /**
     * Show the reset password form.
     */
    public function showResetForm(Request $request)
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
        ]);
    }
    
    /**
     * Reset the password.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);
        
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return back()->withErrors([
                'email' => 'We can\'t find a user with that email address.',
            ]);
        }
        
        $emailOtp = EmailOtp::where('user_id', $user->id)->first();
        
        if (!$emailOtp || $emailOtp->otp !== $request->otp || !$emailOtp->isValid()) {
            return back()->withErrors([
                'otp' => 'The reset code is invalid or expired.',
            ]);
        }
        
        // Reset the password
        $user->password = Hash::make($request->password);
        $user->save();
        
        // Delete the OTP
        $emailOtp->delete();
        
        return redirect()->route('login')->with('status', 'Your password has been reset!');
    }
}