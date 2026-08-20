<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BillingController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\BarController;
use App\Http\Controllers\Api\MesaController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ResenaController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ─── PÚBLICAS (sin token) ────────────────────────────────────────────────────
Route::post('/register',     [AuthController::class, 'register']);
Route::post('/register-bar', [AuthController::class, 'registerBar']);
Route::post('/login',        [AuthController::class, 'login']);

// ─── VERIFICACIÓN DE EMAIL ───────────────────────────────────────────────────
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');
Route::post('/email/resend', [AuthController::class, 'resendVerification']);

Route::get('/planes',                     [PlanController::class, 'index']);
Route::get('/config/maps-key',            [ConfigController::class, 'mapsKey']);
Route::get('/bares',                      [BarController::class,  'index']);
Route::get('/bares/{bar}',                [BarController::class,  'show']);
Route::get('/bares/{bar}/mesas',          [MesaController::class, 'index']);
Route::get('/bares/{barId}/resenas',      [ResenaController::class, 'porBar']);
Route::post('/reservas/guest',            [ReservaController::class, 'storeGuest']);

// ─── AUTENTICADAS (token requerido) ─────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── PERFIL ───────────────────────────────────────────────────
    Route::put('/perfil',         [PerfilController::class, 'update']);
    Route::post('/perfil/avatar', [PerfilController::class, 'uploadAvatar']);

    // ── CLIENTE ──────────────────────────────────────────────────────────────
    Route::get('/mis-reservas',                   [ReservaController::class, 'misReservas']);
    Route::post('/reservas',                      [ReservaController::class, 'store']);
    Route::patch('/reservas/{reserva}/cancelar',  [ReservaController::class, 'cancelar']);

    // Reseñas (solo usuarios con reserva confirmada en ese bar)
    Route::post('/resenas',                       [ResenaController::class, 'store']);
    Route::delete('/resenas/{resena}',            [ResenaController::class, 'destroy']);

    // ── BAR ADMIN + SUPERADMIN ────────────────────────────────────────────────
    Route::middleware('role:bar_admin,superadmin')->group(function () {
        Route::get('/bares/{barId}/stats',          [BarController::class, 'stats']);
        Route::get('/bares/{barId}/reservas',       [ReservaController::class, 'porBar']);
        Route::patch('/reservas/{reserva}/estado',  [ReservaController::class, 'cambiarEstado']);

        Route::post('/bares/{bar}/mesas',             [MesaController::class, 'store']);
        Route::put('/bares/{bar}/mesas/{mesa}',       [MesaController::class, 'update']);
        Route::delete('/bares/{bar}/mesas/{mesa}',    [MesaController::class, 'destroy']);

        Route::put('/bares/{bar}', [BarController::class, 'update']);

        Route::post('/bares/{bar}/checkout',             [BillingController::class, 'checkout']);
        Route::post('/bares/{bar}/cancelar-suscripcion',  [BillingController::class, 'cancelar']);
    });

    // ── SOLO SUPERADMIN ───────────────────────────────────────────────────────
    Route::middleware('role:superadmin')->group(function () {
        Route::get('/reservas',         [ReservaController::class, 'todas']);

        Route::post('/bares',           [BarController::class, 'store']);
        Route::delete('/bares/{bar}',   [BarController::class, 'destroy']);

        Route::get('/usuarios',         [UserController::class, 'index']);
        Route::post('/usuarios',        [UserController::class, 'store']);
        Route::put('/usuarios/{user}',  [UserController::class, 'update']);
        Route::delete('/usuarios/{user}', [UserController::class, 'destroy']);
    });
});
