<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('module_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('module_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->default(5); // 1-5 stars
            $table->text('review')->nullable(); // Optional review/comment
            $table->timestamps();

            // Ensure one rating per user per module
            $table->unique(['user_id', 'module_id']);
            
            // Index for faster queries
            $table->index('module_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('module_ratings');
    }
};

