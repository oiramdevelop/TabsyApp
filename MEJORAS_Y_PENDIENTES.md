# Tabsy — Mejoras y Pendientes (TFG)

> Documento de análisis del estado actual del proyecto y tareas pendientes,
> organizado según los criterios de la rúbrica de evaluación del TFG.

---

## Estado del proyecto a día de hoy

| Área | Estado |
|------|--------|
| Frontend (HTML/CSS/JS + Tailwind) | ✅ Funcional |
| Backend API REST (Laravel + Sanctum) | ✅ Funcional |
| Base de datos (MySQL, 4 tablas) | ✅ Funcional |
| Autenticación con roles (3 roles) | ✅ Funcional |
| CRUD bares, mesas, reservas, usuarios | ✅ Funcional |
| Despliegue Docker | ✅ Configurado |
| Tests unitarios reales | ❌ Solo ExampleTest |
| HTTPS / SSL | ❌ Pendiente |
| CI/CD | ❌ Pendiente |
| SEO y accesibilidad | ⚠️ Parcial |
| Integración Google Places | ⚠️ Campo en BD, no usado |
| Scripts Python / métricas | ❌ Pendiente |

---

## 1. Bases de Datos

### Lo que está hecho
- 4 migraciones Laravel: `users`, `bares`, `mesas`, `reservas`
- Claves foráneas con `cascadeOnDelete`
- Campos: `google_place_id`, `ubicacion` (enum), `estado` reserva (enum)

### Pendiente

- [ ] **Diagrama E/R** — Generar con MySQL Workbench o dbdiagram.io y exportar como imagen para la memoria del TFG
- [ ] **Paso a tablas** — Documento o PDF con la normalización (1FN → 3FN)
- [ ] **Vista SQL** — Crear al menos una vista, por ejemplo `reservas_completas` que junte usuarios + bares + mesas
- [ ] **Procedimiento almacenado** — Por ejemplo `sp_cancelar_reservas_caducadas` que cancele reservas pasadas sin confirmar
- [ ] **Índices** — Añadir índices en `reservas.fecha`, `reservas.bar_id`, `bares.ciudad` para queries frecuentes

```sql
-- Ejemplo de vista a crear
CREATE VIEW reservas_completas AS
SELECT r.id, r.fecha, r.hora, r.estado, r.num_personas,
       u.name AS cliente, u.email,
       b.nombre AS bar, b.ciudad,
       m.numero AS mesa, m.ubicacion
FROM reservas r
JOIN users u ON r.user_id = u.id
JOIN bares b ON r.bar_id = b.id
JOIN mesas m ON r.mesa_id = m.id;
```

---

## 2. Digitalización aplicada a los sectores productivos

### Lo que está hecho
- App web que sustituye la reserva telefónica en bares
- Campo `google_place_id` en la tabla `bares` (preparado para integración)
- Sistema de roles (superadmin, bar_admin, cliente)

### Pendiente

- [ ] **Integrar Google Places API** — Usar el `google_place_id` guardado para mostrar valoraciones reales, fotos y horarios automáticamente. Requiere clave de API en `.env`
- [ ] **Justificación de impacto** — Redactar en la memoria cómo Tabsy digitaliza el proceso tradicional: llamada telefónica → reserva digital con confirmación instantánea
- [ ] **Propuesta de IA** — Añadir al menos como propuesta de futuro: recomendación de bares por historial del usuario, predicción de ocupación, chatbot de reservas. Aunque no esté implementado, hay que citarlo en la sección de innovación
- [ ] **Análisis de escalabilidad** — Documentar cómo escalaría Tabsy: más ciudades, API pública para bares externos, app móvil PWA

---

## 3. Sostenibilidad aplicada al sistema productivo

### Lo que está hecho
- Consultas específicas por ID (no se carga todo en memoria)
- Frontend estático (Nginx, sin servidor SSR)

### Pendiente

