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


class ProductGroup extends Model
{
    protected $fillable = ['product_group_name', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
}


class CustomerGroup extends Model
{
    protected $fillable = ['customer_group_name', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];
}


class RoleReportAccess extends Model
{
    protected $fillable = ['role_id', 'report_id', 'access_type'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }
    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}


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


class UserAccessExpanded extends Model
{
    protected $fillable = ['user_id', 'region_id', 'product_group_id', 'customer_group_id', 'report_id', 'access_allowed'];
    protected $casts = ['access_allowed' => 'boolean'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}


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


class AuditLog extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'action_type', 'action_detail', 'ip_address', 'user_agent', 'duration_ms'];
    protected $casts = ['action_detail' => 'array'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
