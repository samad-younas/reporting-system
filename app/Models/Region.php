<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = ['region_name', 'parent_region_id', 'region_type', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function parent()
    {
        return $this->belongsTo(Region::class, 'parent_region_id');
    }

    public function children()
    {
        return $this->hasMany(Region::class, 'parent_region_id');
    }
}