- [ ] **Paginación en la API** — Actualmente `GET /bares` devuelve TODOS los bares. Añadir `?page=1&per_page=12` con Laravel paginate() para reducir payload
- [ ] **Lazy loading de imágenes** — Añadir `loading="lazy"` a todas las `<img>` de bar cards
- [ ] **Compresión de imágenes del carrusel** — Las 4 imágenes del carrusel pesan 13 MB en total (bar1 pesa 7.4 MB). Comprimir a WebP o reducir resolución a max 1920px
- [ ] **Cache de respuestas API** — Añadir `Cache-Control` en cabeceras de rutas públicas (`GET /bares`)
- [ ] **Justificación ODS** — Redactar en la memoria la relación con ODS 8 (trabajo decente, digitalización de pymes), ODS 11 (ciudades sostenibles) y ODS 12 (consumo responsable digital)
- [ ] **Green Code en SQL** — Documentar el uso de índices y la reducción de N+1 queries con Eager Loading en Laravel

---

## 4. Entornos de Desarrollo

### Lo que está hecho
- Git con historial de commits
- Docker Compose con 4 servicios (frontend, tailwind watcher, Laravel, MySQL)
- phpunit.xml configurado

### Pendiente

- [ ] **Tests Feature reales** — Los únicos tests son `ExampleTest.php`. Crear al menos:
  - `AuthTest`: login correcto, login con credenciales incorrectas, registro
  - `BarTest`: listar bares públicamente, crear bar como superadmin, intentar crear como cliente (403)
  - `ReservaTest`: crear reserva, cancelar, cambiar estado
- [ ] **Ramas Git** — Usar ramas `feature/nombre-feature` y `develop` para evidenciar la gestión de versiones ante el tribunal
- [ ] **Documentación del entorno** — Fichero `SETUP.md` con instrucciones de instalación local y con Docker. Lista de herramientas: VSCode, extensiones PHP, TablePlus/DBeaver para MySQL
- [ ] **Estrategia de depuración** — Documentar el uso de `dd()` / `Log::info()` en Laravel y `console.log` / DevTools en frontend

---

## 5. Lenguajes de Marcas y SGI

### Lo que está hecho
- HTML semántico en la mayoría de páginas
- Tailwind CSS responsive (`md:`, `lg:`)
- Fuentes Google Fonts (Roboto Mono, DM Sans)

### Pendiente

- [ ] **Meta tags SEO** en `index.html`:
  ```html
  <meta name="description" content="Tabsy — Reserva mesa en los mejores bares sin llamar ni esperar." />
  <meta name="keywords" content="reserva bar, mesa, restaurante, Tabsy" />
  <meta property="og:title" content="Tabsy — Reserva tu mesa" />
  <meta property="og:image" content="/assets/images/logo-tabsy-1.png" />
  ```
- [ ] **Atributos de accesibilidad** — Añadir `aria-label` a botones del carrusel (prev/next), `role="navigation"` al nav, `alt` descriptivos en todas las imágenes
- [ ] **Validación HTML** — Pasar el HTML por el validador W3C y corregir errores
- [ ] **Responsive en páginas internas** — Verificar `pages/admin/` en mobile (tabla de datos puede romperse en pantallas pequeñas)
- [ ] **favicon** — Añadir `<link rel="icon">` con el logo de Tabsy

---

## 6. Programación

### Lo que está hecho
- Código modular: `api.js`, `auth.js`, componentes separados (navbar, toast, modal, loader)
- Separación de responsabilidades: `landing.js`, `cliente.js`, etc.

### Pendiente

- [ ] **Validación de formularios en frontend** — El formulario de reserva necesita validar: fecha no pasada, hora dentro de horario del bar, num_personas ≤ capacidad de la mesa
- [ ] **Manejo de errores HTTP** — Mostrar mensajes específicos según código de error (401, 403, 404, 422, 500) en vez de mensaje genérico
- [ ] **JSDoc en funciones clave** — Documentar al menos las funciones principales de `api.js` y `auth.js` para la defensa
- [ ] **Código PHP bien estructurado** — Revisar que los controllers devuelven siempre el mismo formato de respuesta JSON `{data, message, status}`

---

## 7. Sistemas Informáticos

### Lo que está hecho
- Docker Compose con Nginx, PHP-FPM, MySQL
- Ports mapeados: 80 (frontend), 8000 (backend API), 3307 (MySQL)

### Pendiente

- [ ] **Diagrama de infraestructura** — Crear un diagrama (draw.io o Excalidraw) mostrando: navegador → Nginx → Laravel API → MySQL, con los puertos y volúmenes Docker
- [ ] **Informe de compatibilidad** — Probar en Chrome, Firefox, Safari (mobile), Edge y documentar resultados
- [ ] **Propuesta de escenarios de escala** — Documentar qué pasaría con 10.000 usuarios: balanceador de carga, separar MySQL a RDS, Redis para cache, CDN para imágenes
- [ ] **Variables de entorno** — Asegurar que `.env.example` está completo y `.env` está en `.gitignore`

