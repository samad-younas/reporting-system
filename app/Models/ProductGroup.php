<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductGroup extends Model
{
    protected $fillable = ['product_group_name', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
