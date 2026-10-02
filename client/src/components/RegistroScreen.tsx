// Vista REGISTRO: registro diario persistente de ventas.
// Un renglón por día (fecha, n.º de ventas, total); al tocar un día se
// despliega cada venta con TODOS sus datos: hora, mesa, tipo, ítems con
// cantidad y precio, subtotal, descuento, domicilio, total, pagó con y cambio.
// Los datos viven en SQLite de forma permanente (se acumulan día tras día) y
// se guardan en estado estable del componente: ni el scroll, ni los
// re-renders, ni cambiar de pestaña los borran.
import { useEffect, useState } from 'react';
import { apiUrl } from '../api';
import { formatPrice } from '../data/menu';

interface DiaRow {
  fecha: string; // "YYYY-MM-DD"
  numVentas: number;
  total: number;
  unidades: number;
}

interface VentaItem {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface Venta {
  id: number;
  hora: string;
  mesa: string;
  tipo: string;
  nota: string;
  items: VentaItem[];
  subtotal: number;
  descuento: number;
  domicilio: number;
  total: number;
  pagadoCon: number | null;
  cambio: number | null;
}

interface DiaDetalle {
  fecha: string;
  resumen: {
    total: number;
    numVentas: number;
    unidades: number;
    empanadasVendidas: number;
    cafesVendidos: number;
  };
  ventas: Venta[];
}

const TYPE_LABEL: Record<string, string> = {
  domicilio: 'Domicilio',
  mesa: 'Mesa',
  llevar: 'Para llevar',
};

function formatFecha(fecha: string): string {
  // "2026-10-02" → "viernes, 2 de octubre de 2026" (mediodía evita desfases de zona horaria)
  const d = new Date(`${fecha}T12:00:00`);
  const s = d.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function saleNumber(id: number): string {
  return `Venta #${String(id).padStart(3, '0')}`;
}

function tipoLabel(v: Venta): string {
  const base = TYPE_LABEL[v.tipo] ?? v.tipo;
  if (v.tipo === 'mesa' && v.mesa) return `${base} ${v.mesa}`;
  return base;
}

export default function RegistroScreen({ active = true }: { active?: boolean }) {
  const [dias, setDias] = useState<DiaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedFecha, setExpandedFecha] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Record<string, DiaDetalle>>({});
  const [loadingDia, setLoadingDia] = useState<string | null>(null);

  // Lista de días: se carga de la API al montar y se refresca al volver a
  // la pestaña. Si la recarga falla, se conservan los días ya cargados.
  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError(false);
    fetch(apiUrl('/api/ventas/dias'))
      .then((r) => {
        if (!r.ok) throw new Error('API no disponible');
        return r.json() as Promise<{ dias: DiaRow[] }>;
      })
      .then((d) => setDias(d.dias ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [active]);

  function toggleDia(fecha: string) {
    if (expandedFecha === fecha) {
      setExpandedFecha(null);
      return;
    }
    setExpandedFecha(fecha);
    if (!detalle[fecha] && loadingDia !== fecha) {
      setLoadingDia(fecha);
      fetch(apiUrl(`/api/ventas/dia/${fecha}`))
        .then((r) => {
          if (!r.ok) throw new Error('API no disponible');
          return r.json() as Promise<DiaDetalle>;
        })
        .then((d) => setDetalle((prev) => ({ ...prev, [fecha]: d })))
        .catch(() => {})
        .finally(() => setLoadingDia(null));
    }
  }

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>Registro</h1>
        <p className="screen-sub">
          Registro diario de ventas — se guarda día a día en la base de datos
        </p>
      </header>

      {loading && <p className="muted">Cargando registro…</p>}
      {error && (
        <p className="form-error">
          No se pudo conectar con el servidor. Revisa que el backend esté corriendo.
        </p>
      )}

      {!loading && !error && dias.length === 0 && (
        <p className="muted">Aún no hay días registrados. Las ventas aparecerán aquí.</p>
      )}

      {!loading && !error && dias.length > 0 && (
        <div className="sales-list">
          {dias.map((d) => {
            const open = expandedFecha === d.fecha;
            const det = detalle[d.fecha];
            return (
              <div key={d.fecha} className="sale-card">
                <button
                  type="button"
                  className="sale-head"
                  onClick={() => toggleDia(d.fecha)}
                  aria-expanded={open}
                >
                  <span className="sale-head-text">
                    <span className="sale-title">🗓️ {formatFecha(d.fecha)}</span>
                    <span className="sale-sub">
                      {d.numVentas} {d.numVentas === 1 ? 'venta' : 'ventas'} ·{' '}
                      {d.unidades} {d.unidades === 1 ? 'unidad' : 'unidades'}
                    </span>
                  </span>
                  <span className="sale-head-right">
                    <strong className="sale-total">{formatPrice(d.total)}</strong>
                    <span className={`sale-chevron${open ? ' open' : ''}`} aria-hidden="true">
                      ▾
                    </span>
                  </span>
                </button>

                {open && (
                  <div className="sale-detail">
                    {loadingDia === d.fecha && !det && (
                      <p className="muted">Cargando ventas del día…</p>
                    )}
                    {det && (
                      <>
                        <div className="stat-cards stat-cards-sm">
                          <div className="stat-card">
                            <span className="stat-label">Total del día</span>
                            <strong className="stat-value">{formatPrice(det.resumen.total)}</strong>
                          </div>
                          <div className="stat-card">
                            <span className="stat-label">Ventas</span>
                            <strong className="stat-value">{det.resumen.numVentas}</strong>
                          </div>
                          <div className="stat-card">
                            <span className="stat-label">Empanadas</span>
                            <strong className="stat-value">🥟 {det.resumen.empanadasVendidas}</strong>
                          </div>
                          <div className="stat-card">
                            <span className="stat-label">Cafés</span>
                            <strong className="stat-value">☕ {det.resumen.cafesVendidos}</strong>
                          </div>
                        </div>

                        <p className="sale-detail-title">
                          Todas las ventas del {formatFecha(d.fecha).toLowerCase()}:
                        </p>
                        {det.ventas.length === 0 ? (
                          <p className="muted">Sin ventas registradas.</p>
                        ) : (
                          <ul className="day-sales">
                            {det.ventas.map((v) => (
                              <li key={v.id} className="day-sale">
                                <p className="day-sale-head">
                                  <strong>
                                    {saleNumber(v.id)} · {tipoLabel(v)}
                                  </strong>
                                  <span className="num">{formatPrice(v.total)}</span>
                                </p>
                                <p className="muted">{v.hora}</p>
                                <ul className="sale-items">
                                  {v.items.map((i, idx) => (
                                    <li key={idx} className="sale-item">
                                      <span>
                                        {i.nombre} × {i.cantidad}
                                      </span>
                                      <span className="num">
                                        {formatPrice(i.cantidad * i.precio)}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                                <p className="sale-totals">
                                  Subtotal {formatPrice(v.subtotal)}
                                  {v.descuento > 0 && <> · Descuento {formatPrice(v.descuento)}</>}
                                  {v.domicilio > 0 && <> · Domicilio {formatPrice(v.domicilio)}</>}
                                </p>
                                {(v.pagadoCon != null || v.cambio != null) && (
                                  <p className="sale-pay">
                                    {v.pagadoCon != null && (
                                      <>Pagó con {formatPrice(v.pagadoCon)}</>
                                    )}
                                    {v.pagadoCon != null && v.cambio != null && v.cambio > 0 && ' · '}
                                    {v.cambio != null && v.cambio > 0 && (
                                      <>Cambio {formatPrice(v.cambio)}</>
                                    )}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
