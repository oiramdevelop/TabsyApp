<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('mesas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bar_id')->constrained('bares')->cascadeOnDelete();
            $table->string('numero'); // "Mesa 1", "Terraza A", etc.
            $table->integer('capacidad');
            $table->enum('ubicacion', ['interior', 'terraza', 'barra'])->default('interior');
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mesas');
    }
};
