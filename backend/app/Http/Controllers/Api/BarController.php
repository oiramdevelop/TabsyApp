<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bar;
use App\Models\Reserva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BarController extends Controller
{
    // Público: lista bares activos con rating promedio
    public function index()
    {
        $bares = Bar::where('activo', true)
            ->withAvg('resenas', 'rating')
            ->withCount('resenas')
            ->get()
            ->map(function ($bar) {
                $bar->rating_promedio = $bar->resenas_avg_rating
                    ? round((float) $bar->resenas_avg_rating, 1)
                    : null;
                $bar->total_resenas = $bar->resenas_count;
                return $bar;
            });

        return response()->json($bares);
    }

    // Público: detalle de un bar con reseñas
    public function show(Bar $bar)
    {
        $bar->load(['mesas', 'resenas.user:id,name']);
        $bar->rating_promedio = $bar->getRatingPromedioAttribute();
        return response()->json($bar);
    }

    // BarAdmin / SuperAdmin: estadísticas del bar
    public function stats(Request $request, $barId)
    {
        $bar = Bar::findOrFail($barId);
        $this->authorize('manage', $bar);

        $reservas = Reserva::where('bar_id', $barId)->with('user')->get();

        return response()->json([
            'total'           => $reservas->count(),
            'pendientes'      => $reservas->where('estado', 'pendiente')->count(),
            'confirmadas'     => $reservas->where('estado', 'confirmada')->count(),
            'canceladas'      => $reservas->where('estado', 'cancelada')->count(),
            'rechazadas'      => $reservas->where('estado', 'rechazada')->count(),
            'clientes_unicos' => $reservas->pluck('user_id')->unique()->count(),
        ]);
    }

    // SuperAdmin: crear bar (acepta imagen_file como fichero binario o imagen como URL)
    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'           => 'required|string|max:255',
            'direccion'        => 'required|string',
            'ciudad'           => 'required|string',
            'telefono'         => 'nullable|string',
            'descripcion'      => 'nullable|string',
            'horario_apertura' => 'nullable|string',
            'horario_cierre'   => 'nullable|string',
            'imagen'           => 'nullable|string',
            'imagen_file'      => 'nullable|image|max:4096',
            'google_place_id'  => 'nullable|string',
        ]);

        if ($request->hasFile('imagen_file')) {
            $data['imagen'] = $this->guardarImagen($request->file('imagen_file'));
        }

        unset($data['imagen_file']);
        $bar = Bar::create($data);
        return response()->json($bar, 201);
    }

    // SuperAdmin / BarAdmin (solo su bar): editar bar
    public function update(Request $request, Bar $bar)
    {
        $this->authorize('manage', $bar);

        $data = $request->validate([
            'nombre'           => 'sometimes|string|max:255',
            'direccion'        => 'sometimes|string',
            'ciudad'           => 'sometimes|string',
            'telefono'         => 'nullable|string',
            'descripcion'      => 'nullable|string',
            'horario_apertura' => 'nullable|string',
            'horario_cierre'   => 'nullable|string',
            'imagen'           => 'nullable|string',
            'imagen_file'      => 'nullable|image|max:4096',
            'activo'           => 'sometimes|boolean',
            'google_place_id'  => 'nullable|string',
        ]);

        if ($request->hasFile('imagen_file')) {
            // Borrar imagen anterior si era un fichero local
            if ($bar->imagen && str_starts_with($bar->imagen, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $bar->imagen));
            }
            $data['imagen'] = $this->guardarImagen($request->file('imagen_file'));
        }

        unset($data['imagen_file']);
        $bar->update($data);
        return response()->json($bar);
    }

    // SuperAdmin: borrar bar (también borra la imagen del disco)
    public function destroy(Bar $bar)
    {
        if ($bar->imagen && str_starts_with($bar->imagen, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $bar->imagen));
        }
        $bar->delete();
        return response()->json(['message' => 'Bar eliminado.']);
    }

    // ─── Helper ────────────────────────────────────────────────────────────────

    /**
     * Guarda el fichero en storage/app/public/bares/ y devuelve la URL pública.
     * Requiere: php artisan storage:link  (crea public/storage → storage/app/public)
     * El navegador accede a la imagen como: http://host/storage/bares/nombre.jpg
     */
    private function guardarImagen($file): string
    {
        $path = $file->store('bares', 'public');  // → storage/app/public/bares/uuid.jpg
        return '/storage/' . $path;               // → /storage/bares/uuid.jpg
    }
}
