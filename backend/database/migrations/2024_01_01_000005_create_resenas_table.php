<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('resenas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bar_id')->constrained('bares')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');          // 1–5 estrellas
            $table->text('comentario')->nullable();
            $table->timestamps();

            // Un usuario solo puede reseñar un bar una vez
            $table->unique(['bar_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resenas');
    }
};
