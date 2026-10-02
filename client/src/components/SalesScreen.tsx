// Vista VENTAS: registro de ventas con filtro por periodo, tarjetas de
// resumen, ventas recientes (acordeón con el detalle de cada venta) y
// tabla por producto.
import { useEffect, useState } from 'react';
import { apiUrl } from '../api';
import { formatPrice } from '../data/menu';

type Periodo = 'hoy' | 'semana' | 'todo';

interface ProductoRow {
  nombre: string;
  productoId: string;
  cantidad: number;
  total: number;
}

interface CategoriaRow {
  categoria: string;
  cantidad: number;
  total: number;
}

interface Resumen {
  periodo: Periodo;
  total: number;
  pedidos: number;
  empanadasVendidas: number;
  cafesVendidos: number;
  porProducto: ProductoRow[];
  porCategoria: CategoriaRow[];
}

interface SaleItem {
  dishId: string;
  name: string;
  qty: number;
  price: number;
}

interface Sale {
  id: number;
  type: string;
  table_label: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  pagado_con: number | null;
  cambio: number | null;
  status: string;
  created_at: string;
  items: SaleItem[];
}

const PERIODS: Array<{ id: Periodo; label: string }> = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'todo', label: 'Todo' },
];

const TYPE_LABEL: Record<string, string> = {
  domicilio: 'Domicilio',
  mesa: 'Mesa',
  llevar: 'Para llevar',
};

function saleNumber(id: number): string {
  return `Venta #${String(id).padStart(3, '0')}`;
}

function formatTime(iso: string): string {
  // created_at viene en UTC ("YYYY-MM-DD HH:MM:SS"); se muestra en hora local.
  const d = new Date(`${iso.replace(' ', 'T')}Z`);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function saleTypeLabel(s: Sale): string {
  const base = TYPE_LABEL[s.type] ?? s.type;
  if (s.type === 'mesa' && s.table_label) return `${base} ${s.table_label}`;
  return base;
}

function saleUnits(s: Sale): number {
  return s.items.reduce((n, i) => n + i.qty, 0);
}

export default function SalesScreen({ active = true }: { active?: boolean }) {
  const [periodo, setPeriodo] = useState<Periodo>('hoy');
  const [data, setData] = useState<Resumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Los datos viven en el estado del componente y solo se recargan desde la
  // API (SQLite): ni el scroll, ni los re-renders, ni cambiar de pestaña los
  // borran. Al volver a esta pestaña se refrescan para incluir ventas nuevas.
  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setError(false);
    fetch(apiUrl(`/api/ventas/resumen?periodo=${periodo}`))
      .then((r) => {
        if (!r.ok) throw new Error('API no disponible');
        return r.json() as Promise<Resumen>;
      })
      .then((d) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    // Ventas recientes: el detalle de cada venta (sus ítems) viene incluido.
    // No se limpia la lista mientras se recarga: si la petición falla, se
    // conservan los datos ya cargados.
    fetch(apiUrl('/api/orders'))
      .then((r) => (r.ok ? (r.json() as Promise<{ orders: Sale[] }>) : { orders: [] }))
      .then((d) => setSales((d.orders ?? []).filter((o) => o.status !== 'cancelado')))
      .catch(() => {});
  }, [periodo, active]);

  const empanadas = data?.empanadasVendidas ?? 0;
  const cafes = data?.cafesVendidos ?? 0;

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>Ventas</h1>
        <p className="screen-sub">Registro de ventas del terminal</p>
      </header>

      <div className="period-filter" role="group" aria-label="Periodo">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`pill${periodo === p.id ? ' active' : ''}`}
            onClick={() => setPeriodo(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && <p className="muted">Cargando ventas…</p>}
      {error && (
        <p className="form-error">
          No se pudo conectar con el servidor. Revisa que el backend esté corriendo.
        </p>
      )}

      {!loading && !error && data && (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <span className="stat-label">Total vendido</span>
              <strong className="stat-value">{formatPrice(data.total)}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">N.º de pedidos</span>
              <strong className="stat-value">{data.pedidos}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Empanadas vendidas</span>
              <strong className="stat-value">🥟 {empanadas}</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">Cafés vendidos</span>
              <strong className="stat-value">☕ {cafes}</strong>
            </div>
          </div>

          <h2 className="section-title">Ventas recientes</h2>
          {sales.length === 0 ? (
            <p className="muted">Aún no hay ventas registradas.</p>
          ) : (
            <div className="sales-list">
              {sales.map((s) => {
                const open = expandedId === s.id;
                const units = saleUnits(s);
                return (
                  <div key={s.id} className="sale-card">
                    <button
                      type="button"
                      className="sale-head"
                      onClick={() => setExpandedId(open ? null : s.id)}
                      aria-expanded={open}
                    >
                      <span className="sale-head-text">
                        <span className="sale-title">
                          {saleNumber(s.id)} · {saleTypeLabel(s)}
                        </span>
                        <span className="sale-sub">
                          {formatTime(s.created_at)} · {units}{' '}
                          {units === 1 ? 'unidad' : 'unidades'}
                          {s.cambio != null && s.cambio > 0 && (
                            <> · cambio {formatPrice(s.cambio)}</>
                          )}
                        </span>
                      </span>
                      <span className="sale-head-right">
                        <strong className="sale-total">{formatPrice(s.total)}</strong>
                        <span className={`sale-chevron${open ? ' open' : ''}`} aria-hidden="true">
                          ▾
                        </span>
                      </span>
                    </button>
                    {open && (
                      <div className="sale-detail">
                        <p className="sale-detail-title">Lo que pidió la mesa:</p>
                        <ul className="sale-items">
                          {s.items.map((i, idx) => (
                            <li key={idx} className="sale-item">
                              <span>
                                {i.name} × {i.qty}
                              </span>
                              <span className="num">{formatPrice(i.qty * i.price)}</span>
                            </li>
                          ))}
                        </ul>
                        {(s.pagado_con != null || s.cambio != null) && (
                          <p className="sale-pay">
                            {s.pagado_con != null && <>Pagó con {formatPrice(s.pagado_con)}</>}
                            {s.pagado_con != null && s.cambio != null && s.cambio > 0 && ' · '}
                            {s.cambio != null && s.cambio > 0 && (
                              <>Cambio {formatPrice(s.cambio)}</>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <h2 className="section-title">Ventas por producto</h2>
          {data.porProducto.length === 0 ? (
            <p className="muted">No hay ventas en este periodo.</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className="num">Cantidad</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.porProducto.map((p) => (
                    <tr key={p.productoId}>
                      <td>{p.nombre}</td>
                      <td className="num">{p.cantidad}</td>
                      <td className="num">{formatPrice(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
