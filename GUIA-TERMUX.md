# Añejo y Harina — Guía paso a paso: compilar y correr la app en Termux (Android)

Esta guía te lleva de la mano, comando por comando. Está escrita para hacerla
**en el teléfono donde vas a compilar** (el que tiene Termux instalado).

> **Vocabulario de esta guía**
> - **Termux**: una app que te da una terminal Linux dentro del Android.
> - **Comando**: el texto que escribes en Termux. Después de escribirlo, pulsa
>   **Enter** (la tecla ↵ del teclado) para ejecutarlo.
> - **Sesión**: cada pestaña de Termux. Puedes tener varias a la vez.
> - **Compilar**: transformar el código en la versión final optimizada
>   (la que usa el cliente real).

---

## PARTE 0 — Qué vas a hacer (léeme primero, 1 minuto)

El proyecto tiene **dos programas** que trabajan juntos:

1. **El servidor** (`restaurant-pos/server`): guarda las ventas, el menú y los
   pedidos en una base de datos. Corre en el puerto **3001**.
2. **La app** (`restaurant-pos/client`): es lo que ves y tocas (el punto de
   venta). En desarrollo corre en el puerto **5173**.

En el teléfono vas a: instalar Termux correctamente → instalar Node.js →
descargar el proyecto desde Google Drive → instalar las librerías →
prender los dos programas → abrir la app en Chrome.

**Tiempo estimado:** 30–45 minutos la primera vez (la mayoría es esperar
descargas). Hazlo con WiFi.

---

## PARTE 1 — Instalar Termux CORRECTAMENTE (muy importante)

⚠️ **NO instales Termux desde la Play Store.** Esa versión está abandonada
y da problemas. La buena se instala desde **F-Droid**.

1. En el teléfono, abre **Chrome** y entra a **f-droid.org**.
2. Toca **"Descargar F-Droid"**. Se baja un archivo APK.
3. Abre el archivo descargado. Android te dirá que por seguridad no permite
   instalar apps desconocidas → toca **"Permitir de esta fuente"** (o ve a
   *Ajustes → Apps → Acceso especial → Instalar apps desconocidas*,
   activa Chrome) y luego **Instalar**.
4. Abre la app **F-Droid**. Espera a que actualice sus repositorios
   (la ruedita de carga).
5. En el buscador de F-Droid escribe **Termux** y toca **Instalar**.
6. Abre **Termux**. Verás una pantalla negra con un cursor parpadeante.
   ¡Listo! Ya tienes la terminal.

> Si el teclado no muestra teclas como `/`, `-` o `|`, mantén pulsada la
> tecla correspondiente o usa el teclado "Hacker's Keyboard" de F-Droid.
> En Termux también puedes subir el volumen + Q para mostrar teclas extra.

---

## PARTE 2 — Preparar Termux (una sola vez)

Escribe cada comando y pulsa **Enter**. Espera a que termine uno antes de
escribir el siguiente.

**Paso 2.1 — Actualizar el sistema de paquetes:**
```bash
pkg update && pkg upgrade -y
```
*Qué hace:* descarga la lista de programas disponibles y actualiza los que
ya tienes. El `-y` significa "responde sí a todo" para que no te pregunte.
Tarda unos minutos.

**Paso 2.2 — Instalar Node.js (el motor que corre el proyecto):**
```bash
pkg install nodejs -y
```
*Qué hace:* instala Node.js, que es el programa que ejecuta el servidor y
compila la app.

**Paso 2.3 — Verificar la versión de Node:**
```bash
node -v
```
Debe responder algo como `v22.x.x` o `v23.x.x` (el primer número **22 o
mayor**). Si muestra un número menor, repite el paso 2.1.

**Paso 2.4 — Instalar el descompresor de ZIP:**
```bash
pkg install unzip -y
```

**Paso 2.5 — Darle acceso a los archivos del teléfono:**
```bash
termux-setup-storage
```
*Qué hace:* el teléfono muestra un aviso *"¿Permitir que Termux acceda a
fotos, videos y música?"* → toca **PERMITIR**. Esto crea una carpeta
`~/storage/downloads` conectada con la carpeta **Descargas** del teléfono,
para que Termux pueda ver el archivo que vas a bajar de Drive.

**Paso 2.6 — Evitar que Android apague Termux (recomendado):**
```bash
termux-wake-lock
```
*Qué hace:* mantiene a Termux despierto mientras la app está corriendo
(aparece una notificación permanente que dice "Termux idle"). Sin esto,
Android puede matar el servidor a los pocos minutos con la pantalla
apagada. Para quitarlo después: `termux-wake-unlock`.

