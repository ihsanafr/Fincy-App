<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class DefaultCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $defaultCategories = [
            // Income Categories
            ['name' => 'Gaji', 'type' => 'income', 'icon' => '💰', 'color' => '#10b981'],
            ['name' => 'Bonus', 'type' => 'income', 'icon' => '🎁', 'color' => '#10b981'],
            ['name' => 'Investasi', 'type' => 'income', 'icon' => '📈', 'color' => '#10b981'],
            ['name' => 'Lainnya (Pemasukan)', 'type' => 'income', 'icon' => '💵', 'color' => '#10b981'],

            // Expense Categories
            ['name' => 'Makanan & Minuman', 'type' => 'expense', 'icon' => '🍔', 'color' => '#ef4444'],
            ['name' => 'Transportasi', 'type' => 'expense', 'icon' => '🚗', 'color' => '#3b82f6'],
            ['name' => 'Belanja', 'type' => 'expense', 'icon' => '🛒', 'color' => '#8b5cf6'],
            ['name' => 'Hiburan', 'type' => 'expense', 'icon' => '🎬', 'color' => '#f59e0b'],
            ['name' => 'Kesehatan', 'type' => 'expense', 'icon' => '🏥', 'color' => '#ec4899'],
            ['name' => 'Pendidikan', 'type' => 'expense', 'icon' => '📚', 'color' => '#06b6d4'],
            ['name' => 'Tagihan', 'type' => 'expense', 'icon' => '💳', 'color' => '#6366f1'],
            ['name' => 'Lainnya (Pengeluaran)', 'type' => 'expense', 'icon' => '📝', 'color' => '#6b7280'],
        ];

        foreach ($defaultCategories as $category) {
            Category::create([
                'user_id' => null,
                'name' => $category['name'],
                'icon' => $category['icon'],
                'color' => $category['color'],
                'type' => $category['type'],
                'is_default' => true,
            ]);
        }
    }
}

