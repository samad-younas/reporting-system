<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerGroup extends Model
{
    protected $fillable = ['customer_group_name', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