---

## PARTE 3 — Descargar el proyecto desde Google Drive

1. En el teléfono, abre la app **Google Drive**.
2. Busca el archivo **`anyejo-y-harina-termux.zip`**.
3. Toca los **tres puntitos ⋮** al lado del archivo → **Descargar**.
4. Espera a que termine. El archivo queda en la carpeta **Descargas**.

---

## PARTE 4 — Descomprimir e instalar las librerías

Vuelve a **Termux**.

**Paso 4.1 — Comprobar que el ZIP llegó:**
```bash
ls ~/storage/downloads
```
*Qué hace:* `ls` lista los archivos de una carpeta. Debes ver
`anyejo-y-harina-termux.zip` en la lista. Si no aparece, repite la
Parte 3.

**Paso 4.2 — Descomprimir:**
```bash
unzip -q ~/storage/downloads/anyejo-y-harina-termux.zip -d ~/
```
*Qué hace:* `-q` = modo silencioso (no muestra cada archivo), `-d ~/` =
descomprime en tu carpeta personal. Tarda unos segundos.

**Paso 4.3 — Comprobar:**
```bash
ls ~
```
Debes ver la carpeta `restaurant-pos` en la lista.

**Paso 4.4 — Instalar las librerías del servidor:**
```bash
cd ~/restaurant-pos/server && npm install
```
*Qué hace:* `cd` entra a la carpeta del servidor; `npm install` descarga
las librerías que el servidor necesita (Express, TypeScript, etc.).
**Tarda varios minutos** y necesita WiFi. Verás muchas líneas pasando;
es normal. Al final no debe decir "error".

> ¿Por qué no venían en el ZIP? Porque las librerías se compilan para
> cada aparato; cada teléfono debe descargar las suyas con este comando.

**Paso 4.5 — Instalar las librerías de la app:**
```bash
cd ~/restaurant-pos/client && npm install
```
Igual que el anterior, unos minutos más.

---

## PARTE 5 — Prender todo (modo desarrollo)

Necesitas **dos sesiones** de Termux (una para cada programa).

**Cómo abrir una segunda sesión:** en Termux, **desliza el dedo desde el
borde izquierdo** de la pantalla hacia adentro → se abre un menú →
toca **"New session"**. Para cambiar entre sesiones, repite el gesto y
toca la sesión que quieras. Cada sesión es independiente.

**Sesión 1 — El servidor:**
```bash
cd ~/restaurant-pos/server && npm run dev
```
*Qué hace:* prende el servidor con recarga automática. Debe mostrar algo
como `Servidor ... en el puerto 3001` y quedarse ahí "trabajando".
**No cierres esta sesión.** Si la cierras, la app deja de guardar ventas.

**Sesión 2 — La app:**
```bash
cd ~/restaurant-pos/client && npm run dev
```
*Qué hace:* prende la app en modo desarrollo. Mostrará una dirección como
`http://localhost:5173/`.

**Abrir la app:** abre **Chrome** en el teléfono y escribe en la barra de
direcciones:
```
http://localhost:5173
```
¡Ahí está tu punto de venta funcionando! Prueba agregar productos,
cobrar y revisar Ventas y Registro.

> `localhost` significa "este mismo teléfono". El servidor y la app se
> hablan entre ellos dentro del teléfono, sin necesidad de internet.

---

## PARTE 6 — Compilar la versión FINAL (producción)

La versión de desarrollo es para probar. La **versión final** es la
compilada: más rápida y en un solo programa.

**Paso 6.1 — Compilar la app (el "build"):**
```bash
cd ~/restaurant-pos/client && npm run build
```
*Qué hace:* "compila" la app: revisa que el código no tenga errores y
genera la versión optimizada en la carpeta `client/dist`. Tarda 1–2
minutos. Si termina sin errores en rojo, quedó bien.

**Paso 6.2 — Compilar el servidor:**
```bash
cd ~/restaurant-pos/server && npm run build
```

**Paso 6.3 — Prender la versión final (un solo programa):**
```bash
cd ~/restaurant-pos/server && npm start
```
*Qué hace:* el servidor ahora **también entrega la app compilada**,
así que ya no necesitas la sesión 2. Abre en Chrome:
```
http://localhost:3001
```
Esta es la versión que usarías en el negocio día a día: un solo comando
para prender todo.

