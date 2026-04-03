<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'action_type',
        'action_detail',
        'ip_address',
        'user_agent',
        'duration_ms',
    ];

    protected $casts = [
        'action_detail' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
