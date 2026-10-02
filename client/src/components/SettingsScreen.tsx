// Vista AJUSTES: información del terminal y de la configuración editable.
import { useState } from 'react';
import { getServerUrl, setServerUrl } from '../api';
import {
  BILL_DENOMINATIONS,
  DELIVERY_FEE,
  RESTAURANT_NAME,
  RESTAURANT_TAGLINE,
  formatPrice,
} from '../data/menu';

export default function SettingsScreen() {
  const [serverInput, setServerInput] = useState(getServerUrl());
  const [serverSaved, setServerSaved] = useState(false);

  function saveServerUrl() {
    setServerUrl(serverInput);
    setServerSaved(true);
    window.setTimeout(() => setServerSaved(false), 2500);
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>Ajustes</h1>
        <p className="screen-sub">Configuración del terminal de caja</p>
      </header>

      <section className="settings-card">
        <h2>Dirección del servidor</h2>
        <p className="muted">
          Dónde está el servidor que guarda el menú y las ventas:
        </p>
        <ul className="muted" style={{ paddingLeft: '1.1rem', marginTop: 0 }}>
          <li>
            <code>http://localhost:3001</code> → el servidor corre en{' '}
            <strong>este mismo teléfono</strong> (Termux).
          </li>
          <li>
            <code>http://192.168.1.50:3001</code> → el servidor corre en{' '}
            <strong>otro aparato de la misma WiFi</strong> (cambia la IP por la
            del aparato servidor).
          </li>
        </ul>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <input
            className="note-input"
            type="url"
            inputMode="url"
            placeholder="http://localhost:3001"
            value={serverInput}
            onChange={(e) => {
              setServerInput(e.target.value);
              setServerSaved(false);
            }}
            style={{ flex: '1 1 220px' }}
            aria-label="Dirección del servidor"
          />
          <button type="button" className="btn-primary" onClick={saveServerUrl}>
            Guardar
          </button>
        </div>
        {serverSaved && (
          <p className="muted" style={{ color: 'var(--ok, #2e7d32)' }}>
            ✓ Dirección guardada. Se aplicará en la próxima carga de datos.
          </p>
        )}
        <p className="muted">
          Si lo dejas vacío, la app usa el servidor del mismo origen
          (navegador en Termux) o <code>http://localhost:3001</code> dentro
          del APK.
        </p>
      </section>

      <section className="settings-card">
        <h2>Restaurante</h2>
        <dl className="settings-list">
          <div>
            <dt>Nombre</dt>
            <dd>{RESTAURANT_NAME}</dd>
          </div>
          <div>
            <dt>Concepto</dt>
            <dd>{RESTAURANT_TAGLINE}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-card">
        <h2>Cobro en efectivo</h2>
        <p className="muted">
          Denominaciones de billetes disponibles en el modal de pago (editables en{' '}
          <code>client/src/data/menu.ts</code> → <code>BILL_DENOMINATIONS</code>):
        </p>
        <div className="bills bills-static">
          {BILL_DENOMINATIONS.map((b) => (
            <span key={b} className="bill">
              {formatPrice(b)}
            </span>
          ))}
        </div>
      </section>

      <section className="settings-card">
        <h2>Domicilios</h2>
        <dl className="settings-list">
          <div>
            <dt>Recargo por domicilio</dt>
            <dd>{formatPrice(DELIVERY_FEE)}</dd>
          </div>
        </dl>
        <p className="muted">
          Se cobra solo en pedidos tipo «Domicilio». Editable en{' '}
          <code>client/src/data/menu.ts</code> y <code>server/src/routes.ts</code> (deben
          coincidir).
        </p>
      </section>

      <section className="settings-card">
        <h2>Precios del menú</h2>
        <p className="muted">
          Los precios se editan en <code>client/src/data/menu.ts</code> y{' '}
          <code>server/src/seed.ts</code> (mantén ambas copias sincronizadas) y luego se
          sube <code>SEED_VERSION</code> en <code>server/src/seed.ts</code> para que el
          catálogo se actualice conservando el historial de pedidos.
        </p>
      </section>
    </div>
  );
}
