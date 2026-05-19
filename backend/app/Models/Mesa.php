<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    use HasFactory;

    protected $fillable = ['bar_id', 'numero', 'capacidad', 'ubicacion', 'activa'];

    protected $casts = ['activa' => 'boolean'];

    public function bar()      { return $this->belongsTo(Bar::class, 'bar_id'); }
    public function reservas() { return $this->hasMany(Reserva::class, 'mesa_id'); }

    // Comprueba si la mesa está disponible en fecha/hora dada
    public function disponibleEn(string $fecha, string $hora): bool
    {
        return !$this->reservas()
            ->where('fecha', $fecha)
            ->where('hora', $hora)
            ->whereIn('estado', ['pendiente', 'confirmada'])
            ->exists();
    }
}