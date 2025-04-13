<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create admins table
        Schema::create('admins', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->string('permissions')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        // Create business_owners table
        Schema::create('business_owners', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        // Create customers table
        Schema::create('customers', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->json('saved_businesses')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('cascade');
        });

        // Create categories table
        Schema::create('categories', function (Blueprint $table) {
            $table->id('category_id');
            $table->string('category_name')->unique();
            $table->timestamps();
        });

        // Create locations table
        Schema::create('locations', function (Blueprint $table) {
            $table->id('location_id');
            $table->string('city');
            $table->string('province');
            $table->string('postal_code');
            $table->timestamps();
        });

        // Create businesses table
        Schema::create('businesses', function (Blueprint $table) {
            $table->id('business_id');
            $table->unsignedBigInteger('owner_id');
            $table->string('business_name');
            $table->string('banner')->nullable();
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->string('address')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('website_url')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamp('date_registered')->default(now());
            $table->timestamps();
            
            $table->foreign('owner_id')->references('user_id')->on('business_owners');
            $table->foreign('category')->references('category_name')->on('categories');
            $table->foreign('location_id')->references('location_id')->on('locations');
        });

        // Create saved_businesses table
        Schema::create('saved_businesses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('business_id');
            $table->timestamp('saved_at')->default(now());
            $table->timestamps();
            
            $table->unique(['user_id', 'business_id']);
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('business_id')->references('business_id')->on('businesses');
        });

        // Create sellables table
        Schema::create('sellables', function (Blueprint $table) {
            $table->id('sellable_id');
            $table->string('name');
            $table->enum('sellable_type', ['PRODUCT', 'SERVICE']);
            $table->float('price');
            $table->text('description')->nullable();
            $table->json('media');
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('business_id');
            $table->timestamps();
            
            $table->foreign('business_id')->references('business_id')->on('businesses');
        });

        // Create transactions table
        Schema::create('transactions', function (Blueprint $table) {
            $table->id('transaction_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('business_id');
            $table->enum('status', ['PENDING', 'INCOMPLETE', 'COMPLETED', 'FINISHED'])->default('PENDING');
            $table->string('reason_incomplete')->nullable();
            $table->timestamp('date_initiated')->default(now());
            $table->timestamp('date_completed')->nullable();
            $table->timestamps();
            
            $table->foreign('customer_id')->references('user_id')->on('customers');
            $table->foreign('business_id')->references('business_id')->on('businesses');
        });

        // Create transaction_items table
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id('item_id');
            $table->unsignedBigInteger('transaction_id');
            $table->unsignedBigInteger('sellable_id');
            $table->integer('quantity');
            $table->float('price');
            $table->timestamps();
            
            $table->foreign('transaction_id')->references('transaction_id')->on('transactions');
            $table->foreign('sellable_id')->references('sellable_id')->on('sellables');
        });

        // Create reviews table
        Schema::create('reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('business_id');
            $table->integer('rating');
            $table->text('review_text')->nullable();
            $table->json('media')->nullable();
            $table->timestamp('review_date')->default(now());
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
            
            $table->foreign('customer_id')->references('user_id')->on('customers');
            $table->foreign('business_id')->references('business_id')->on('businesses');
        });

        // Create disputes table
        Schema::create('disputes', function (Blueprint $table) {
            $table->id('dispute_id');
            $table->unsignedBigInteger('transaction_id')->unique()->nullable();
            $table->unsignedBigInteger('complainant_id')->nullable();
            $table->string('reason');
            $table->enum('status', ['PENDING', 'RESOLVED', 'DISMISSED'])->default('PENDING');
            $table->text('admin_response')->nullable();
            $table->timestamps();
            
            $table->foreign('transaction_id')->references('transaction_id')->on('transactions');
            $table->foreign('complainant_id')->references('user_id')->on('customers');
        });

        // Create dispute_messages table
        Schema::create('dispute_messages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dispute_id');
            $table->unsignedBigInteger('user_id');
            $table->text('content');
            $table->timestamps();
            
            $table->foreign('dispute_id')->references('dispute_id')->on('disputes');
            $table->foreign('user_id')->references('user_id')->on('users');
        });

        // Create user_verifications table
        Schema::create('user_verifications', function (Blueprint $table) {
            $table->id('uv_id');
            $table->unsignedBigInteger('user_id')->unique();
            $table->string('uv_file');
            $table->enum('status', ['PENDING', 'APPROVED', 'DENIED'])->default('PENDING');
            $table->unsignedBigInteger('reviewed_by');
            $table->timestamp('response_date')->default(now());
            $table->string('denial_reason')->nullable();
            $table->timestamps();
            
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('reviewed_by')->references('user_id')->on('admins');
        });

        // Create business_verifications table
        Schema::create('business_verifications', function (Blueprint $table) {
            $table->id('bv_id');
            $table->unsignedBigInteger('business_id')->unique();
            $table->string('bv_file');
            $table->enum('status', ['PENDING', 'APPROVED', 'DENIED'])->default('PENDING');
            $table->unsignedBigInteger('reviewed_by');
            $table->timestamp('response_date')->default(now());
            $table->string('denial_reason')->nullable();
            $table->timestamps();
            
            $table->foreign('business_id')->references('business_id')->on('businesses');
            $table->foreign('reviewed_by')->references('user_id')->on('admins');
        });

        // Create conversations table
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->boolean('isGroup')->default(false);
            $table->timestamps();
        });

        // Create conversation_participants table
        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('conversationId');
            $table->unsignedBigInteger('userId');
            $table->timestamp('joinedAt')->default(now());
            $table->timestamp('lastSeen')->default(now());
            $table->timestamps();
            
            $table->unique(['conversationId', 'userId']);
            $table->foreign('conversationId')->references('id')->on('conversations');
            $table->foreign('userId')->references('user_id')->on('users');
        });

        // Create messages table
        Schema::create('messages', function (Blueprint $table) {
            $table->id('message_id');
            $table->text('content');
            $table->timestamp('timestamp')->default(now());
            $table->json('media')->nullable();
            $table->unsignedBigInteger('senderId');
            $table->unsignedBigInteger('recipientId')->nullable();
            $table->unsignedBigInteger('conversationId');
            $table->timestamps();
            
            $table->foreign('senderId')->references('user_id')->on('users');
            $table->foreign('recipientId')->references('user_id')->on('users');
            $table->foreign('conversationId')->references('id')->on('conversations');
        });

        // Create read_receipts table
        Schema::create('read_receipts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('messageId');
            $table->unsignedBigInteger('userId');
            $table->timestamp('readAt')->default(now());
            $table->timestamps();
            
            $table->unique(['messageId', 'userId']);
            $table->foreign('messageId')->references('message_id')->on('messages');
            $table->foreign('userId')->references('user_id')->on('users');
        });

        // Create notifications table
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('userId');
            $table->enum('type', ['MESSAGE', 'TRANSACTION', 'DISPUTE', 'VERIFICATION', 'REVIEW', 'SYSTEM']);
            $table->string('title');
            $table->text('content');
            $table->boolean('isRead')->default(false);
            $table->json('data')->nullable();
            $table->timestamp('createdAt')->default(now());
            $table->timestamp('readAt')->nullable();
            $table->timestamps();
            
            $table->foreign('userId')->references('user_id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop tables in reverse order to avoid foreign key conflicts
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('read_receipts');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversation_participants');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('business_verifications');
        Schema::dropIfExists('user_verifications');
        Schema::dropIfExists('dispute_messages');
        Schema::dropIfExists('disputes');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('sellables');
        Schema::dropIfExists('saved_businesses');
        Schema::dropIfExists('businesses');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('business_owners');
        Schema::dropIfExists('admins');
        
        // Drop enum types
        DB::statement("DROP TYPE IF EXISTS user_type");
        DB::statement("DROP TYPE IF EXISTS user_auth");
        DB::statement("DROP TYPE IF EXISTS sellable_type");
        DB::statement("DROP TYPE IF EXISTS dispute_status");
        DB::statement("DROP TYPE IF EXISTS transaction_status");
        DB::statement("DROP TYPE IF EXISTS verif_status");
        DB::statement("DROP TYPE IF EXISTS notification_type");
    }
}; 