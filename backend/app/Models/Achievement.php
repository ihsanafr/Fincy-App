<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'description',
        'icon',
        'color',
        'type',
        'requirement',
        'points',
        'is_active',
    ];

    protected $casts = [
        'requirement' => 'integer',
        'points' => 'integer',
        'is_active' => 'boolean',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
            ->withPivot('unlocked_at')
            ->withTimestamps();
    }
}

