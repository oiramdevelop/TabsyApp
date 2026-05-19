<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resena;
use App\Models\Reserva;
use Illuminate\Http\Request;

class ResenaController extends Controller
{
    // Público: reseñas de un bar con rating promedio
    public function porBar($barId)
    {
        $resenas = Resena::where('bar_id', $barId)
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->get();

        $promedio = $resenas->avg('rating');

        return response()->json([
            'promedio' => $promedio ? round($promedio, 1) : null,
            'total'    => $resenas->count(),
            'resenas'  => $resenas,
        ]);
    }

    // Cliente autenticado: crear o actualizar reseña (solo si tiene reserva confirmada)
    public function store(Request $request)
    {
        $data = $request->validate([
            'bar_id'     => 'required|exists:bares,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comentario' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Verificar que el usuario tiene al menos una reserva confirmada en ese bar
        $tieneReserva = Reserva::where('user_id', $user->id)
            ->where('bar_id', $data['bar_id'])
            ->where('estado', 'confirmada')
            ->exists();

        if (!$tieneReserva) {
            return response()->json([
                'message' => 'Solo puedes reseñar bares donde hayas tenido una reserva confirmada.'
            ], 403);
        }

        $resena = Resena::updateOrCreate(
            ['bar_id' => $data['bar_id'], 'user_id' => $user->id],
            ['rating' => $data['rating'], 'comentario' => $data['comentario'] ?? null]
        );

        return response()->json($resena, 201);
    }

    // Cliente: eliminar su propia reseña
    public function destroy(Request $request, Resena $resena)
    {
        if ($resena->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }
        $resena->delete();
        return response()->json(['message' => 'Reseña eliminada.']);
    }
}
