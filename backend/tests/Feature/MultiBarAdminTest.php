<?php

namespace Tests\Feature;

use App\Models\Bar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MultiBarAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_bar_admin_con_dos_bares_puede_gestionar_ambos(): void
    {
        $barA = Bar::create(['nombre' => 'Bar A', 'direccion' => 'Calle A', 'ciudad' => 'Cadiz']);
        $barB = Bar::create(['nombre' => 'Bar B', 'direccion' => 'Calle B', 'ciudad' => 'Cadiz']);

        $admin = User::create([
            'name' => 'Admin Multi', 'email' => 'admin.multi@test.com', 'password' => 'secret123',
            'role' => 'bar_admin', 'bar_id' => $barA->id,
        ]);
        $admin->bares()->sync([$barA->id, $barB->id]);

        $this->actingAs($admin)
            ->postJson("/api/bares/{$barA->id}/mesas", ['numero' => '1', 'capacidad' => 4, 'ubicacion' => 'interior'])
            ->assertStatus(201);

        $this->actingAs($admin)
            ->postJson("/api/bares/{$barB->id}/mesas", ['numero' => '1', 'capacidad' => 4, 'ubicacion' => 'interior'])
            ->assertStatus(201);
    }

    public function test_superadmin_puede_asignar_varios_bares_a_un_bar_admin(): void
    {
        $superadmin = User::create([
            'name' => 'Super', 'email' => 'super@test.com', 'password' => 'secret123', 'role' => 'superadmin',
        ]);
        $barA = Bar::create(['nombre' => 'Bar A', 'direccion' => 'Calle A', 'ciudad' => 'Cadiz']);
        $barB = Bar::create(['nombre' => 'Bar B', 'direccion' => 'Calle B', 'ciudad' => 'Cadiz']);
        $admin = User::create([
            'name' => 'Admin', 'email' => 'admin@test.com', 'password' => 'secret123',
            'role' => 'bar_admin', 'bar_id' => $barA->id,
        ]);
        $admin->bares()->sync([$barA->id]);

        $this->actingAs($superadmin)
            ->putJson("/api/usuarios/{$admin->id}", ['bares' => [$barA->id, $barB->id]])
            ->assertStatus(200);

        $this->assertCount(2, $admin->bares()->get());
    }
}
