# Añejo y Harina · Terminal POS

Terminal punto de venta de escritorio para **Añejo y Harina** (empanadas y café
de Nariño, Pasto, Nariño): pantalla de venta con buscador, categorías y tarjetas
de producto, panel de resumen del pedido con tipos (Domicilio / En mesa /
Para llevar), cobro en efectivo con denominaciones de billetes colombianos y
cálculo de cambio, historial de pedidos y registro de ventas (total vendido,
empanadas y cafés vendidos, ventas por producto).

Todo el proyecto está en español y pensado para construirse y correrse en
**Termux (Android)** sin módulos nativos: el servidor usa `node:sqlite`
(incluido en Node 22+) y el cliente es Vite + React.

## Estructura

```
restaurant-pos/
├── README.md
├── package.json          # scripts raíz (dev:client, dev:server, ...)
├── client/               # Frontend: Vite + React + TypeScript (terminal de escritorio)
│   ├── public/img/       # <-- AQUÍ van las fotos de los productos
│   └── src/
│       ├── components/   # Sidebar, ProductGrid, OrderPanel, CashModal,
│       │                 # MenuCatalog, OrdersScreen, SalesScreen,
│       │                 # RegistroScreen, SettingsScreen, DishVisual
│       ├── data/menu.ts  # Menú + tipos + formato de moneda + constantes
│       ├── App.tsx       # Terminal POS: navegación, carrito en estado de React
│       └── styles.css    # Paleta cálida de café (marrón, caramelo, crema)
└── server/               # Backend: Express + TypeScript + node:sqlite
    └── src/
        ├── index.ts      # Arranque del servidor (puerto 3001)
        ├── db.ts         # Conexión SQLite, tablas y versionado de la semilla
        ├── seed.ts       # Menú de Añejo y Harina (5 categorías, 24 productos)
        └── routes.ts     # Rutas /api/... (menú, pedidos, resumen de ventas)
```

## Pantallas (barra lateral)

- **Inicio**: terminal de venta. Buscador + botón de filtro, categorías
  (Todo, Empanadas, Cafés, Bebidas calientes, Té e infusiones,
  Adiciones), tarjetas de producto (ilustración, nombre, precio y control de
  cantidad − / + cuando el producto ya está en el pedido, o botón «Añadir») y
  panel derecho «Resumen del pedido»: tipo de pedido
  (Domicilio / En mesa / Para llevar, con campo de mesa), líneas con cantidades,
  nota, totales y botón «Realizar pedido».
- **Menú**: catálogo completo agrupado por categoría, con buscador.
- **Mis pedidos**: historial de pedidos (fecha, tipo, ítems, total, pago y estado);
  al hacer clic en una fila se despliega el detalle: qué pidió la mesa
  (producto × cantidad — total de línea), mesa/tipo/fecha y pago con cambio.
  La lista se conserva al cambiar de pestaña y se recarga al volver.
- **Ventas**: registro de ventas con filtro Hoy / Semana / Todo. Tarjetas: total
  vendido, N.º de pedidos, empanadas vendidas y cafés vendidos; sección
  «Ventas recientes» donde cada venta se despliega para ver lo que pidió cada
  mesa (líneas, mesa, hora, pagó con y cambio); tabla de ventas por producto
  (cantidad y total en $).
- **Registro**: registro diario persistente. Un renglón por día (fecha,
  n.º de ventas, total); al tocar un día se despliega el resumen del día y
  cada venta con todos sus datos: hora, mesa, tipo, ítems con cantidad y
  precio, subtotal, descuento, domicilio, total, pagó con y cambio. Los datos
  se guardan día tras día en la base de datos SQLite y nunca se borran.
- **Ajustes**: información del restaurante, denominaciones de billetes y recargo
  de domicilio configurados.

## Cobro en efectivo

El botón «Realizar pedido» abre el modal de cobro:

1. Muestra el **Valor a pagar**.
2. En «Paga con» hay botones con todas las denominaciones de billetes
   colombianos ($1.000, $2.000, $5.000, $10.000, $20.000, $50.000, $100.000),
   cada clic suma al monto recibido; también hay campo de valor personalizado y
   botones «Exacto» y «Limpiar».
3. El **Cambio** se calcula en vivo (recibido − total). Si el monto es menor que
   el total, el botón se bloquea y muestra cuánto falta.
4. Al confirmar, el pedido se guarda con `pagadoCon` y `cambio` (el servidor los
   recalcula y rechaza montos insuficientes). La pantalla de éxito muestra
   Total, Pagó con y Cambio.

Las denominaciones se configuran en `client/src/data/menu.ts`
(`BILL_DENOMINATIONS`).

## Precios

La empanada de añejo con ají de maní cuesta **$500**. La categoría de cafés es
**«Cafés»** con 5 productos: Café negro $2.000, Café negro con 2 empanadas
$3.000 (combo), Café con leche $2.000, Café con leche con 2 empanadas $3.000
(combo) y Aromática $2.000. Las empanadas se mantienen ($500 y $3.500).

