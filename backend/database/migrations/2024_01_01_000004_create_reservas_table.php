<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('nombre_invitado')->nullable();
            $table->string('email_invitado')->nullable();
            $table->string('telefono_invitado')->nullable();
            $table->foreignId('mesa_id')->constrained('mesas')->cascadeOnDelete();
            $table->foreignId('bar_id')->constrained('bares')->cascadeOnDelete();
            $table->date('fecha');
            $table->time('hora');
            $table->integer('num_personas');
            $table->enum('estado', ['pendiente', 'confirmada', 'cancelada', 'rechazada'])->default('pendiente');
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
    }
};
