<?php

namespace App\Policies;

use App\Models\Bar;
use App\Models\User;

class BarPolicy
{
    // ¿Puede $user gestionar (editar bar, mesas, reservas) de $bar?
    public function manage(User $user, Bar $bar): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (!$user->isBarAdmin()) {
            return false;
        }

        return $user->bar_id === $bar->id || $user->bares->contains($bar->id);
    }
}
