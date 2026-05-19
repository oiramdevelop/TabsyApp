<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NuevaReservaMail;
use App\Models\Mesa;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ReservaController extends Controller
{
    // Cliente: ver sus reservas
    public function misReservas(Request $request)
    {
        $reservas = $request->user()
            ->reservas()
            ->with(['bar', 'mesa'])
            ->orderByDesc('fecha')
            ->get();

        return response()->json($reservas);
    }

    // Cliente: crear reserva
    public function store(Request $request)
    {
        $data = $request->validate([
            'mesa_id'      => 'required|exists:mesas,id',
            'bar_id'       => 'required|exists:bares,id',
            'fecha'        => 'required|date|after_or_equal:today',
            'hora'         => 'required|date_format:H:i',
            'num_personas' => 'required|integer|min:1',
            'notas'        => 'nullable|string|max:500',
        ]);

        // Verificar disponibilidad
        $mesa = Mesa::findOrFail($data['mesa_id']);
        if (!$mesa->disponibleEn($data['fecha'], $data['hora'])) {
            return response()->json(['error' => 'Mesa no disponible en esa fecha y hora.'], 422);
        }

        // Verificar capacidad
        if ($data['num_personas'] > $mesa->capacidad) {
            return response()->json(['error' => "La mesa solo tiene capacidad para {$mesa->capacidad} personas."], 422);
        }

        $reserva = Reserva::create([
            ...$data,
            'user_id' => $request->user()->id,
            'estado'  => 'pendiente',
        ]);

        $reserva->load(['bar', 'mesa']);
        $this->notificarBarAdmin($reserva);

        return response()->json($reserva, 201);
    }

    // Invitado: reservar sin cuenta
    public function storeGuest(Request $request)
    {
        $data = $request->validate([
            'mesa_id'          => 'required|exists:mesas,id',
            'bar_id'           => 'required|exists:bares,id',
            'fecha'            => 'required|date|after_or_equal:today',
            'hora'             => 'required|date_format:H:i',
            'num_personas'     => 'required|integer|min:1',
            'notas'            => 'nullable|string|max:500',
            'nombre_invitado'  => 'required|string|max:150',
            'email_invitado'   => 'required|email|max:200',
            'telefono_invitado'=> 'required|string|max:30',
        ]);

        $mesa = Mesa::findOrFail($data['mesa_id']);
        if (!$mesa->disponibleEn($data['fecha'], $data['hora'])) {
            return response()->json(['error' => 'Mesa no disponible en esa fecha y hora.'], 422);
        }
        if ($data['num_personas'] > $mesa->capacidad) {
            return response()->json(['error' => "La mesa solo tiene capacidad para {$mesa->capacidad} personas."], 422);
        }

        $reserva = Reserva::create([
            ...$data,
            'user_id' => null,
            'estado'  => 'pendiente',
        ]);

        $reserva->load(['bar', 'mesa']);
        $this->notificarBarAdmin($reserva);

        return response()->json($reserva, 201);
    }

    // Cliente: cancelar su reserva
    public function cancelar(Request $request, Reserva $reserva)
    {
        if ($reserva->user_id !== $request->user()->id) {
            return response()->json(['error' => 'No autorizado.'], 403);
        }

        if (!in_array($reserva->estado, ['pendiente', 'confirmada'])) {
            return response()->json(['error' => 'Esta reserva no se puede cancelar.'], 422);
        }

        $reserva->update(['estado' => 'cancelada']);
        return response()->json($reserva);
    }

    // BarAdmin / SuperAdmin: ver reservas de un bar
    public function porBar(Request $request, $barId)
    {
        $user = $request->user();

        if ($user->isBarAdmin() && $user->bar_id != $barId) {
            return response()->json(['error' => 'No autorizado.'], 403);
        }

        $reservas = Reserva::where('bar_id', $barId)
            ->with(['user', 'mesa'])
            ->orderByDesc('fecha')
            ->get();

        return response()->json($reservas);
    }

    // BarAdmin / SuperAdmin: confirmar o rechazar reserva
    public function cambiarEstado(Request $request, Reserva $reserva)
    {
        $user = $request->user();

        if ($user->isBarAdmin() && $user->bar_id !== $reserva->bar_id) {
            return response()->json(['error' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'estado' => 'required|in:confirmada,rechazada',
        ]);

        $reserva->update($data);
        return response()->json($reserva);
    }

    private function notificarBarAdmin(Reserva $reserva): void
    {
        try {
            $admin = User::where('bar_id', $reserva->bar_id)
                         ->where('role', 'bar_admin')
                         ->first();
            if ($admin) {
                Mail::to($admin->email)->send(new NuevaReservaMail($reserva));
            }
        } catch (\Throwable) {
            // No bloquear la reserva si el correo falla
        }
    }

    // SuperAdmin: todas las reservas
    public function todas()
    {
        return response()->json(
            Reserva::with(['user', 'mesa', 'bar'])->orderByDesc('fecha')->get()
        );
    }
}