Los combos llevan `includesEmpanadas: 2` y esas empanadas **sí cuentan** en la
estadística «Empanadas vendidas» (el recaudo se atribuye al combo vendido).

Para cambiar precios: edita `client/src/data/menu.ts` y `server/src/seed.ts`
(mantén ambas copias sincronizadas) y sube `SEED_VERSION` en
`server/src/seed.ts`; al arrancar, el servidor actualiza el catálogo
**conservando el historial de pedidos**.

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/menu` | Productos con su categoría |
| GET | `/api/categories` | Categorías |
| GET | `/api/orders` | Pedidos con sus ítems |
| POST | `/api/orders` | Crea un pedido (recalcula totales; acepta `pagadoCon`) |
| PATCH | `/api/orders/:id` | Cambia el estado del pedido |
| GET | `/api/ventas/resumen?periodo=hoy\|semana\|todo` | Registro de ventas: total, pedidos, `empanadasVendidas` (incluye empanadas de combos), `cafesVendidos`, por producto y por categoría |
| GET | `/api/ventas/dias` | Registro diario: `[{fecha, numVentas, total, unidades}]`, más recientes primero (hora de Colombia) |
| GET | `/api/ventas/dia/:fecha` | Detalle de un día (`YYYY-MM-DD`): resumen del día + cada venta con todos sus datos (hora, mesa, tipo, ítems, subtotales, `pagadoCon`, `cambio`) |

Los registros de ventas y el registro diario se calculan siempre desde la
base de datos SQLite: los datos son permanentes y sobreviven reinicios. En el
cliente, las pantallas Ventas, Mis pedidos y Registro mantienen su estado
montado (no se desmontan al cambiar de pestaña) y recargan de la API al
activarse; ni el scroll ni los re-renders borran las listas.

## Requisitos

- Node.js 22 o superior (`node:sqlite` viene incluido; en Termux: `pkg install nodejs`).
- Dos sesiones de terminal (o `npm run dev` en la raíz con `concurrently`
  si lo instalas).

## Cómo correrlo en Termux

```bash
pkg install nodejs

# Sesión 1 — servidor (puerto 3001):
cd ~/workspace/restaurant-pos/server
npm install
npm run dev

# Sesión 2 — cliente (puerto 5173):
cd ~/workspace/restaurant-pos/client
npm install
npm run dev
```

Abre `http://localhost:5173` en el navegador. En modo desarrollo el cliente usa
un proxy: las llamadas a `/api/...` van al servidor en el puerto 3001.

Si el servidor no responde, el cliente muestra el menú guardado localmente con
un aviso de «Modo sin conexión».

## APK para Android (compilación en la nube)

El APK solo empaqueta el **frontend** (`client/dist`) con Capacitor. El
servidor Express/SQLite **no** va en el APK: sigue corriendo aparte
(p. ej. en Termux con `npm start`), y la app se conecta a él según la
**«Dirección del servidor»** de Ajustes (o la variable `VITE_API_URL`):

- Resolución de la URL de la API (`client/src/api.ts`): `localStorage`
  (`serverUrl`) → `VITE_API_URL` → `http://localhost:3001` si el esquema
  es `capacitor:` → rutas relativas en web.
- Config Capacitor: `client/capacitor.config.ts` (`appId`
  `com.anyejoyharina.pos`, `webDir: dist`); `vite.config.ts` usa
  `base: './'` para que los assets resuelvan bajo `capacitor://`.

El workflow `.github/workflows/build-apk.yml` compila en GitHub Actions
(push a `main` o manual): Node 22, JDK 17, `npm ci` + `npm run build`,
`npx cap add android`, fija `minSdkVersion = 33` (Android 13) /
`targetSdkVersion = 34` / `compileSdkVersion = 34` en
`android/variables.gradle`, `./gradlew assembleDebug`, y sube el APK
(debug) como artefacto `anyejo-y-harina-apk`. Guía paso a paso desde el
teléfono en `GUIA-TERMUX.md` → «RUTA 1».

## Fotos de los productos

Las tarjetas usan ilustraciones SVG dibujadas en código
(`client/src/components/DishVisual.tsx`). Para usar fotos reales:

1. Copia la foto a `client/public/img/` (p. ej. `empanada-anejo.jpg`).
2. En `client/src/data/menu.ts` pon `photo: 'empanada-anejo.jpg'` en el producto.

Si `photo` es `null`, se muestra la ilustración.

## Base de datos

El servidor crea `server/pos.db` al arrancar (tablas: `categories`, `dishes`,
`orders`, `order_items`). La tabla `orders` guarda `pagado_con` y `cambio` de
los pagos en efectivo; `dishes` guarda `includes_empanadas` (combos) y cada
línea de `order_items` guarda su `category_id` e `includes_empanadas` para que
las estadísticas de ventas no dependan del catálogo vigente. Puedes cambiar la
ruta con la variable `DB_PATH`.
