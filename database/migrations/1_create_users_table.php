<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First drop any existing enum types to avoid conflicts
        DB::statement("DROP TYPE IF EXISTS user_type");
        DB::statement("DROP TYPE IF EXISTS user_auth");
        DB::statement("DROP TYPE IF EXISTS sellable_type");
        DB::statement("DROP TYPE IF EXISTS dispute_status");
        DB::statement("DROP TYPE IF EXISTS transaction_status");
        DB::statement("DROP TYPE IF EXISTS verif_status");
        DB::statement("DROP TYPE IF EXISTS notification_type");

        // Create enum types
        DB::statement("CREATE TYPE user_type AS ENUM ('ADMIN', 'BUSINESSOWNER', 'CUSTOMER')");
        DB::statement("CREATE TYPE user_auth AS ENUM ('GOOGLE', 'EMAIL')");
        DB::statement("CREATE TYPE sellable_type AS ENUM ('PRODUCT', 'SERVICE')");
        DB::statement("CREATE TYPE dispute_status AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED')");
        DB::statement("CREATE TYPE transaction_status AS ENUM ('PENDING', 'INCOMPLETE', 'COMPLETED', 'FINISHED')");
        DB::statement("CREATE TYPE verif_status AS ENUM ('PENDING', 'APPROVED', 'DENIED')");
        DB::statement("CREATE TYPE notification_type AS ENUM ('MESSAGE', 'TRANSACTION', 'DISPUTE', 'VERIFICATION', 'REVIEW', 'SYSTEM')");

        Schema::create('users', function (Blueprint $table) {
            $table->id('user_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique()->nullable();
            $table->string('password')->nullable();
            $table->string('phone_number')->nullable();
            $table->enum('user_type', ['ADMIN', 'BUSINESSOWNER', 'CUSTOMER']);
            $table->enum('user_auth', ['GOOGLE', 'EMAIL']);
            $table->boolean('is_verified')->default(false);
            $table->string('profile_picture')->nullable();
            $table->timestamp('date_registered')->default(now());
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
        
    }
};
