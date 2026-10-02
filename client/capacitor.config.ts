import type { CapacitorConfig } from '@capacitor/cli';

// Configuración de Capacitor: empaqueta el frontend compilado (client/dist)
// como APK de Android. El servidor Express/SQLite NO va en el APK: sigue
// corriendo aparte (p. ej. en Termux) y la app se conecta a él mediante la
// "Dirección del servidor" de Ajustes.
const config: CapacitorConfig = {
  appId: 'com.anyejoyharina.pos',
  appName: 'Añejo y Harina',
  webDir: 'dist',
};

export default config;
