// Resolución de la URL base de la API.
//
// Orden de resolución:
//  1. `localStorage.getItem('serverUrl')` — la dirección que el usuario
//     configuró en Ajustes → "Dirección del servidor".
//  2. `import.meta.env.VITE_API_URL` — variable de entorno en compilación
//     (útil para apuntar a un servidor fijo en el APK).
//  3. Si la app corre empaquetada con Capacitor (`capacitor://`), el origen
//     propio no sirve: se usa `http://localhost:3001` por defecto.
//  4. En web normal (navegador / Termux) se usan rutas relativas (mismo
//     origen), que el proxy de Vite o Express resuelven.
//
// Ejemplos de `serverUrl` válido:
//  - `http://localhost:3001`  → el servidor corre en este mismo teléfono.
//  - `http://192.168.1.50:3001` → el servidor corre en otro aparato
//    de la misma red WiFi (cambia la IP por la del aparato servidor).

const STORAGE_KEY = 'serverUrl';

export function getServerUrl(): string {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim().replace(/\/+$/, '');
  } catch {
    /* localStorage no disponible: se sigue con las demás opciones */
  }
  const env = (import.meta as unknown as { env?: Record<string, string> }).env;
  if (env?.VITE_API_URL && env.VITE_API_URL.trim()) {
    return env.VITE_API_URL.trim().replace(/\/+$/, '');
  }
  if (window.location.protocol === 'capacitor:') return 'http://localhost:3001';
  return '';
}

export function setServerUrl(url: string): void {
  try {
    const clean = url.trim().replace(/\/+$/, '');
    if (clean) window.localStorage.setItem(STORAGE_KEY, clean);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* sin localStorage no hay nada que persistir */
  }
}

/** Construye la URL completa para un endpoint, p. ej. apiUrl('/api/menu'). */
export function apiUrl(path: string): string {
  const base = getServerUrl();
  return base ? `${base}${path}` : path;
}
