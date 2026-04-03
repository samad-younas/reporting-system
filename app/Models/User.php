<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'display_name',
        'email',
        'password',
        'auth_type',
        'is_mfa_enabled',
        'mfa_secret',
        'mfa_confirmed',
        'sales_rep_id',
        'visibility_flags',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'mfa_secret',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'password'          => 'hashed',
        'visibility_flags'  => 'array',
        'is_mfa_enabled'    => 'boolean',
        'mfa_confirmed'     => 'boolean',
        'is_active'         => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles', 'user_id', 'role_id')
                    ->withPivot('start_date', 'end_date')
                    ->withTimestamps();
    }

    public function securityMappings()
    {
        return $this->hasMany(SecurityMapping::class, 'user_id');
    }

    public function accessExpanded()
    {
        return $this->hasMany(UserAccessExpanded::class, 'user_id');
    }

    public function buddies()
    {
        return $this->hasMany(UserBuddy::class, 'user_id');
    }

    public function favouriteReports()
    {
        return $this->belongsToMany(Report::class, 'favourite_reports', 'user_id', 'report_id')
                    ->withTimestamps();
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class, 'user_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Get all unique permission keys across all assigned roles.
     */
    public function getAllPermissions(): array
    {
        return $this->roles()
                    ->with('permissions')
                    ->get()
                    ->flatMap(fn($role) => $role->permissions->where('is_allowed', true)->pluck('permission_key'))
                    ->unique()
                    ->values()
                    ->toArray();
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string $key): bool
    {
        return in_array($key, $this->getAllPermissions());
    }

    /**
     * Check if user has a specific role by name.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('role_name', $roleName)->exists();
    }

    /**
     * Check if user is an admin (has roles.manage permission).
     */
    public function isAdmin(): bool
    {
        return $this->hasPermission('roles.manage');
    }
}
