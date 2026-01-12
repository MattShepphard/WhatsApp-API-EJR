#  WhatsApp API - Verificador de Números

API REST para verificar si un número de teléfono está registrado en WhatsApp, utilizando WhatsApp Web a través de Puppeteer.

##  Características

-  Verificación de números de WhatsApp en tiempo real
-  Autenticación por token Bearer
-  Rate limiting (protección contra abuso)
-  Sistema de colas para peticiones simultáneas
-  Logging automático de todas las operaciones
-  Solicitud de QR si la sesión se desconecta
- 💚 **Health Monitor**: Notificaciones automáticas del estado del servicio
-  QR Code en terminal para autenticación
-  Validación de entrada y manejo de errores

##  Estructura del Proyecto

```
WhatsApp-API-EJR/
 .env                              # Variables de entorno (no incluido en repo)
 .env.example                      # Plantilla de configuración
 .gitignore                        # Archivos excluidos de Git
 index.js                          # Punto de entrada
 package.json                      # Dependencias del proyecto
 logs/                             # Logs automáticos
 src/
    config/
       routes.js                # Configuración de rutas Express
       whatsapp.client.js       # Cliente de WhatsApp Web
    controllers/
       whatsapp.controller.js   # Controladores de la API
    services/
       whatsapp.service.js      # Lógica de negocio
       health-monitor.service.js # Monitor de salud automático
    utils/
        logger.js                # Sistema de logging
```

##  Instalación

### Requisitos previos

- Node.js 18+ 
- npm o yarn
- Google Chrome o Chromium instalado

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/MattShepphard/WhatsApp-API-EJR.git
cd WhatsApp-API-EJR
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita .env con tus valores:
```env
NAME_CLIENT=CHECK-WS-COBRIX
API_TOKEN=tu-token-secreto-aqui
PORT=3000
SUPPORT_PHONE=593987654321
HEALTH_CHECK_INTERVAL=3600000
```

4. **Iniciar el servidor**
```bash
node index.js
```

5. **Escanear código QR**

Al iniciar por primera vez, aparecerá un código QR en la terminal. Escanéalo con WhatsApp desde tu teléfono.

##  API Endpoints

### Health Check

Verifica el estado del servidor y la conexión de WhatsApp.

**Endpoint:** `GET /health`

**Respuesta:**
```json
{
  "status": "ok",
  "whatsappConnected": true,
  "uptime": "5 minutos"
}
```

### Verificar Número de WhatsApp

Verifica si un número está registrado en WhatsApp.

**Endpoint:** `POST /check-whatsapp`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer tu-token-secreto
```

**Body:**
```json
{
  "phoneNumber": "0987654321"
}
```

**Respuesta exitosa (200):**
```json
{
  "phoneNumber": "5930987654321@c.us",
  "isRegistered": true
}
```

##  Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Número verificado exitosamente |
| 400 | Solicitud inválida (número mal formateado o faltante) |
| 401 | No autorizado (token inválido o ausente) |
| 429 | Demasiadas peticiones (límite excedido) |
| 500 | Error interno del servidor |
| 503 | Sesión de WhatsApp no disponible |

##  Ejemplos de Uso

### cURL

```bash
curl -X POST http://localhost:3000/check-whatsapp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-token-secreto" \
  -d '{"phoneNumber":"0987654321"}'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/check-whatsapp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer tu-token-secreto'
  },
  body: JSON.stringify({ phoneNumber: '0987654321' })
});

const data = await response.json();
console.log(data);
```

### Python (requests)

```python
import requests

response = requests.post(
    'http://localhost:3000/check-whatsapp',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer tu-token-secreto'
    },
    json={'phoneNumber': '0987654321'}
)

print(response.json())
```

##  Seguridad

### Autenticación
- Utiliza Bearer Token para autenticar peticiones
- Token definido en variable de entorno `API_TOKEN`
- Nunca expongas tu token en código público

### Rate Limiting
- Límite: 60 peticiones por minuto por IP
- Respuesta al exceder: HTTP 429

### Validación de Entrada
- Solo números de 7-15 dígitos
- Sin caracteres especiales
- Formato automático para Ecuador (09  593)

##  Formato de Números

### Entrada aceptada
```
Solo dígitos: 0987654321
```

### Procesamiento automático
```javascript
// Si empieza con "09", agrega código de Ecuador (593)
"0987654321"  "5930987654321@c.us"

// Otros números se usan directamente
"5491234567890"  "5491234567890@c.us"
```

##  Configuración Avanzada

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NAME_CLIENT` | Identificador de sesión de WhatsApp | CHECK-WS-COBRIX |
| `API_TOKEN` | Token de autenticación para la API | - |
| `PORT` | Puerto del servidor | 3000 || `SUPPORT_PHONE` | Número para notificaciones de salud (formato: 593987654321) | - |
| `HEALTH_CHECK_INTERVAL` | Intervalo de reportes de salud en milisegundos | 3600000 (1 hora) || `SUPPORT_PHONE` | Número para notificaciones de salud (formato: 593987654321) | - |

### 💚 Health Monitor

El sistema incluye un monitor automático que envía reportes periódicos del estado del servicio.

**Configuración:**
```env
SUPPORT_PHONE=593987654321
HEALTH_CHECK_INTERVAL=3600000  # 1 hora en milisegundos
```

**Funcionamiento:**
- Envía primer reporte 1 minuto después de iniciar
- Luego envía reportes cada hora (o intervalo configurado)
- Solo envía si WhatsApp está conectado
- Incluye número del cliente activo

**Mensaje enviado:**
```
✅ *Whatsapp Checker:* 
📱 *Cliente:* 593987654321
🟢 *Estado:* Conectado
```

**Para desactivar:**
No configures `SUPPORT_PHONE` en el archivo `.env`

### Logs

Los logs se guardan automáticamente en:
- `logs/combined.log` - Todos los logs
- `logs/error.log` - Solo errores

**Configuración:**
- Rotación automática a 5MB
- Máximo 5 archivos históricos
- Formato con timestamp

##  Estados del Cliente WhatsApp

| Estado | Descripción | Endpoint funciona |
|--------|-------------|-------------------|
|  Ready | Conectado y listo |  Sí |
|  Waiting QR | Esperando escaneo |  No (503) |
|  Disconnected | Desconectado |  No (503) |
|  Reconnecting | Reconectando automáticamente |  No (503) |

### Reconexión Automática

Si la sesión se desconecta:
1. El servidor **NO se cae**
2. Intenta reconectar automáticamente después de 3 segundos
3. Muestra nuevo código QR si es necesario
4. Las peticiones devuelven 503 hasta que se reconecte

##  Dependencias Principales

- `whatsapp-web.js` - Cliente de WhatsApp Web
- `express` - Framework web
- `puppeteer` - Control de Chrome/Chromium
- `winston` - Sistema de logging
- `p-queue` - Cola de peticiones
- `express-rate-limit` - Limitación de tasa
- `qrcode-terminal` - QR en terminal
- `dotenv` - Variables de entorno

##  Solución de Problemas

### El QR no aparece
```bash
# Eliminar sesión corrupta y reiniciar
rm -rf .wwebjs_auth
node index.js
```

### Error "Protocol error"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Puerto en uso
Cambia `PORT` en `.env` a otro puerto disponible (ej: 3001)

### Sesión se desconecta constantemente
- Verifica conexión a internet estable
- No uses la misma cuenta en múltiples instancias
- Revisa logs en `logs/error.log`

##  Autor

**Matt Shepphard**
- GitHub: [@MattShepphard](https://github.com/MattShepphard)

