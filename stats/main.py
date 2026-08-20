from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
import os
from datetime import date
import calendar

app = FastAPI(title="Tabsy Stats API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "mysql"),
        port=int(os.getenv("DB_PORT", 3306)),
        database=os.getenv("DB_DATABASE", "tabsy_db"),
        user=os.getenv("DB_USERNAME", "root"),
        password=os.getenv("DB_PASSWORD", "toor"),
    )


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stats/app")
def stats_app():
    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)

        hoy = date.today()
        primer_dia_mes = hoy.replace(day=1)
        hace_7  = date(hoy.year, hoy.month, hoy.day - 7) if hoy.day > 7 else primer_dia_mes
        hace_30 = date.fromordinal(hoy.toordinal() - 30)

        if hoy.month == 1:
            ant_inicio = date(hoy.year - 1, 12, 1)
            ant_fin    = date(hoy.year - 1, 12, 31)
        else:
            ant_inicio = date(hoy.year, hoy.month - 1, 1)
            ant_fin    = date(hoy.year, hoy.month - 1,
                              calendar.monthrange(hoy.year, hoy.month - 1)[1])

        # ── Totales globales ─────────────────────────────────────
        cur.execute("SELECT COUNT(*) AS t FROM reservas"); total_reservas = cur.fetchone()["t"]
        cur.execute("SELECT COUNT(*) AS t FROM users");    total_usuarios = cur.fetchone()["t"]
        cur.execute("SELECT COUNT(*) AS t FROM bares WHERE activo=1"); total_bares = cur.fetchone()["t"]
        cur.execute("SELECT COUNT(*) AS t FROM reservas WHERE estado='pendiente'"); total_pendientes = cur.fetchone()["t"]
        cur.execute("SELECT COUNT(*) AS t FROM reservas WHERE user_id IS NULL");   total_invitados  = cur.fetchone()["t"]
        cur.execute("SELECT COUNT(*) AS t FROM users WHERE email_verified_at IS NOT NULL"); verificados = cur.fetchone()["t"]

        # ── Nuevos usuarios este mes / mes anterior ──────────────
        cur.execute("SELECT COUNT(*) AS t FROM users WHERE DATE(created_at) >= %s", (primer_dia_mes,))
        nuevos_usuarios_mes = cur.fetchone()["t"]
        cur.execute("SELECT COUNT(*) AS t FROM users WHERE DATE(created_at) BETWEEN %s AND %s", (ant_inicio, ant_fin))
        nuevos_usuarios_mes_ant = cur.fetchone()["t"]

        # ── Reservas este mes vs anterior ────────────────────────
        cur.execute("SELECT COUNT(*) AS t FROM reservas WHERE fecha >= %s", (primer_dia_mes,))
        res_mes_actual = cur.fetchone()["t"]
        cur.execute("SELECT COUNT(*) AS t FROM reservas WHERE fecha BETWEEN %s AND %s", (ant_inicio, ant_fin))
        res_mes_anterior = cur.fetchone()["t"]

        # ── Por estado ───────────────────────────────────────────
        cur.execute("SELECT estado, COUNT(*) AS t FROM reservas GROUP BY estado")
        por_estado = {r["estado"]: r["t"] for r in cur.fetchall()}

        # ── Activación: usuarios con al menos 1 reserva ──────────
        cur.execute("SELECT COUNT(DISTINCT user_id) AS t FROM reservas WHERE user_id IS NOT NULL")
        usuarios_activos = cur.fetchone()["t"]

        # ── Retención: usuarios con 2+ reservas ──────────────────
        cur.execute("""
            SELECT COUNT(*) AS t FROM (
                SELECT user_id FROM reservas
                WHERE user_id IS NOT NULL
                GROUP BY user_id HAVING COUNT(*) >= 2
            ) AS rep
        """)
        usuarios_recurrentes = cur.fetchone()["t"]

        # ── Lead time: días de antelación media ──────────────────
        cur.execute("""
            SELECT AVG(DATEDIFF(fecha, DATE(created_at))) AS avg_lead
            FROM reservas WHERE fecha >= created_at
        """)
        lead_time = cur.fetchone()["avg_lead"]
        lead_time = round(float(lead_time), 1) if lead_time else 0

        # ── Bares sin ninguna reserva (inactivos) ────────────────
        cur.execute("""
            SELECT COUNT(*) AS t FROM bares b
            WHERE activo=1 AND NOT EXISTS (
                SELECT 1 FROM reservas r WHERE r.bar_id = b.id
            )
        """)
        bares_sin_reservas = cur.fetchone()["t"]

        # ── Días de la semana más populares ─────────────────────
        cur.execute("""
            SELECT DAYNAME(fecha) AS dia, DAYOFWEEK(fecha) AS num, COUNT(*) AS total
            FROM reservas
            GROUP BY DAYOFWEEK(fecha), DAYNAME(fecha)
            ORDER BY DAYOFWEEK(fecha)
        """)
        por_dia_semana = cur.fetchall()

        # ── Horas pico globales ───────────────────────────────────
        cur.execute("""
            SELECT HOUR(hora) AS hora, COUNT(*) AS total
            FROM reservas
            GROUP BY HOUR(hora)
            ORDER BY HOUR(hora)
        """)
        por_hora = cur.fetchall()

        # ── Top ciudades ─────────────────────────────────────────
        cur.execute("""
            SELECT b.ciudad, COUNT(r.id) AS total
            FROM bares b
            LEFT JOIN reservas r ON r.bar_id = b.id
            GROUP BY b.ciudad
            ORDER BY total DESC
            LIMIT 6
        """)
        top_ciudades = cur.fetchall()

        # ── Crecimiento usuarios (últimos 8 meses) ───────────────
        cur.execute("""
            SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, COUNT(*) AS total
            FROM users
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 8 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY mes
        """)
        crecimiento_usuarios = cur.fetchall()

        # ── Tendencia reservas (últimos 6 meses) ─────────────────
        cur.execute("""
            SELECT DATE_FORMAT(fecha, '%Y-%m') AS mes,
                   COUNT(*) AS total,
                   SUM(estado='confirmada') AS confirmadas
            FROM reservas
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes
        """)
        tendencia = cur.fetchall()

        # ── Top bares ────────────────────────────────────────────
        cur.execute("""
            SELECT b.nombre, COUNT(r.id) AS total,
                   SUM(r.estado='confirmada') AS confirmadas,
                   SUM(r.estado='cancelada')+SUM(r.estado='rechazada') AS bajas
            FROM bares b
            LEFT JOIN reservas r ON r.bar_id = b.id
            GROUP BY b.id, b.nombre
            ORDER BY total DESC
            LIMIT 8
        """)
        top_bares = cur.fetchall()

        # ── Tasa de rechazo/cancelación por bar ──────────────────
        cur.execute("""
            SELECT b.nombre,
                   COUNT(r.id) AS total,
                   ROUND(SUM(r.estado='rechazada')/NULLIF(COUNT(r.id),0)*100,1) AS tasa_rechazo
            FROM bares b
            JOIN reservas r ON r.bar_id = b.id
            GROUP BY b.id, b.nombre
            HAVING COUNT(r.id) >= 2
            ORDER BY tasa_rechazo DESC
            LIMIT 5
        """)
        tasa_rechazo = cur.fetchall()

        conn.close()

        confirmadas_total = por_estado.get("confirmada", 0)
        tasa_conf = round(confirmadas_total / total_reservas * 100, 1) if total_reservas > 0 else 0
        tasa_act  = round(usuarios_activos / total_usuarios * 100, 1) if total_usuarios > 0 else 0
        tasa_ret  = round(usuarios_recurrentes / max(usuarios_activos, 1) * 100, 1)

        return {
            "totales": {
                "reservas":    total_reservas,
                "usuarios":    total_usuarios,
                "bares":       total_bares,
                "pendientes":  total_pendientes,
                "invitados":   total_invitados,
                "verificados": verificados,
                "bares_sin_reservas": bares_sin_reservas,
            },
            "crecimiento": {
                "nuevos_usuarios_mes":     nuevos_usuarios_mes,
                "nuevos_usuarios_mes_ant": nuevos_usuarios_mes_ant,
                "variacion_usuarios":      nuevos_usuarios_mes - nuevos_usuarios_mes_ant,
                "usuarios_activos":        usuarios_activos,
                "usuarios_recurrentes":    usuarios_recurrentes,
                "tasa_activacion":         tasa_act,
                "tasa_retencion":          tasa_ret,
            },
            "reservas": {
                "mes_actual":    res_mes_actual,
                "mes_anterior":  res_mes_anterior,
                "variacion_mes": res_mes_actual - res_mes_anterior,
                "tasa_confirmacion": tasa_conf,
                "lead_time_dias":    lead_time,
            },
            "por_estado":        por_estado,
            "por_dia_semana":    por_dia_semana,
            "por_hora":          por_hora,
            "top_ciudades":      top_ciudades,
            "top_bares":         top_bares,
            "tasa_rechazo":      tasa_rechazo,
            "tendencia":         tendencia,
            "crecimiento_usuarios": crecimiento_usuarios,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/{bar_id}/mes")
def stats_mes(bar_id: int):
    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)

        hoy = date.today()
        primer_dia = hoy.replace(day=1)
        ultimo_dia = hoy.replace(day=calendar.monthrange(hoy.year, hoy.month)[1])

        # Totales del mes
        cur.execute("""
            SELECT
                COUNT(*) AS total,
                SUM(estado = 'confirmada') AS confirmadas,
                SUM(estado = 'pendiente')  AS pendientes,
                SUM(estado = 'cancelada')  AS canceladas,
                SUM(estado = 'rechazada')  AS rechazadas,
                SUM(CASE WHEN estado = 'confirmada' THEN num_personas ELSE 0 END) AS personas_confirmadas
            FROM reservas
            WHERE bar_id = %s AND fecha BETWEEN %s AND %s
        """, (bar_id, primer_dia, ultimo_dia))
        totales = cur.fetchone()

        # Reservas por día del mes (para gráfico de barras)
        cur.execute("""
            SELECT DAY(fecha) AS dia, COUNT(*) AS total,
                   SUM(estado = 'confirmada') AS confirmadas
            FROM reservas
            WHERE bar_id = %s AND fecha BETWEEN %s AND %s
            GROUP BY DAY(fecha)
            ORDER BY dia
        """, (bar_id, primer_dia, ultimo_dia))
        por_dia = cur.fetchall()

        # Hora pico
        cur.execute("""
            SELECT HOUR(hora) AS hora, COUNT(*) AS total
            FROM reservas
            WHERE bar_id = %s AND fecha BETWEEN %s AND %s
            GROUP BY HOUR(hora)
            ORDER BY total DESC
            LIMIT 1
        """, (bar_id, primer_dia, ultimo_dia))
        hora_pico = cur.fetchone()

        # Mes anterior para comparativa
        if hoy.month == 1:
            mes_ant_inicio = date(hoy.year - 1, 12, 1)
            mes_ant_fin    = date(hoy.year - 1, 12, 31)
        else:
            mes_ant_inicio = date(hoy.year, hoy.month - 1, 1)
            mes_ant_fin    = date(hoy.year, hoy.month - 1,
                                  calendar.monthrange(hoy.year, hoy.month - 1)[1])

        cur.execute("""
            SELECT COUNT(*) AS total,
                   SUM(estado = 'confirmada') AS confirmadas
            FROM reservas
            WHERE bar_id = %s AND fecha BETWEEN %s AND %s
        """, (bar_id, mes_ant_inicio, mes_ant_fin))
        mes_anterior = cur.fetchone()

        conn.close()

        total = totales["total"] or 0
        conf  = totales["confirmadas"] or 0
        tasa  = round(conf / total * 100, 1) if total > 0 else 0.0

        ant_total = mes_anterior["total"] or 0
        variacion = total - ant_total

        return {
            "mes":          hoy.strftime("%B %Y"),
            "total":        total,
            "confirmadas":  conf,
            "pendientes":   int(totales["pendientes"] or 0),
            "canceladas":   int(totales["canceladas"] or 0),
            "rechazadas":   int(totales["rechazadas"] or 0),
            "personas_confirmadas": int(totales["personas_confirmadas"] or 0),
            "tasa_confirmacion": tasa,
            "variacion_mes_anterior": variacion,
            "hora_pico":    hora_pico["hora"] if hora_pico else None,
            "por_dia":      [{"dia": r["dia"], "total": r["total"], "confirmadas": r["confirmadas"]} for r in por_dia],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/stats/{bar_id}/tendencia")
def tendencia(bar_id: int):
    try:
        conn = get_db()
        cur = conn.cursor(dictionary=True)

        cur.execute("""
            SELECT DATE_FORMAT(fecha, '%%Y-%%m') AS mes,
                   COUNT(*) AS total,
                   SUM(estado = 'confirmada') AS confirmadas,
                   SUM(num_personas) AS personas
            FROM reservas
            WHERE bar_id = %s AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha, '%%Y-%%m')
            ORDER BY mes
        """, (bar_id,))

        rows = cur.fetchall()
        conn.close()
        return {"tendencia": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
