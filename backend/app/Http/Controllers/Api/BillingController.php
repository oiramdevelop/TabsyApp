<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bar;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    // BarAdmin / SuperAdmin: inicia el pago real (Stripe Checkout, modo test) para pasar ese bar a Pro
    public function checkout(Request $request, Bar $bar)
    {
        $this->authorize('manage', $bar);

        $frontend = rtrim(config('app.url'), '/') . '/pages/admin_bar/dashboard.html';

        $session = $request->user()
            ->newSubscription('default', config('services.stripe.price_pro'))
            ->checkout([
                'success_url' => "{$frontend}?bar={$bar->id}&checkout=success",
                'cancel_url'  => "{$frontend}?bar={$bar->id}&checkout=cancel",
                'metadata'    => ['bar_id' => $bar->id],
                'subscription_data' => [
                    'metadata' => ['bar_id' => $bar->id],
                ],
            ]);

        return response()->json(['url' => $session->url]);
    }

    // BarAdmin / SuperAdmin: cancela la suscripción activa de ese bar
    public function cancelar(Request $request, Bar $bar)
    {
        $this->authorize('manage', $bar);

        $subscription = $request->user()->subscription('default');
        if (!$subscription || $subscription->canceled()) {
            return response()->json(['error' => 'No hay ninguna suscripción activa que cancelar.'], 422);
        }

        $subscription->cancel();

        return response()->json(['message' => 'Suscripción cancelada. Seguirá activa hasta el final del periodo ya pagado.']);
    }
}