---

## 8. Desarrollo Web en Entorno Cliente

### Lo que está hecho
- CRUD funcionando: bares (superadmin), mesas (bar_admin), reservas (cliente)
- Búsqueda en tiempo real de bares
- Toast notifications, modal de confirmación, loader global

### Pendiente

- [ ] **Validación de formularios antes de enviar** — Feedback visual en campos inválidos (borde rojo, mensaje de error inline)
- [ ] **Estado vacío en tablas** — Mostrar mensaje amigable cuando no hay reservas/mesas en las páginas de admin
- [ ] **Confirmación antes de eliminar** — El modal de confirmación existe pero verificar que se usa en TODOS los delete
- [ ] **Feedback de loading en botones** — Deshabilitar y mostrar spinner en el botón mientras se procesa la petición

---

## 9. Desarrollo Web en Entorno Servidor

### Lo que está hecho
- API REST con Laravel Sanctum
- Middleware de roles (`role:superadmin`, `role:bar_admin,superadmin`)
- Separación total frontend/backend (CORS configurado)
- Rutas agrupadas por permisos en `api.php`

### Pendiente

- [ ] **Paginación** — Implementar `paginate(12)` en `BarController@index` y `ReservaController@todas`
- [ ] **Envío de email** — Al confirmar/rechazar una reserva, enviar email al cliente con Laravel Mail + Mailtrap en desarrollo
- [ ] **Validación de requests** — Crear `FormRequest` classes (`StoreReservaRequest`, `StoreBarRequest`) en vez de validar en el controller
- [ ] **Seeders** — Crear `DatabaseSeeder` con datos de ejemplo (1 superadmin, 3 bares, mesas y reservas de prueba) para la demo del tribunal
- [ ] **Rate limiting** — Añadir `throttle:60,1` a las rutas de login/register para evitar fuerza bruta

---

## 10. Despliegue de Aplicaciones Web

### Lo que está hecho
- Docker Compose funcionando con 4 servicios
- Nginx sirviendo el frontend estático
- Laravel corriendo con `php artisan serve`

### Pendiente

