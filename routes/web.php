<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['web', 'auth']]);

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

// Business routes
Route::get('/stores', [App\Http\Controllers\BusinessController::class, 'index'])->name('stores');
Route::get('/businesses/{id}', [App\Http\Controllers\BusinessController::class, 'show'])->name('business.show');
Route::get('/sellables', [App\Http\Controllers\BusinessController::class, 'getAllSellables'])->name('sellables.all');
Route::get('/sellables/{id}', [App\Http\Controllers\BusinessController::class, 'getSellable'])->name('sellable.show');
Route::get('/search', [App\Http\Controllers\BusinessController::class, 'search'])->name('search');
Route::get('/filter-businesses', [App\Http\Controllers\BusinessController::class, 'filterBusinesses'])->name('businesses.filter');
Route::get('/filter-sellables', [App\Http\Controllers\BusinessController::class, 'filterSellables'])->name('sellables.filter');

// Saved businesses routes (requires authentication)
Route::middleware(['auth'])->group(function () {
    Route::post('/businesses/{id}/save', [App\Http\Controllers\BusinessController::class, 'saveBusiness'])->name('business.save');
    Route::delete('/businesses/{id}/unsave', [App\Http\Controllers\BusinessController::class, 'unsaveBusiness'])->name('business.unsave');
    Route::get('/saved-businesses', [App\Http\Controllers\BusinessController::class, 'getSavedBusinesses'])->name('businesses.saved');
});

// Sellables routes
Route::get('/products-services', [App\Http\Controllers\BusinessController::class, 'sellablesIndex'])->name('sellables.all');
Route::get('/products-services/{id}', [App\Http\Controllers\BusinessController::class, 'showSellable'])->name('sellable.show');

// Chat routes
Route::middleware(['auth'])->group(function () {
    Route::get('/chat', [App\Http\Controllers\ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{userId}', [App\Http\Controllers\ChatController::class, 'show'])->name('chat.show');
    Route::post('/chat/{conversationId}/messages', [App\Http\Controllers\ChatController::class, 'sendMessage'])->name('chat.send-message');
    Route::post('/transactions', [App\Http\Controllers\ChatController::class, 'createTransaction'])->name('transactions.create');
    Route::put('/transactions/{transactionId}/status', [App\Http\Controllers\ChatController::class, 'updateTransactionStatus'])->name('transactions.update-status');
    Route::post('/disputes', [App\Http\Controllers\ChatController::class, 'createDispute'])->name('disputes.create');
    Route::post('/disputes/{disputeId}/messages', [App\Http\Controllers\ChatController::class, 'addDisputeMessage'])->name('disputes.add-message');
    Route::put('/disputes/{disputeId}/resolve', [App\Http\Controllers\ChatController::class, 'resolveDispute'])->name('disputes.resolve');
});

require __DIR__.'/auth.php';

Route::fallback(function () {
    return Inertia::render('NotFound')->toResponse(request())->setStatusCode(404);
});