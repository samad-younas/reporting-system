<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
