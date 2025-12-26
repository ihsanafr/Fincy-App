<?php

/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode backend.
 * Manfaat: Menjaga logika server tetap terstruktur dan mudah dirawat.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Budget extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'amount',
        'start_date',
        'end_date',
        'period',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getSpentAttribute()
    {
        return $this->category->transactions()
            ->where('user_id', $this->user_id)
            ->where('type', Transaction::TYPE_EXPENSE)
            ->whereBetween('transaction_date', [$this->start_date, $this->end_date])
            ->sum('amount');
    }

    public function getRemainingAttribute()
    {
        return $this->amount - $this->spent;
    }

    public function getPercentageUsedAttribute()
    {
        if ($this->amount == 0) {
            return 0;
        }
        return min(100, ($this->spent / $this->amount) * 100);
    }

    public function isActive()
    {
        $now = Carbon::now();
        return $now->between($this->start_date, $this->end_date);
    }
}


