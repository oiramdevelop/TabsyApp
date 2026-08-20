<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // SuperAdmin: listar todos los usuarios
    public function index()
    {
        return response()->json(User::with(['bar', 'bares'])->get());
    }

    // SuperAdmin: crear usuario (puede asignar cualquier rol)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:superadmin,bar_admin,cliente',
            'bar_id'   => 'nullable|exists:bares,id',
            'bares'    => 'sometimes|array',
            'bares.*'  => 'integer|exists:bares,id',
        ]);

        $user = User::create([
            ...collect($data)->except('bares')->all(),
            'password' => Hash::make($data['password']),
        ]);

        $this->sincronizarBarPivote($user, $data['bares'] ?? []);

        return response()->json($user->load(['bar', 'bares']), 201);
    }

    // SuperAdmin: editar usuario
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'role'     => 'sometimes|in:superadmin,bar_admin,cliente',
            'bar_id'   => 'nullable|exists:bares,id',
            'bares'    => 'sometimes|array',
            'bares.*'  => 'integer|exists:bares,id',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update(collect($data)->except('bares')->all());
        $this->sincronizarBarPivote($user, $data['bares'] ?? []);

        return response()->json($user->load(['bar', 'bares']));
    }

    // SuperAdmin: eliminar usuario
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado.']);
    }

    // Mantiene la tabla pivote bar_user en línea con users.bar_id (o con la
    // lista completa de $bares cuando el superadmin asigna varios negocios
    // a un mismo bar_admin). bar_id queda como "bar principal" (el primero).
    private function sincronizarBarPivote(User $user, array $bares = []): void
    {
        if ($user->role !== 'bar_admin') {
            $user->bares()->sync([]);
            return;
        }

        $ids = !empty($bares) ? $bares : array_filter([$user->bar_id]);
        $user->bares()->sync($ids);

        if (!empty($ids) && !in_array($user->bar_id, $ids)) {
            $user->bar_id = $ids[0];
            $user->save();
        }
    }
}
