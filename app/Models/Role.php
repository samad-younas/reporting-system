<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['role_name', 'description', 'is_system_role', 'is_active'];

    protected $casts = [
        'is_system_role' => 'boolean',
        'is_active'      => 'boolean',
    ];

    public function permissions()
    {
        return $this->hasMany(RolePermission::class, 'role_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_roles', 'role_id', 'user_id')
                    ->withPivot('start_date', 'end_date')
                    ->withTimestamps();
    }

    public function reportAccess()
    {
        return $this->hasMany(RoleReportAccess::class, 'role_id');
    }

    /**
     * Get all permission keys for this role as a flat array.
     */
    public function getPermissionKeysAttribute(): array
    {
        return $this->permissions()
                    ->where('is_allowed', true)
                    ->pluck('permission_key')
                    ->toArray();
    }
}