- [ ] **SSL / HTTPS** — Configurar certificado SSL (Let's Encrypt con Certbot si se despliega en VPS, o certificado autofirmado para demo local con Nginx)
- [ ] **Cambiar a PHP-FPM + Nginx para backend** — Actualmente usa `php artisan serve` que no es apto para producción. El Dockerfile debería usar Nginx + FPM
- [ ] **CI/CD básico con GitHub Actions** — Workflow que ejecute `php artisan test` en cada push a `main`
- [ ] **Dominio** — Registrar un dominio o subdominio (ej: `tabsy.app` o `tabsy.elevio.studio`) para la demo en vivo ante el tribunal
- [ ] **Variables de entorno en producción** — Documentar cómo se gestionan los secrets en producción (no hardcodeados en docker-compose)

```yaml
# Ejemplo GitHub Actions (.github/workflows/test.yml)
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: cd backend && composer install
      - run: cd backend && php artisan test
```

---

## 11. Proyecto Intermodular

### Pendiente (crítico para la defensa)

- [ ] **Diagrama de Gantt** — Crear en Notion, Excel o GanttProject con las fases reales del proyecto: análisis, diseño BD, backend, frontend, tests, despliegue
- [ ] **División en Sprints** — Documentar al menos 3 sprints con sus user stories y lo que se entregó en cada uno
- [ ] **Registro de incidencias** — Documento con los problemas reales encontrados durante el desarrollo y cómo se resolvieron (ej: CORS, token Sanctum, Docker networking)
- [ ] **Diapositivas de defensa** — Presentación con: qué es Tabsy, problema que resuelve, arquitectura, demo en vivo, conclusiones y líneas futuras. Máx 12 slides
- [ ] **Gestión en GitHub Projects** — Crear un tablero Kanban en el repositorio con las tareas (Issues) organizadas en To Do / In Progress / Done

---

## 12. Diseño de Interfaces Web

### Lo que está hecho
- Paleta de colores coherente: navy `#0f2240`, sand `#c9a96e`, cream `#f5f0e8`
- Tipografía: Roboto Mono (títulos), DM Sans (cuerpo)
- Animaciones scroll reveal en landing page
- Carrusel con 4 imágenes de bares reales
- Logo redimensionado a 64px

### Pendiente

- [ ] **Mobile nav** — La barra de navegación no tiene menú hamburguesa en mobile. En pantallas pequeñas los links desaparecen
- [ ] **Responsive en admin** — Las tablas del panel de administración no son responsive en mobile/tablet
- [ ] **Dark mode** — Propuesta de futuro o implementación básica con `prefers-color-scheme`
- [ ] **Skeleton loaders** — El skeleton está implementado pero verificar que aparece en TODAS las páginas mientras cargan datos
- [ ] **Transiciones entre páginas** — Añadir `fade-out` al navegar entre páginas para sensación de SPA

---

## 13. Programación en Python y Análisis de Datos

### Pendiente (módulo específico de 2º DAW)

- [ ] **Script de análisis de reservas** — Script Python que lea de la BD MySQL y genere estadísticas: reservas por día de la semana, hora punta, tasa de cancelación por bar
- [ ] **Gráficas con Matplotlib/Seaborn** — Generar 2-3 gráficas de barras/líneas exportadas como PNG para incluir en la memoria
- [ ] **Dashboard de métricas** — Integrar Google Analytics 4 o Plausible Analytics en el frontend para métricas de uso reales (visitas, eventos de reserva)

```python
# Ejemplo mínimo de script de análisis
import mysql.connector
import matplotlib.pyplot as plt

conn = mysql.connector.connect(host='localhost', port=3307,
                                database='tabsy_db', user='root', password='toor')
cursor = conn.cursor()
cursor.execute("SELECT estado, COUNT(*) FROM reservas GROUP BY estado")
datos = cursor.fetchall()

estados = [d[0] for d in datos]
totales = [d[1] for d in datos]
plt.bar(estados, totales, color=['#4a6fa5','#c9a96e','#e55','#999'])
plt.title('Distribución de reservas por estado')
plt.savefig('reservas_stats.png', dpi=150, bbox_inches='tight')
```

---

## Prioridad de implementación antes de la defensa

| Prioridad | Tarea | Impacto en rúbrica |
|-----------|-------|-------------------|
| 🔴 Alta | Seeders para demo en vivo | Proyecto Intermodular / Dev Servidor |
| 🔴 Alta | Diagrama E/R y paso a tablas | Bases de Datos |
| 🔴 Alta | Meta tags SEO + `aria-label` | Lenguajes de Marcas |
| 🔴 Alta | Tests Feature (al menos AuthTest) | Entornos de Desarrollo |
| 🔴 Alta | Diapositivas de defensa | Proyecto Intermodular |
| 🟡 Media | Mobile nav (hamburguesa) | Diseño de Interfaces |
| 🟡 Media | Paginación en API | Dev Servidor / Sostenibilidad |
| 🟡 Media | Script Python + gráfica | Python y Análisis de Datos |
| 🟡 Media | CI/CD GitHub Actions básico | Despliegue |
| 🟢 Baja | Vista SQL + procedimiento almacenado | Bases de Datos |
| 🟢 Baja | Integración Google Places | Digitalización |
| 🟢 Baja | SSL en producción | Despliegue |

---

## Estructura de archivos recomendada para documentar en la defensa

```
TabsyApp/
├── frontend/              # HTML + CSS (Tailwind) + JS vanilla
│   ├── assets/
│   │   ├── css/           # input.css (fuente) → output.css (compilado)
│   │   ├── images/        # Logo + imágenes carrusel
│   │   └── js/
│   │       ├── core/      # api.js, auth.js
│   │       ├── components/# navbar, toast, modal, loader
│   │       └── pages/     # lógica por página
│   └── pages/             # HTMLs internos (cliente, admin, auth)
├── backend/               # Laravel 11 REST API
│   ├── app/Http/Controllers/Api/  # 5 controllers
│   ├── database/migrations/       # 4 tablas
│   └── routes/api.php             # Rutas agrupadas por rol
├── docker/                # Dockerfiles + nginx.conf
└── docker-compose.yml     # Orquestación de 4 servicios
```
