<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class PlanController extends Controller
{
    // Público: catálogo de planes (usado por el panel superadmin y una futura página de precios)
    public function index()
    {
        return response()->json(Plan::all());
    }
}
