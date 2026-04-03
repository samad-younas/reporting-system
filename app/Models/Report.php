<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'report_name',
        'report_path',
        'main_category',
        'sub_category',
        'report_type',
        'image_path',
        'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_report_access', 'report_id', 'role_id')
                    ->withPivot('access_type');
    }

    public function favouritedBy()
    {
        return $this->belongsToMany(User::class, 'favourite_reports', 'report_id', 'user_id');
    }
}
