<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('region_name');
            $table->unsignedBigInteger('parent_region_id')->nullable(); // null = top-level (Country)
            $table->string('region_type')->default('region'); // country, region, state, area, branch
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('parent_region_id')->references('id')->on('regions')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};
