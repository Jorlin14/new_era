# Guía de Testing: Sistema de Recuperación de Contraseña

## 🚀 Inicio Rápido

### Prerrequisitos
- Backend corriendo en `http://localhost:4000`
- Frontend corriendo en `http://localhost:3000` o `5173`
- Usuario registrado en la base de datos

## 📝 Método 1: Testing en Desarrollo (Ethereal - Emails de Prueba)

Este método NO requiere configurar SMTP real. Los emails se generan en un servidor de prueba.

### Paso 1: Verificar que estás en modo desarrollo

Archivo: `backend/.env`
```env
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Paso 2: Iniciar el backend

```bash
cd backend
node server.js
```

Deberías ver:
```
Servidor corriendo en http://localhost:4000
Ambiente: development
```

### Paso 3: Solicitar recuperación de contraseña

1. Ir a: `http://localhost:5173/auth/forgot-password`
2. Ingresar un email que **EXISTA** en tu base de datos
3. Click en "Enviar instrucciones"

### Paso 4: Revisar los logs del backend

En la consola del backend verás algo como:

```
==============================================
📧 EMAIL DE RECUPERACIÓN DE CONTRASEÑA ENVIADO
==============================================
Para: user@example.com
Token válido por: 1 hora

🔗 URL de reset: http://localhost:5173/auth/reset-password?token=abc123...

👁️  Preview del email: https://ethereal.email/message/XXXXXX
==============================================
```

### Paso 5: Abrir el Preview del Email

1. **Copia la URL que aparece en "Preview del email"**
2. **Pégala en tu navegador**
3. Verás el email exactamente como lo recibiría un usuario
4. **Click en el botón "Restablecer Contraseña"** o copia el enlace

### Paso 6: Restablecer la contraseña

1. Se abrirá: `http://localhost:5173/auth/reset-password?token=...`
2. Ingresar nueva contraseña (mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
3. Confirmar contraseña
4. Click en "Restablecer contraseña"

### Paso 7: Verificar y Login

1. Deberías ver mensaje: "Contraseña restablecida correctamente"
2. Serás redirigido a `/login`
3. Intenta iniciar sesión con tu nuevo password

## 📧 Método 2: Testing con Gmail Real (Producción-like)

### Configuración Inicial (una sola vez)

#### A. Generar App Password de Gmail

1. Ir a: https://myaccount.google.com/security
2. Activar "Verificación en 2 pasos" (si no está activada)
3. Ir a: https://myaccount.google.com/apppasswords
4. Crear nueva app password:
   - Nombre: "New Era Backend"
   - Click "Crear"
   - **Copiar el password de 16 caracteres** (formato: xxxx xxxx xxxx xxxx)

#### B. Configurar Variables de Entorno

Archivo: `backend/.env`

```env
NODE_ENV=development  # O production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM="New Era Supermercado <noreply@newera.com>"

FRONTEND_URL="http://localhost:5173"
```

⚠️ **IMPORTANTE:** Reemplaza `tu-email@gmail.com` y `xxxx xxxx xxxx xxxx` con tus datos reales

#### C. Reiniciar el Backend

```bash
# Detener el backend (Ctrl+C)
# Reiniciar
cd backend
node server.js
```

### Testing con Gmail

1. Ir a: `http://localhost:5173/auth/forgot-password`
2. Ingresar tu email real de Gmail
3. Click en "Enviar instrucciones"
4. **Revisar tu bandeja de entrada de Gmail**
5. Abrir el email de "New Era Supermercado"
6. Click en el botón "Restablecer Contraseña"
7. Completar el formulario de nueva contraseña
8. Verificar que funciona

## 🧪 Método 3: Testing con cURL (Para Desarrolladores)

### Test Completo Paso a Paso

#### 1. Crear un usuario de prueba (si no existe)

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Test",
    "email": "test@example.com",
    "password": "Test1234!",
    "phone": "3001234567"
  }'
