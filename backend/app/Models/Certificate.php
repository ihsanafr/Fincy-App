<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'module_id',
        'certificate_number',
        'issued_at',
        'public_share_token',
        'is_public',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public static function generateCertificateNumber()
    {
        return 'FINCY-' . date('Ymd') . '-' . strtoupper(uniqid());
    }

    public static function generateShareToken()
    {
        return bin2hex(random_bytes(16));
    }

    public function generatePublicLink()
    {
        if (!$this->public_share_token) {
            $this->public_share_token = self::generateShareToken();
            $this->save();
        }
        // Use frontend URL instead of backend URL
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        return "{$frontendUrl}/certificate/public/{$this->public_share_token}";
    }
}

