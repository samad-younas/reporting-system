<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBuddy extends Model
{
    protected $fillable = ['user_id', 'buddy_user_id', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function buddy()
    {
        return $this->belongsTo(User::class, 'buddy_user_id');
    }
}
