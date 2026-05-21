<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'cliente',
        ]);

        // Enviar correo de verificación (no se da token todavía)
        try {
            $user->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            \Log::error('Error enviando email de verificación: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Cuenta creada. Te hemos enviado un correo para verificarla.',
            'email'   => $user->email,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        // Bloquear si no ha verificado todavía
        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message'        => 'Debes verificar tu correo antes de iniciar sesión.',
                'code'           => 'email_not_verified',
                'email'          => $user->email,
            ], 403);
        }

        $token = $user->createToken('tabsy')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada correctamente.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Endpoint al que apunta el enlace del correo.
     * Valida la firma manualmente para poder redirigir a páginas
     * HTML del frontend con un status legible (no JSON 403).
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $frontend = rtrim(config('app.url'), '/') . '/pages/auth/verify.html';

        if (!URL::hasValidSignature($request)) {
            return redirect($frontend . '?status=invalid');
        }

        $user = User::find($id);
        if (!$user || !hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return redirect($frontend . '?status=invalid');
        }

        if ($user->hasVerifiedEmail()) {
            return redirect($frontend . '?status=already');
        }

        $user->markEmailAsVerified();

        return redirect($frontend . '?status=verified');
    }

    /**
     * Reenviar correo de verificación. Endpoint público (no requiere token)
     * porque el usuario aún no puede loguearse.
     */
    public function resendVerification(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $data['email'])->first();

        // Respondemos siempre lo mismo para no filtrar qué correos están registrados
        if (!$user || $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Si el correo está pendiente de verificación, te hemos enviado el enlace de nuevo.',
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Si el correo está pendiente de verificación, te hemos enviado el enlace de nuevo.',
        ]);
    }
}