```

#### 2. Solicitar reset password

```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás instrucciones para restablecer tu contraseña."
}
```

#### 3. Obtener el token de los logs

Busca en los logs del backend:
```
🔗 URL de reset: http://localhost:5173/auth/reset-password?token=ESTE_ES_EL_TOKEN
```

Copia el token (todo después de `token=`)

#### 4. Intentar reset con el token

```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PEGA_EL_TOKEN_AQUI",
    "password": "NuevaPass123!"
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "Contraseña restablecida correctamente. Ya puedes iniciar sesión."
}
```

**Respuesta esperada (error):**
```json
{
  "success": false,
  "message": "Token inválido o expirado."
}
```

#### 5. Verificar login con nueva password

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NuevaPass123!"
  }'
```

## ❌ Solución de Problemas Comunes

### "Error de conexión" en el frontend

**Causa:** El backend no está corriendo

**Solución:**
```bash
cd backend
node server.js
```

### "Token inválido o expirado"

**Causas posibles:**
1. El token ya expiró (más de 1 hora)
2. El token fue modificado en la URL
3. Ya se usó el token (se limpia después de usar)

**Soluciones:**
- Solicitar un nuevo enlace de recuperación
- Copiar el enlace completo del email sin modificarlo
- Usar el token dentro de 1 hora

### "Email no llega" (con Gmail configurado)

**Verificaciones:**
1. ¿El email está bien escrito en `.env`?
2. ¿El app password está correcto? (16 caracteres sin espacios)
3. ¿Está en la carpeta de spam?
4. ¿El usuario existe en la base de datos?

**Debug:**
```bash
# Revisar logs del backend
# Debería decir: "📧 Email de recuperación enviado a: user@example.com"
# Si dice "ERROR" o no aparece nada, hay problema con SMTP
```

### "La contraseña no cumple los requisitos"

**Requisitos mínimos:**
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula (A-Z)
- Al menos 1 letra minúscula (a-z)
- Al menos 1 número (0-9)

**Ejemplos válidos:**
- `Password123`
- `MiPass2024!`
- `Secure1Pass`

**Ejemplos NO válidos:**
- `password` (sin mayúscula ni número)
- `PASSWORD123` (sin minúscula)
- `Pass1` (menos de 8 caracteres)

### "Cannot find module 'nodemailer'"

**Solución:**
```bash
cd backend
npm install nodemailer
```

### Preview URL no funciona

**Causa:** El link de Ethereal puede expirar o tener problemas

**Solución:**
Copia directamente el token de los logs y construye la URL manualmente:
```
http://localhost:5173/auth/reset-password?token=TU_TOKEN_AQUI
```

## 🎯 Checklist de Funcionamiento

Use este checklist para verificar que todo funciona:

- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo y accesible
- [ ] Usuario de prueba existe en la BD
- [ ] Puedo acceder a `/auth/forgot-password`
- [ ] Al enviar email, veo logs en el backend
- [ ] Preview URL se genera correctamente (desarrollo)
- [ ] Puedo abrir el preview y ver el email
- [ ] Link del email me lleva a `/auth/reset-password?token=...`
- [ ] El formulario de reset password carga correctamente
- [ ] Puedo ingresar nueva contraseña que cumple requisitos
- [ ] Al enviar, recibo mensaje de éxito
- [ ] Soy redirigido a `/login`
- [ ] Puedo iniciar sesión con la nueva contraseña
- [ ] El token antiguo ya no funciona (se limpió)

## 📞 Contacto y Ayuda

Si después de seguir esta guía el sistema sigue sin funcionar:

1. **Revisar logs del backend** - La mayoría de problemas se ven ahí
2. **Abrir DevTools Console** en el navegador - Ver errores de JavaScript
3. **Verificar la base de datos** - ¿El usuario existe? ¿Tiene resetToken?

### Query SQL para verificar token en la BD:

```sql
SELECT 
  email, 
  "resetToken", 
  "resetTokenExpiry",
  "resetTokenExpiry" > NOW() as "token_valido"
FROM users 
WHERE email = 'test@example.com';
```

Si `resetToken` es NULL, el token no se generó o ya se usó.
Si `token_valido` es FALSE, el token expiró.
