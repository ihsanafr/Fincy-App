<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@fincy.com',
            'password' => Hash::make('admin123'),
            'role' => User::ROLE_SUPER_ADMIN,
        ]);
    }
}

