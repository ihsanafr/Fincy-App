<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('learning_streak')->default(0)->after('banner_color');
            $table->date('last_activity_date')->nullable()->after('learning_streak');
            $table->integer('total_points')->default(0)->after('last_activity_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['learning_streak', 'last_activity_date', 'total_points']);
        });
    }
};
