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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('display_name')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // Auth
            $table->enum('auth_type', ['internal', 'mfa', 'entra_id', 'saml', 'oidc'])->default('internal');
            $table->boolean('is_mfa_enabled')->default(false);
            $table->string('mfa_secret')->nullable(); // TOTP secret (encrypted)
            $table->boolean('mfa_confirmed')->default(false);

            // Optional ERP/Sales Rep link
            $table->string('sales_rep_id')->nullable();

            // Visibility flags (cost, margin etc.)
            // stored as JSON: {"see_cost": false, "see_gp": false, "see_margin": false}
            $table->json('visibility_flags')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
