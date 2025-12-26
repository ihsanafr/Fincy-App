<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EducatorSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'educator@fincy.com'],
            [
                'name' => 'Educator',
                'password' => Hash::make('educator123'),
                'role' => User::ROLE_EDUCATOR,
            ]
        );
    }
}


