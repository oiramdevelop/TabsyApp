<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarController;
use App\Http\Controllers\Api\MesaController;
use App\Http\Controllers\Api\ResenaController;
use App\Http\Controllers\Api\ReservaController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ─── PÚBLICAS (sin token) ────────────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/bares',                      [BarController::class,  'index']);
Route::get('/bares/{bar}',                [BarController::class,  'show']);
Route::get('/bares/{bar}/mesas',          [MesaController::class, 'index']);
Route::get('/bares/{barId}/resenas',      [ResenaController::class, 'porBar']);
Route::post('/reservas/guest',            [ReservaController::class, 'storeGuest']);

// ─── AUTENTICADAS (token requerido) ─────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── CLIENTE ──────────────────────────────────────────────────────────────
    Route::get('/mis-reservas',                   [ReservaController::class, 'misReservas']);
    Route::post('/reservas',                      [ReservaController::class, 'store']);
    Route::patch('/reservas/{reserva}/cancelar',  [ReservaController::class, 'cancelar']);

    // Reseñas (s
    // 
    // 
    // olo usuarios con reserva confirmada en ese bar)
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