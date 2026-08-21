<?php

namespace App\Models;

use App\Mail\VerificarEmailMail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use Laravel\Cashier\Billable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use Billable, HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'bar_id',
        'avatar',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? '/storage/' . $this->avatar : null;
    }

    protected $hidden = [
        'password',
        'remember_token',
        'stripe_id',
        'pm_type',
        'pm_last_four',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isBarAdmin():   bool { return $this->role === 'bar_admin'; }
    public function isSuperAdmin(): bool { return $this->role === 'superadmin'; }

    public function reservas() { return $this->hasMany(Reserva::class, 'user_id'); }
    public function bar()      { return $this->belongsTo(Bar::class, 'bar_id'); }
    public function bares()    { return $this->belongsToMany(Bar::class, 'bar_user')->withTimestamps(); }

    /**
     * Override del envío de verificación para usar nuestro Mailable
     * en el estilo visual del proyecto (navy/sand).
     */
    public function sendEmailVerificationNotification(): void
    {
        $url = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            ['id' => $this->getKey(), 'hash' => sha1($this->getEmailForVerification())]
        );

        Mail::to($this->email)->send(new VerificarEmailMail($this, $url));
    }
}
