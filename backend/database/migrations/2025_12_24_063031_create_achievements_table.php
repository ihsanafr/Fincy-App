<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g., 'first_module', 'perfect_score', 'week_streak'
            $table->string('name');
            $table->text('description');
            $table->string('icon')->default('🏆'); // Emoji or icon name
            $table->string('color')->default('#6366f1'); // Badge color
            $table->enum('type', ['module', 'quiz', 'streak', 'certificate', 'special'])->default('module');
            $table->integer('requirement')->default(1); // e.g., 5 modules, 7 day streak
            $table->integer('points')->default(10); // Points awarded
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('achievements');
    }
};
