<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bares', function (Blueprint $table) {
            $table->foreignId('plan_id')->nullable()->after('activo')->constrained('planes')->nullOnDelete();
        });

        $freeId = DB::table('planes')->where('nombre', 'free')->value('id');
        if ($freeId) {
            DB::table('bares')->whereNull('plan_id')->update(['plan_id' => $freeId]);
        }
    }

    public function down(): void
    {
        Schema::table('bares', function (Blueprint $table) {
            $table->dropConstrainedForeignId('plan_id');
        });
    }
};
