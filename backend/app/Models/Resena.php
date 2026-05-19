<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resena extends Model
{
    protected $table = 'resenas';

    protected $fillable = ['bar_id', 'user_id', 'rating', 'comentario'];

    public function bar()  { return $this->belongsTo(Bar::class, 'bar_id'); }
    public function user() { return $this->belongsTo(User::class, 'user_id'); }
}
