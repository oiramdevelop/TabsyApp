<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class ConfigController extends Controller
{
    // Público: la clave de Google Maps no puede ocultarse del navegador (la
    // usa el script de Maps directamente), pero al menos vive en un solo
    // sitio (.env) en vez de copiada y pegada en cada página del frontend.
    // La restricción real está en Google Cloud Console (dominio + APIs permitidas).
    public function mapsKey()
    {
        return response()->json(['key' => config('services.google.maps_key')]);
    }
}
