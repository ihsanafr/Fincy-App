<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    const TYPE_INCOME = 'income';
    const TYPE_EXPENSE = 'expense';

    protected $fillable = [
        'user_id',
        'category_id',
        'type',
        'amount',
        'description',
        'transaction_date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function isIncome()
    {
        return $this->type === self::TYPE_INCOME;
    }

    public function isExpense()
    {
        return $this->type === self::TYPE_EXPENSE;
    }
}

