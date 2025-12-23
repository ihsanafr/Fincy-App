<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GenerateUserSlugsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::whereNull('slug')->orWhere('slug', '')->get();

        foreach ($users as $user) {
            $baseSlug = Str::slug($user->name);
            $slug = $baseSlug;
            $counter = 1;

            while (User::where('slug', $slug)->where('id', '!=', $user->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $user->slug = $slug;
            $user->save();
        }

        $this->command->info('Generated slugs for ' . $users->count() . ' users.');
    }
}
