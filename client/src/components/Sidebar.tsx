// Barra lateral del terminal POS: logo y navegación principal.
// La pestaña activa usa el mismo indicador "liquid glass" deslizante
// que la navegación móvil (ver useSlidingIndicator).
import { RESTAURANT_NAME, type TabId } from '../data/menu';
import { useSlidingIndicator } from './useSlidingIndicator';

export const NAV: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' },
  { id: 'menu', label: 'Menú', icon: '📖' },
  { id: 'pedidos', label: 'Mis pedidos', icon: '🧾' },
  { id: 'ventas', label: 'Ventas', icon: '📊' },
  { id: 'registro', label: 'Registro', icon: '🗓️' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
];

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  pendingCount: number;
}

export default function Sidebar({ active, onChange, pendingCount }: Props) {
  const { containerRef, setItemRef, rect } = useSlidingIndicator<HTMLElement>(active);

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-icon" aria-hidden="true">
          ☕
        </span>
        <span className="brand-name">{RESTAURANT_NAME}</span>
      </div>
      <nav className="nav" ref={containerRef}>
        <span
          className="pill-indicator"
          aria-hidden="true"
          style={{
            transform: `translate(${rect.x}px, ${rect.y}px)`,
            width: rect.w,
            height: rect.h,
          }}
        />
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            ref={setItemRef(item.id)}
            className={`nav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {item.id === 'inicio' && pendingCount > 0 && (
              <span className="nav-badge">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <span className="dot" aria-hidden="true" />
        Terminal POS · Caja
      </div>
    </aside>
  );
}
