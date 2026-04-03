<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityMapping extends Model
{
    protected $fillable = ['user_id', 'region_id', 'product_group_id', 'customer_group_id', 'is_allow'];

    protected $casts = ['is_allow' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }
    public function region() { return $this->belongsTo(Region::class); }
    public function productGroup() { return $this->belongsTo(ProductGroup::class); }
    public function customerGroup() { return $this->belongsTo(CustomerGroup::class); }
}