> Para apagar: en la sesión de Termux pulsa **Ctrl + C**
> (subir volumen + C en el teclado de Termux) y el programa se detiene.

---

## RUTA 1 — APK instalable compilado en la nube (GitHub Actions)

Con esta ruta obtienes un **APK instalable** de "Añejo y Harina" sin
necesitar computador: GitHub lo compila en sus servidores con el Android
SDK configurado en `minSdk 33` (Android 13) y `targetSdk 34` (Android 14).
El APK es de depuración (debug): se instala directo en el teléfono.

> **Arquitectura (importante):** el APK solo lleva el punto de venta (lo
> visual). El servidor con la base de datos de ventas sigue corriendo
> aparte —por ejemplo en Termux con `npm start` (Parte 6)—. En la app,
> ve a **Ajustes → Dirección del servidor** y escribe dónde está el
> servidor:
> - `http://localhost:3001` → si el servidor corre en **este mismo
>   teléfono**.
> - `http://192.168.1.50:3001` → si el servidor corre en **otro aparato
>   de la misma WiFi** (cambia `192.168.1.50` por la IP real de ese
>   aparato; la ves con el comando `ifconfig` en su Termux, o en
>   *Ajustes → WiFi → detalles de la red*).

### Paso A — Crear el repositorio en GitHub (navegador del teléfono)

1. En Chrome entra a **github.com** e inicia sesión con tu cuenta.
2. Toca el **+** (arriba a la derecha) → **New repository**.
3. **Repository name:** escribe por ejemplo `anyejo-y-harina-pos`.
4. Déjalo en **Public** (así el Actions es gratis sin límites).
5. **NO** marques "Add a README file". Toca **Create repository**.
6. GitHub te muestra una página con instrucciones. **No cierres esa
   pestaña**: ahí verás la dirección del repo, algo como
   `https://github.com/TU_USUARIO/anyejo-y-harina-pos.git`.
   Apunta tu **nombre de usuario** (TU_USUARIO).

### Paso B — Crear un token de acceso (la "contraseña" para subir código)

GitHub ya no acepta tu contraseña normal para subir código; se usa un
**token** (una clave larga que generas una vez):

1. En github.com toca tu **foto de perfil** (arriba a la derecha) →
   **Settings**.
2. Baja hasta el final del menú izquierdo → **Developer settings**.
3. **Personal access tokens** → **Tokens (classic)**.
4. **Generate new token** → **Generate new token (classic)**.
5. **Note:** escribe `Termux Moto G32` (para saber dónde lo usas).
6. **Expiration:** elige `90 days` (o sin fecha si prefieres).
7. Marca la casilla **`repo`** (da acceso a tus repositorios).
8. Baja y toca **Generate token**.
9. **Copia el token** (empieza con `ghp_...`) y guárdalo en un lugar
   seguro (una nota del teléfono). **No lo pierdas**: GitHub no te lo
   muestra dos veces.

### Paso C — Instalar git en Termux y subir el proyecto

En **Termux** (el Moto G32):

**C.1 — Instalar git:**
```bash
pkg install git -y
```
*Qué hace:* instala git, el programa para subir el código a GitHub.

**C.2 — Ir a la carpeta del proyecto:**
```bash
cd ~/restaurant-pos
```

**C.3 — Inicializar el repositorio local:**
```bash
git init -b main
```
*Qué hace:* convierte la carpeta en un repositorio git con rama
principal llamada `main`.

**C.4 — Agregar todos los archivos:**
```bash
git add .
```
*Qué hace:* marca todos los archivos para el primer guardado. (El
archivo `.gitignore` evita que se suban cosas pesadas como
`node_modules` o la base de datos.)

**C.5 — Hacer el primer commit (guardado):**
```bash
git commit -m "Añejo y Harina POS"
```
*Qué hace:* guarda una foto del proyecto con ese mensaje. Si git te
pide tu nombre y correo, configúralos una vez:
```bash
git config --global user.name "TU_USUARIO"
git config --global user.email "tu_correo@ejemplo.com"
```
y repite el `git commit`.

**C.6 — Conectar con tu repositorio de GitHub:**
```bash
git remote add origin https://github.com/TU_USUARIO/anyejo-y-harina-pos.git
```
*Qué hace:* le dice a git dónde está tu repo en la nube. **Cambia
`TU_USUARIO` por tu usuario real** y `anyejo-y-harina-pos` por el
nombre que le pusiste al repo en el Paso A.

