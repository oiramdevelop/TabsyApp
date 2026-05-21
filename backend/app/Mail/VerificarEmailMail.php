<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificarEmailMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public string $verifyUrl) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '🍻 Verifica tu cuenta en Tabsy');
    }

    public function content(): Content
    {
        $nombre = e($this->user->name);
        $url    = e($this->verifyUrl);

        return new Content(htmlString: "
            <div style='font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f5f0e8;padding:24px;'>
                <div style='background:#0f2240;padding:40px 32px;border-radius:16px 16px 0 0;text-align:center;'>
                    <h1 style='color:#c9a96e;font-size:1.6rem;margin:0;font-family:Georgia,serif;'>¡Bienvenido a Tabsy, {$nombre}!</h1>
                    <p style='color:rgba(255,255,255,0.6);margin:12px 0 0;font-size:0.95rem;'>Estás a un clic de poder reservar mesa</p>
                </div>
                <div style='background:white;padding:40px 32px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;text-align:center;'>
                    <p style='color:#374151;font-size:1rem;line-height:1.6;margin:0 0 28px;'>
                        Pulsa el botón para confirmar que este correo es tuyo y activar tu cuenta.
                        El enlace caduca en <strong>60 minutos</strong>.
                    </p>

                    <a href='{$url}'
                       style='display:inline-block;background:linear-gradient(135deg,#0f2240,#1a3a6b);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:600;font-size:1rem;letter-spacing:0.02em;'>
                        Verificar mi cuenta
                    </a>

                    <p style='color:#6b7280;font-size:0.8rem;margin:32px 0 8px;'>
                        ¿No te funciona el botón? Copia esta dirección en tu navegador:
                    </p>
                    <p style='color:#4a6fa5;font-size:0.78rem;word-break:break-all;margin:0;'>
                        {$url}
                    </p>

                    <div style='margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:0.78rem;'>
                        Si no te has registrado en Tabsy, puedes ignorar este correo.
                    </div>
                </div>
                <p style='text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;'>
                    Tabsy · Tu mesa favorita te está esperando
                </p>
            </div>
        ");
    }
}
