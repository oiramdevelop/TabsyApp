<?php

namespace Database\Seeders;

use App\Models\Bar;
use App\Models\Mesa;
use App\Models\Plan;
use App\Models\Reserva;
use App\Models\Resena;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── USUARIOS ────────────────────────────────────────────────────────────

        User::create([
            'name'     => 'Mario Admin',
            'email'    => 'admin@tabsy.com',
            'password' => Hash::make('password123'),
            'role'     => 'superadmin',
            'email_verified_at'  => now(),
        ]);

        $clientes = [
            User::create(['name' => 'Ana García',    'email' => 'ana@tabsy.com',    'password' => Hash::make('password123'), 'role' => 'cliente', 'email_verified_at' => now()]),
            User::create(['name' => 'Carlos Ruiz',   'email' => 'carlos@tabsy.com', 'password' => Hash::make('password123'), 'role' => 'cliente', 'email_verified_at' => now()]),
            User::create(['name' => 'Lucía Moreno',  'email' => 'lucia@tabsy.com',  'password' => Hash::make('password123'), 'role' => 'cliente', 'email_verified_at' => now()]),
            User::create(['name' => 'Pedro Sánchez', 'email' => 'pedro@tabsy.com',  'password' => Hash::make('password123'), 'role' => 'cliente', 'email_verified_at' => now()]),
            User::create(['name' => 'María Jiménez', 'email' => 'maria@tabsy.com',  'password' => Hash::make('password123'), 'role' => 'cliente', 'email_verified_at' => now()]),
        ];

        // ── BARES ───────────────────────────────────────────────────────────────
        // Las imágenes usan picsum.photos con seed fijo: siempre la misma foto.
        // Cuando el admin suba una imagen real desde el panel, se guarda en
        // storage/app/public/bares/ y la BD almacena "/storage/bares/uuid.jpg".

        $baresData = [
            ['nombre' => 'Bar El Rincón Gaditano',   'direccion' => 'Calle Larga, 24',           'ciudad' => 'Cádiz',                  'telefono' => '956 210 345', 'horario_apertura' => '10:00', 'horario_cierre' => '00:00', 'imagen' => 'https://picsum.photos/seed/cadizbar/800/500',    'descripcion' => 'Bar de tapas tradicional en el corazón del casco histórico de Cádiz. Especialidad en langostinos de Sanlúcar y vinos de la tierra.'],
            ['nombre' => 'La Taberna del Puerto',    'direccion' => 'Paseo Marítimo, 8',         'ciudad' => 'El Puerto de Santa María','telefono' => '956 873 210', 'horario_apertura' => '12:00', 'horario_cierre' => '23:30','imagen' => 'https://picsum.photos/seed/puertobar/800/500',   'descripcion' => 'Taberna con vistas al Guadalquivir. Los mejores chipirones y tortillitas de camarones de la bahía.'],
            ['nombre' => 'Bar Los Caracoles',        'direccion' => 'Calle Sierpes, 42',         'ciudad' => 'Sevilla',                'telefono' => '954 221 890', 'horario_apertura' => '09:00', 'horario_cierre' => '01:00', 'imagen' => 'https://picsum.photos/seed/sevillabar/800/500',  'descripcion' => 'Clásico sevillano desde 1952. Tapas de autor, flamenco en vivo los viernes y la mejor selección de manzanilla.'],
            ['nombre' => 'El Patio Andaluz',         'direccion' => 'Plaza de la Asunción, 3',   'ciudad' => 'Jerez de la Frontera',   'telefono' => '956 341 200', 'horario_apertura' => '11:00', 'horario_cierre' => '23:00', 'imagen' => 'https://picsum.photos/seed/jerezbar/800/500',    'descripcion' => 'Bar con patio típico andaluz. Degustación de vinos de Jerez, montaditos de jamón ibérico y queso payoyo.'],
            ['nombre' => 'Bar La Viña',              'direccion' => 'Bajo de Guía, 15',          'ciudad' => 'Sanlúcar de Barrameda',  'telefono' => '956 360 512', 'horario_apertura' => '10:00', 'horario_cierre' => '00:00', 'imagen' => 'https://picsum.photos/seed/sanlucarbar/800/500', 'descripcion' => 'Frente al Parque Nacional de Doñana. Los mejores langostinos hervidos de Sanlúcar y manzanilla en rama.'],
            ['nombre' => 'Bodega El Maestro',        'direccion' => 'Calle Misericordia, 6',     'ciudad' => 'Sanlúcar de Barrameda',  'telefono' => '956 361 080', 'horario_apertura' => '09:00', 'horario_cierre' => '22:00', 'imagen' => 'https://picsum.photos/seed/bodegabar/800/500',  'descripcion' => 'Bodega centenaria con soleras de más de 80 años. Vinos en rama directamente de la bota y tapas caseras.'],
            ['nombre' => 'Bar La Gitana',            'direccion' => 'Avenida del Ejército, 12',  'ciudad' => 'Chipiona',               'telefono' => '956 372 400', 'horario_apertura' => '10:00', 'horario_cierre' => '23:30','imagen' => 'https://picsum.photos/seed/chipionabar/800/500', 'descripcion' => 'Bar familiar a 100 metros de la playa de Regla. Especialidad en pescaíto frito, gambas al pil-pil y cañas bien frías.'],
        ];

        $freePlanId = Plan::where('nombre', 'free')->value('id');
        $bares = array_map(fn($d) => Bar::create([...$d, 'plan_id' => $freePlanId]), $baresData);

        // ── ADMINS DE BAR ───────────────────────────────────────────────────────

        User::create(['name' => 'Admin Rincón',    'email' => 'admin.rincon@tabsy.com',   'password' => Hash::make('password123'), 'role' => 'bar_admin', 'bar_id' => $bares[0]->id, 'email_verified_at' => now()]);
        User::create(['name' => 'Admin Puerto',    'email' => 'admin.puerto@tabsy.com',   'password' => Hash::make('password123'), 'role' => 'bar_admin', 'bar_id' => $bares[1]->id, 'email_verified_at' => now()]);
        User::create(['name' => 'Admin Caracoles', 'email' => 'admin.caracoles@tabsy.com','password' => Hash::make('password123'), 'role' => 'bar_admin', 'bar_id' => $bares[2]->id, 'email_verified_at' => now()]);

        // ── MESAS ───────────────────────────────────────────────────────────────

        $mesasPorBar = [
            [['Mesa 1',2,'interior'],['Mesa 2',4,'interior'],['Mesa 3',4,'interior'],['Mesa 4',6,'terraza'],['Mesa 5',2,'terraza'],['Barra 1',2,'barra']],
            [['Mesa 1',2,'interior'],['Mesa 2',4,'interior'],['Mesa 3',6,'interior'],['Terraza 1',4,'terraza'],['Terraza 2',6,'terraza'],['Barra 1',3,'barra']],
            [['Mesa 1',2,'interior'],['Mesa 2',4,'interior'],['Mesa 3',4,'interior'],['Mesa 4',8,'interior'],['Patio 1',4,'terraza'],['Patio 2',6,'terraza'],['Barra 1',2,'barra']],
            [['Mesa 1',4,'interior'],['Mesa 2',4,'interior'],['Patio 1',6,'terraza'],['Patio 2',4,'terraza'],['Barra 1',2,'barra']],
            [['Mesa 1',2,'interior'],['Mesa 2',4,'interior'],['Mesa 3',4,'terraza'],['Mesa 4',6,'terraza'],['Barra 1',2,'barra'],['Barra 2',2,'barra']],
            [['Mesa 1',2,'interior'],['Mesa 2',4,'interior'],['Mesa 3',4,'interior'],['Barra 1',2,'barra'],['Barra 2',2,'barra']],
            [['Mesa 1',4,'interior'],['Mesa 2',4,'interior'],['Terraza 1',6,'terraza'],['Terraza 2',4,'terraza'],['Barra 1',2,'barra']],
        ];

        $mesas = [];
        foreach ($bares as $i => $bar) {
            $mesas[$i] = array_map(
                fn($m) => Mesa::create(['bar_id' => $bar->id, 'numero' => $m[0], 'capacidad' => $m[1], 'ubicacion' => $m[2]]),
                $mesasPorBar[$i]
            );
        }

        // ── RESERVAS DEMO ───────────────────────────────────────────────────────

        $reservas = [
            [$clientes[0]->id, $bares[0]->id, $mesas[0][1]->id, '2026-04-10', '13:00', 4, 'confirmada', null],
            [$clientes[0]->id, $bares[2]->id, $mesas[2][3]->id, '2026-04-12', '21:00', 2, 'confirmada', 'Cumpleaños'],
            [$clientes[1]->id, $bares[0]->id, $mesas[0][2]->id, '2026-04-15', '14:00', 4, 'confirmada', null],
            [$clientes[1]->id, $bares[1]->id, $mesas[1][3]->id, '2026-04-28', '20:30', 6, 'pendiente',  'Terraza si es posible'],
            [$clientes[2]->id, $bares[3]->id, $mesas[3][0]->id, '2026-04-18', '13:30', 2, 'confirmada', null],
            [$clientes[2]->id, $bares[4]->id, $mesas[4][2]->id, '2026-04-30', '21:30', 4, 'pendiente',  null],
            [$clientes[3]->id, $bares[5]->id, $mesas[5][0]->id, '2026-04-08', '11:00', 2, 'confirmada', null],
            [$clientes[3]->id, $bares[2]->id, $mesas[2][1]->id, '2026-05-03', '20:00', 4, 'pendiente',  null],
            [$clientes[4]->id, $bares[6]->id, $mesas[6][2]->id, '2026-04-11', '14:00', 6, 'confirmada', 'Familia con niños'],
            [$clientes[4]->id, $bares[0]->id, $mesas[0][0]->id, '2026-04-19', '21:00', 2, 'rechazada',  null],
            [$clientes[0]->id, $bares[4]->id, $mesas[4][0]->id, '2026-05-05', '13:00', 2, 'pendiente',  null],
            [$clientes[1]->id, $bares[6]->id, $mesas[6][0]->id, '2026-05-06', '14:00', 4, 'pendiente',  null],
        ];

        foreach ($reservas as [$uid, $bid, $mid, $fecha, $hora, $personas, $estado, $notas]) {
            Reserva::create(['user_id' => $uid, 'bar_id' => $bid, 'mesa_id' => $mid, 'fecha' => $fecha, 'hora' => $hora, 'num_personas' => $personas, 'estado' => $estado, 'notas' => $notas]);
        }

        // ── RESEÑAS ─────────────────────────────────────────────────────────────

        $resenas = [
            [$clientes[0]->id, $bares[0]->id, 5, 'Sitio increíble, las tapas son espectaculares. Volveré seguro.'],
            [$clientes[0]->id, $bares[2]->id, 4, 'Muy buen ambiente, aunque tardaron un poco en atendernos.'],
            [$clientes[1]->id, $bares[0]->id, 5, 'Los mejores langostinos que he probado. El servicio, impecable.'],
            [$clientes[2]->id, $bares[3]->id, 4, 'El patio es precioso. Los vinos de Jerez, de 10.'],
            [$clientes[3]->id, $bares[5]->id, 5, 'Una bodega con mucha historia. La manzanilla en rama, única.'],
            [$clientes[4]->id, $bares[6]->id, 4, 'Perfecto para comer con familia. Pescaíto fresquísimo.'],
            [$clientes[1]->id, $bares[1]->id, 3, 'Buena ubicación junto al puerto, pero algo caro para lo que es.'],
            [$clientes[2]->id, $bares[4]->id, 5, 'El Bajo de Guía es mágico. La vista a Doñana mientras comes, impresionante.'],
        ];

        foreach ($resenas as [$uid, $bid, $rating, $comentario]) {
            Resena::create(['user_id' => $uid, 'bar_id' => $bid, 'rating' => $rating, 'comentario' => $comentario]);
        }
    }
}
