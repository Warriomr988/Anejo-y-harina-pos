// Navegación móvil del terminal POS: cápsula flotante con las 5 secciones y
// botón destacado "Pedido" con insignia de conteo. El resaltado de la pestaña
// activa es un indicador "liquid glass" que se desliza entre pestañas.
// Solo visible en pantallas pequeñas (ver .mobile-nav en styles.css).
import { NAV } from './Sidebar';
import type { TabId } from '../data/menu';
import { useSlidingIndicator } from './useSlidingIndicator';

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
  cartCount: number;
  onPedido: () => void;
}

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export default function MobileNav({ active, onChange, cartCount, onPedido }: Props) {
  const { containerRef, setItemRef, rect } = useSlidingIndicator<HTMLDivElement>(active);

  return (
    <nav className="mobile-nav" aria-label="Navegación principal">
      <div className="mnav-tabs" ref={containerRef}>
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
            className={`mnav-item${active === item.id ? ' active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className="mnav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="mnav-label">{item.label}</span>
          </button>
        ))}
      </div>
      <button type="button" className="mnav-order" onClick={onPedido}>
        <CartIcon />
        <span>Pedido</span>
        <span className="mnav-badge">{cartCount}</span>
      </button>
    </nav>
  );
}
