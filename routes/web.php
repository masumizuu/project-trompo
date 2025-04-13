<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

// Landing Page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Email Auth (user registration)
Route::middleware('auth')->group(function () {
    // ... existing routes
    Route::get('/email/verify', [OtpController::class, 'showVerificationForm'])
        ->name('verification.notice');
    Route::post('/email/verification-notification', [OtpController::class, 'sendVerificationOtp'])
        ->name('verification.send');
    Route::post('/email/verify', [OtpController::class, 'verifyEmail'])
        ->name('verification.verify');
});

// Email Auth (forgot password)
Route::middleware('guest')->group(function () {
    // ... existing guest routes
    Route::get('/forgot-password', [PasswordResetController::class, 'showForgotForm'])
        ->name('password.request');
    Route::post('/forgot-password', [PasswordResetController::class, 'sendResetOtp'])
        ->name('password.email');
    Route::get('/reset-password', [PasswordResetController::class, 'showResetForm'])
        ->name('password.reset');
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
        ->name('password.update');
});

// routes/web.php
Route::middleware('auth')->group(function () {
    // ... existing routes
    Route::get('/email/verify', [OtpController::class, 'showVerificationForm'])
        ->name('verification.notice');
    Route::post('/email/verification-notification', [OtpController::class, 'sendVerificationOtp'])
        ->name('verification.send');
    Route::post('/email/verify', [OtpController::class, 'verifyEmail'])
        ->name('verification.verify');
});

// Dashboard routes
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Profile routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/image', [ProfileController::class, 'updateImage'])->name('profile.image.update');
});

require __DIR__.'/auth.php';

Route::fallback(function () {
    return Inertia::render('NotFound')->toResponse(request())->setStatusCode(404);
});