<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bar;
use App\Models\Mesa;
use Illuminate\Http\Request;

class MesaController extends Controller
{
    // Público: mesas de un bar (con disponibilidad si se pasa fecha/hora)
    // Admins autenticados ven también las mesas desactivadas
    public function index(Request $request, Bar $bar)
    {
        $user    = $request->user();
        $isAdmin = $user && ($user->isSuperAdmin() || ($user->isBarAdmin() && $user->bar_id === $bar->id));

        $query = $bar->mesas();
        if (!$isAdmin) {
            $query->where('activa', true);
        }
        $mesas = $query->orderBy('activa', 'desc')->orderBy('numero')->get();

        if ($request->has('fecha') && $request->has('hora')) {
            $mesas = $mesas->map(function ($mesa) use ($request) {
                $mesa->disponible = $mesa->disponibleEn($request->fecha, $request->hora);
                return $mesa;
            });
        }

        return response()->json($mesas);
    }

    // SuperAdmin / BarAdmin: crear mesa
    public function store(Request $request, Bar $bar)
    {
        $this->authorize('manage', $bar);

        $limite = $bar->plan?->max_mesas;
        if ($limite !== null && $bar->mesas()->count() >= $limite) {
            return response()->json([
                'error' => "Has alcanzado el límite de {$limite} mesas de tu plan {$bar->plan->etiqueta}. Pásate a Pro para añadir más.",
            ], 402);
        }

        $data = $request->validate([
            'numero'    => 'required|string',
            'capacidad' => 'required|integer|min:1',
            'ubicacion' => 'required|in:interior,terraza,barra',
        ]);

        $mesa = $bar->mesas()->create($data);
        return response()->json($mesa, 201);
    }

    // SuperAdmin / BarAdmin: editar mesa
    public function update(Request $request, Bar $bar, Mesa $mesa)
    {
        $this->authorize('manage', $bar);
        abort_unless($mesa->bar_id === $bar->id, 404);

        $data = $request->validate([
            'numero'    => 'sometimes|string',
            'capacidad' => 'sometimes|integer|min:1',
            'ubicacion' => 'sometimes|in:interior,terraza,barra',
            'activa'    => 'sometimes|boolean',
        ]);

        $mesa->update($data);
        return response()->json($mesa);
    }

    // SuperAdmin / BarAdmin: borrar mesa
    public function destroy(Request $request, Bar $bar, Mesa $mesa)
    {
        $this->authorize('manage', $bar);
        abort_unless($mesa->bar_id === $bar->id, 404);

        $mesa->delete();
        return response()->json(['message' => 'Mesa eliminada.']);
    }
}