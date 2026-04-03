<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A user can have multiple roles
        Schema::create('user_roles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->unique(['user_id', 'role_id']);
        });

        // Reports table (referenced by role_report_access)
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_name');
            $table->string('report_path')->nullable();
            $table->string('main_category')->nullable();
            $table->string('sub_category')->nullable();
            $table->string('report_type')->nullable(); // PowerBI, Crystal, SSRS, DevExpress
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Which roles can access which reports
        Schema::create('role_report_access', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('report_id');
            $table->enum('access_type', ['view', 'export', 'print'])->default('view');
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('report_id')->references('id')->on('reports')->onDelete('cascade');
            $table->unique(['role_id', 'report_id', 'access_type']);
        });

        // Core security mapping:
        // Links a user to allowed Region + ProductGroup + CustomerGroup combinations
        // IsAllow = true means ALLOW, false means DENY (for exclusions)
        Schema::create('security_mappings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('region_id')->nullable();       // null = all regions
            $table->unsignedBigInteger('product_group_id')->nullable(); // null = all product groups
            $table->unsignedBigInteger('customer_group_id')->nullable(); // null = all customer groups
            $table->boolean('is_allow')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('region_id')->references('id')->on('regions')->onDelete('set null');
            $table->foreign('product_group_id')->references('id')->on('product_groups')->onDelete('set null');
            $table->foreign('customer_group_id')->references('id')->on('customer_groups')->onDelete('set null');
        });

        // UserBuddy: a user can "act as" or "buddy" another user to access their data
        Schema::create('user_buddies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('buddy_user_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('buddy_user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Pre-calculated security view (populated via job/stored proc)
        // This makes report filtering fast at runtime
        Schema::create('user_access_expanded', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('region_id')->nullable();
            $table->unsignedBigInteger('product_group_id')->nullable();
            $table->unsignedBigInteger('customer_group_id')->nullable();
            $table->unsignedBigInteger('report_id')->nullable();
            $table->boolean('access_allowed')->default(true);
            $table->timestamp('calculated_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Permissions per role (module/feature level - for sidebar UI control)
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->string('permission_key'); // e.g., "users.view", "reports.manage", "admin.settings"
            $table->boolean('is_allowed')->default(true);
            $table->timestamps();

            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->unique(['role_id', 'permission_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('user_access_expanded');
        Schema::dropIfExists('user_buddies');
        Schema::dropIfExists('security_mappings');
        Schema::dropIfExists('role_report_access');
        Schema::dropIfExists('reports');
        Schema::dropIfExists('user_roles');
    }
};
