<?php

namespace Tests\Feature;

use App\Models\Bar;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MesaPlanLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_puede_crear_mas_mesas_que_el_limite_de_su_plan_free(): void
    {
        $free = Plan::where('nombre', 'free')->firstOrFail();
        $bar  = Bar::create(['nombre' => 'Bar A', 'direccion' => 'Calle A', 'ciudad' => 'Cadiz', 'plan_id' => $free->id]);
        $admin = User::create([
            'name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret123',
            'role' => 'bar_admin', 'bar_id' => $bar->id,
        ]);
        $admin->bares()->sync([$bar->id]);

        for ($i = 1; $i <= $free->max_mesas; $i++) {
            $bar->mesas()->create(['numero' => (string) $i, 'capacidad' => 4, 'ubicacion' => 'interior']);
        }

        $this->actingAs($admin)
            ->postJson("/api/bares/{$bar->id}/mesas", ['numero' => 'extra', 'capacidad' => 4, 'ubicacion' => 'interior'])
            ->assertStatus(402);

        $this->assertSame($free->max_mesas, $bar->mesas()->count());
    }

    public function test_plan_pro_no_tiene_limite_de_mesas(): void
    {
        $pro = Plan::where('nombre', 'pro')->firstOrFail();
        $bar = Bar::create(['nombre' => 'Bar B', 'direccion' => 'Calle B', 'ciudad' => 'Cadiz', 'plan_id' => $pro->id]);
        $admin = User::create([
            'name' => 'Admin', 'email' => 'admin2@test.com', 'password' => 'secret123',
            'role' => 'bar_admin', 'bar_id' => $bar->id,
        ]);
        $admin->bares()->sync([$bar->id]);

        for ($i = 1; $i <= 6; $i++) {
            $bar->mesas()->create(['numero' => (string) $i, 'capacidad' => 4, 'ubicacion' => 'interior']);
        }

        $this->actingAs($admin)
            ->postJson("/api/bares/{$bar->id}/mesas", ['numero' => 'extra', 'capacidad' => 4, 'ubicacion' => 'interior'])
            ->assertStatus(201);
    }
}
