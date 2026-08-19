<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('planes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre')->unique();       // 'free' | 'pro'
            $table->string('etiqueta');                // 'Free' | 'Pro'
            $table->unsignedInteger('max_mesas')->nullable(); // null = ilimitado
            $table->boolean('acceso_estadisticas')->default(false);
            $table->decimal('precio_mensual', 8, 2)->default(0);
            $table->timestamps();
        });

        DB::table('planes')->insert([
            [
                'nombre' => 'free', 'etiqueta' => 'Free',
                'max_mesas' => 5, 'acceso_estadisticas' => false, 'precio_mensual' => 0,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'nombre' => 'pro', 'etiqueta' => 'Pro',
                'max_mesas' => null, 'acceso_estadisticas' => true, 'precio_mensual' => 29,
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('planes');
    }
};
