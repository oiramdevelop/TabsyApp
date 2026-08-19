<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'planes';

    protected $fillable = ['nombre', 'etiqueta', 'max_mesas', 'acceso_estadisticas', 'precio_mensual'];

    protected $casts = [
        'acceso_estadisticas' => 'boolean',
        'precio_mensual'      => 'decimal:2',
    ];

    public function bares() { return $this->hasMany(Bar::class, 'plan_id'); }
}