**C.7 — Subir el código:**
```bash
git push -u origin main
```
*Qué hace:* sube todo a GitHub. Te pedirá:
- **Username:** tu usuario de GitHub (escríbelo y pulsa Enter).
- **Password:** aquí **pegas el token** del Paso B (no tu contraseña;
  al pegarlo no se ve nada en pantalla, es normal) y pulsas Enter.

Si todo sale bien verás líneas terminando en `done` y un resumen.
¡El código ya está en la nube!

### Paso D — La compilación automática (no tienes que hacer nada)

1. Al subir el código, GitHub **detecta el archivo
   `.github/workflows/build-apk.yml` y empieza a compilar solo**.
2. En el navegador ve a tu repositorio → pestaña **Actions**.
   Verás una ejecución llamada "Compilar APK" en amarillo (trabajando).
3. Espera unos **5–10 minutos** (instala Java, Node, compila).
   Recarga la página hasta que el círculo se ponga **verde ✓**.
   - Si sale rojo ✗, toca la ejecución para ver qué paso falló.

### Paso E — Descargar e instalar el APK

1. En la ejecución verde, baja hasta **Artifacts** → toca
   **`anyejo-y-harina-apk`**. Se descarga un ZIP.
2. Descomprime el ZIP (con la app **Archivos** del teléfono o en
   Termux con `unzip`) → adentro está **`app-debug.apk`**.
3. Tócalo para instalar. Android avisará *"instalar apps desconocidas"*
   → **Permitir** → **Instalar**.
4. Abre la app **"Añejo y Harina"** desde el cajón de aplicaciones.
5. Ve a **Ajustes → Dirección del servidor** y configura dónde está tu
   servidor (ver el recuadro de arquitectura arriba). ¡Listo!

> **Cada vez que quieras actualizar el APK** (cambios de precios, menú,
> etc.): edita los archivos, y en Termux ejecuta
> `git add . && git commit -m "descripción del cambio" && git push`.
> GitHub compila un APK nuevo solo. Descárgalo e instálalo encima.

---

## PARTE 7 — ¿Y lo de Android 13 y Android 14?

Pregunta honesta, respuesta honesta:

- **La app es web**: funciona en el navegador (Chrome) de **cualquier**
  Android — 13, 14, 15 — sin compilar nada especial. Lo que hiciste
  arriba ya corre en esos teléfonos.
- **Si quieres que aparezca como app instalada** (con su icono), no
  necesitas compilar nada: abre la app en Chrome → toca el menú **⋮**
  (arriba a la derecha) → **"Agregar a pantalla de inicio"** o
  **"Instalar aplicación"**. Queda instalada como PWA y abre a pantalla
  completa, igual que una app normal. Funciona en Android 13 y 14+.
- **Un APK de verdad** (archivo instalable) **no se puede compilar
  dentro de Termux** de forma práctica: exige el Android SDK y Java,
  que son muy pesados para un teléfono. Si lo quieres, el camino real
  es envolver la app con **Capacitor** y compilar el APK en la nube
  (GitHub Actions) o en un PC con Android Studio, configurado con
  `minSdk 33` (Android 13) y `targetSdk 34` (Android 14). Dime y lo
  armamos como siguiente paso.

---

## Solución de problemas comunes

| Problema | Solución |
|---|---|
| `command not found` | No instalaste ese programa. Ej: `pkg install nodejs -y` |
| `npm install` se queda pegado o falla | Revisa el WiFi e inténtalo de nuevo. Con datos móviles puede fallar por cortes. |
| La app no abre en Chrome | Verifica que las sesiones de Termux sigan corriendo (desliza desde la izquierda y míralas). |
| `EADDRINUSE` / puerto ocupado | Ya hay un servidor prendido. Ciérralo con Ctrl+C o ejecuta `pkill -f "tsx src/index.ts"` y `pkill -f vite`. |
| Termux se cierra solo | Ejecuta `termux-wake-lock` (Parte 2.6) y desactiva la optimización de batería para Termux en *Ajustes → Apps → Termux → Batería → Sin restricciones*. |
| `node -v` muestra versión menor a 22 | Ejecuta `pkg update && pkg upgrade -y` de nuevo. |
| Quieres empezar de cero la base de datos | Borra el archivo: `rm ~/restaurant-pos/server/pos.db` y vuelve a prender el servidor (se recrea sola). |

---

*Guía generada para el proyecto Añejo y Harina · Punto de venta
(Vite + React + Express + SQLite).*
