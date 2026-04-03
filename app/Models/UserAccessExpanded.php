<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAccessExpanded extends Model
{
    protected $fillable = [
        'user_id',
        'region_id',
        'product_group_id',
        'customer_group_id',
        'report_id',
        'access_allowed',
    ];

    protected $casts = ['access_allowed' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
