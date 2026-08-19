<?php

namespace Tests\Feature;

use App\Models\Bar;
use App\Models\Mesa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MesaTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_bar_admin_no_puede_editar_mesa_de_otro_bar(): void
    {
        $barA = Bar::create(['nombre' => 'Bar A', 'direccion' => 'Calle A', 'ciudad' => 'Cadiz']);
        $barB = Bar::create(['nombre' => 'Bar B', 'direccion' => 'Calle B', 'ciudad' => 'Cadiz']);

        $adminA = User::create([
            'name' => 'Admin A', 'email' => 'admina@test.com', 'password' => 'secret123',
            'role' => 'bar_admin', 'bar_id' => $barA->id,
        ]);
        $adminA->bares()->sync([$barA->id]);

        $mesaDeB = Mesa::create(['bar_id' => $barB->id, 'numero' => '1', 'capacidad' => 4, 'ubicacion' => 'interior']);

        $this->actingAs($adminA)
            ->putJson("/api/bares/{$barA->id}/mesas/{$mesaDeB->id}", ['numero' => 'hackeada'])
            ->assertStatus(404);

        $this->assertSame('1', $mesaDeB->fresh()->numero);
    }

    public function test_bar_admin_si_puede_editar_mesa_de_su_propio_bar(): void
    {
        $bar = Bar::create(['nombre' => 'Bar A', 'direccion' => 'Calle A', 'ciudad' => 'Cadiz']);

        $admin = User::create([
            'name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret123',
            'role' => 'bar_admin', 'bar_id' => $bar->id,
        ]);
        $admin->bares()->sync([$bar->id]);

        $mesa = Mesa::create(['bar_id' => $bar->id, 'numero' => '1', 'capacidad' => 4, 'ubicacion' => 'interior']);

        $this->actingAs($admin)
            ->putJson("/api/bares/{$bar->id}/mesas/{$mesa->id}", ['numero' => '2'])
            ->assertStatus(200);

        $this->assertSame('2', $mesa->fresh()->numero);
    }
}
