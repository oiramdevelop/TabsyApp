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
        return response()->json(User::with('bar')->get());
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
        ]);

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        return response()->json($user->load('bar'), 201);
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
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        return response()->json($user->load('bar'));
    }

    // SuperAdmin: eliminar usuario
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'Usuario eliminado.']);
    }
}
