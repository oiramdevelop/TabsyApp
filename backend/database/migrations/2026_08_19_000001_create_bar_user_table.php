<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bar_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bar_id')->constrained('bares')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['bar_id', 'user_id']);
        });

        // Backfill: los bar_admin existentes ya tienen un bar asignado vía users.bar_id
        DB::table('users')
            ->where('role', 'bar_admin')
            ->whereNotNull('bar_id')
            ->get(['id', 'bar_id'])
            ->each(function ($u) {
                DB::table('bar_user')->insert([
                    'bar_id'     => $u->bar_id,
                    'user_id'    => $u->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('bar_user');
    }
};
