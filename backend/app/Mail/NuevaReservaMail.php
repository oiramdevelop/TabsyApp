<?php

namespace App\Mail;

use App\Models\Reserva;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NuevaReservaMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Reserva $reserva) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: '🍻 Nueva reserva en ' . $this->reserva->bar->nombre);
    }

    public function content(): Content
    {
        $r = $this->reserva;
        $cliente = $r->user?->name ?? $r->nombre_invitado ?? 'Invitado';
        $email   = $r->user?->email ?? $r->email_invitado ?? '—';
        $tel     = $r->telefono_invitado ?? '—';

        return new Content(htmlString: "
            <div style='font-family:Inter,sans-serif;max-width:560px;margin:0 auto;'>
                <div style='background:#0f2240;padding:32px;border-radius:16px 16px 0 0;text-align:center;'>
                    <h1 style='color:#c9a96e;font-size:1.4rem;margin:0;'>Nueva reserva recibida</h1>
                    <p style='color:rgba(255,255,255,0.6);margin:8px 0 0;font-size:0.9rem;'>{$r->bar->nombre}</p>
                </div>
                <div style='background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #e5e7eb;'>
                    <table style='width:100%;border-collapse:collapse;font-size:0.9rem;'>
                        <tr><td style='padding:8px 0;color:#6b7280;'>Cliente</td><td style='padding:8px 0;font-weight:600;color:#0f2240;'>{$cliente}</td></tr>
                        <tr><td style='padding:8px 0;color:#6b7280;'>Correo</td><td style='padding:8px 0;'>{$email}</td></tr>
                        <tr><td style='padding:8px 0;color:#6b7280;'>Teléfono</td><td style='padding:8px 0;'>{$tel}</td></tr>
                        <tr><td style='padding:8px 0;color:#6b7280;'>Mesa</td><td style='padding:8px 0;'>Mesa {$r->mesa->numero} · {$r->mesa->capacidad} personas</td></tr>
                        <tr><td style='padding:8px 0;color:#6b7280;'>Fecha</td><td style='padding:8px 0;font-weight:600;'>{$r->fecha}</td></tr>
                        <tr><td style='padding:8px 0;color:#6b7280;'>Hora</td><td style='padding:8px 0;font-weight:600;'>{$r->hora}</td></tr>
                        <tr><td style='padding:8px 0;color:#6b7280;'>Personas</td><td style='padding:8px 0;'>{$r->num_personas}</td></tr>
                        " . ($r->notas ? "<tr><td style='padding:8px 0;color:#6b7280;'>Notas</td><td style='padding:8px 0;font-style:italic;'>{$r->notas}</td></tr>" : '') . "
                    </table>
                    <div style='margin-top:24px;padding:16px;background:#fef3c7;border-radius:10px;text-align:center;'>
                        <p style='margin:0;font-size:0.85rem;color:#92400e;font-weight:600;'>Accede al dashboard para confirmar o rechazar esta reserva</p>
                    </div>
                </div>
                <p style='text-align:center;color:#9ca3af;font-size:0.75rem;margin-top:16px;'>Tabsy · Sistema de reservas</p>
            </div>
        ");
    }
}
