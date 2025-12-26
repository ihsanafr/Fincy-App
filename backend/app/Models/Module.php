<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'order',
        'is_active',
        'thumbnail',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    public function contents()
    {
        return $this->hasMany(ModuleContent::class)->orderBy('order');
    }

    public function quiz()
    {
        return $this->hasOne(Quiz::class);
    }

    public function progress()
    {
        return $this->hasMany(ModuleProgress::class);
    }

    public function ratings()
    {
        return $this->hasMany(ModuleRating::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(ModuleBookmark::class);
    }
}


