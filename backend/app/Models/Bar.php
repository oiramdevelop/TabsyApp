<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bar extends Model
{
    use HasFactory;

    protected $table = 'bares';

    protected $fillable = [
        'nombre', 'direccion', 'ciudad', 'telefono',
        'imagen', 'descripcion', 'horario_apertura', 'horario_cierre', 'activo',
        'google_place_id',
    ];

    protected $casts = ['activo' => 'boolean'];

    public function mesas()    { return $this->hasMany(Mesa::class, 'bar_id'); }
    public function reservas() { return $this->hasMany(Reserva::class, 'bar_id'); }
    public function admins()   { return $this->belongsToMany(User::class, 'bar_user')->where('role', 'bar_admin'); }
    public function resenas()  { return $this->hasMany(Resena::class, 'bar_id'); }

    public function getRatingPromedioAttribute(): ?float
    {
        $avg = $this->resenas()->avg('rating');
        return $avg ? round((float) $avg, 1) : null;
    }
}