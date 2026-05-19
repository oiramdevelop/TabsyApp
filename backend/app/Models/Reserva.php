<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'mesa_id', 'bar_id',
        'fecha', 'hora', 'num_personas', 'estado', 'notas',
        'nombre_invitado', 'email_invitado', 'telefono_invitado',
    ];

    public function user()  { return $this->belongsTo(User::class); }
    public function mesa()  { return $this->belongsTo(Mesa::class, 'mesa_id'); }
    public function bar()   { return $this->belongsTo(Bar::class, 'bar_id'); }
}