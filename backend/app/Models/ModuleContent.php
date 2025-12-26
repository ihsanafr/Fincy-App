<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModuleContent extends Model
{
    use HasFactory;

    const TYPE_VIDEO = 'video';
    const TYPE_TEXT = 'text';

    protected $fillable = [
        'module_id',
        'type',
        'title',
        'content',
        'youtube_url',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function isVideo()
    {
        return $this->type === self::TYPE_VIDEO;
    }

    public function isText()
    {
        return $this->type === self::TYPE_TEXT;
    }
}


