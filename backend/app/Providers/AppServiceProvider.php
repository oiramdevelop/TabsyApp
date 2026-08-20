<?php

namespace App\Providers;

use App\Models\Bar;
use App\Models\Plan;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Events\WebhookReceived;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Cashier gestiona la suscripción de Stripe en sí, pero no sabe nada de
        // "bares" ni "planes" — este listener es el único sitio que traduce los
        // eventos de Stripe a bares.plan_id.
        Event::listen(WebhookReceived::class, function (WebhookReceived $event) {
            $type   = $event->payload['type']   ?? null;
            $object = $event->payload['data']['object'] ?? [];
            $barId  = $object['metadata']['bar_id'] ?? null;

            if (!$barId) {
                return;
            }

            if ($type === 'checkout.session.completed') {
                $proId = Plan::where('nombre', 'pro')->value('id');
                if ($proId) {
                    Bar::whereKey($barId)->update(['plan_id' => $proId]);
                }
            }

            if ($type === 'customer.subscription.deleted') {
                $freeId = Plan::where('nombre', 'free')->value('id');
                if ($freeId) {
                    Bar::whereKey($barId)->update(['plan_id' => $freeId]);
                }
            }
        });
    }
}
