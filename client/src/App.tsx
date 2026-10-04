// Terminal POS de escritorio "Añejo y Harina": barra lateral, terminal de
// venta (buscador + productos + resumen del pedido), catálogo, pedidos,
// ventas y ajustes. El carrito vive en el estado de React; el menú se carga
// de /api/menu con respaldo local si el servidor no responde.
import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from './api';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import ProductGrid from './components/ProductGrid';
import OrderPanel from './components/OrderPanel';
import CashModal, { type PaidOrder } from './components/CashModal';
import MenuCatalog from './components/MenuCatalog';
import OrdersScreen from './components/OrdersScreen';
import SalesScreen from './components/SalesScreen';
import RegistroScreen from './components/RegistroScreen';
import SettingsScreen from './components/SettingsScreen';
import {
  CATEGORIES,
  MENU_DISHES,
  type CartItem,
  type Dish,
  type TabId,
} from './data/menu';

export default function App() {
  const [tab, setTab] = useState<TabId>('inicio');
  const [dishes, setDishes] = useState<Dish[]>(MENU_DISHES);
  const [apiDown, setApiDown] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState('');
  const [tableLabel, setTableLabel] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('todo');
  const [cashOpen, setCashOpen] = useState(false);

  // Carga el menú desde la API; si falla, usa los datos locales.
  useEffect(() => {
    fetch(apiUrl('/api/menu'))
      .then((r) => {
        if (!r.ok) throw new Error('API no disponible');
        return r.json() as Promise<{ dishes: Dish[] }>;
      })
      .then((data) => {
        if (Array.isArray(data.dishes) && data.dishes.length > 0) {
          // Normaliza: los servidores antiguos no envían includesEmpanadas.
          setDishes(
            data.dishes.map((d) => ({ ...d, includesEmpanadas: d.includesEmpanadas ?? 0 })),
          );
        }
      })
      .catch(() => setApiDown(true));
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  const visibleDishes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes.filter((d) => {
      const okCat = category === 'todo' || d.categoryId === category;
      const okQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q);
      return okCat && okQuery;
    });
  }, [dishes, query, category]);

  const total = useMemo(() => {
    const subtotal = cart.reduce((s, i) => s + i.dish.price * i.qty, 0);
    return subtotal;
  }, [cart]);

  function addToCart(dish: Dish) {
    setCart((prev) => {
      const found = prev.find((i) => i.dish.id === dish.id);
      if (found) {
        return prev.map((i) => (i.dish.id === dish.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { dish, qty: 1 }];
    });
  }

  function changeQty(dishId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.dish.id === dishId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }

  function removeItem(dishId: string) {
    setCart((prev) => prev.filter((i) => i.dish.id !== dishId));
  }

  function handlePaid(_order: PaidOrder) {
    setCart([]);
    setNote('');
    setTableLabel('');
  }

  // El botón "Pedido" de la navegación móvil: vuelve al terminal de venta y
  // baja hasta el resumen del pedido.
  function handlePedido() {
    setTab('inicio');
    setTimeout(() => {
      document
        .querySelector('.order-panel')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }

  return (
    <div className="pos">
      <Sidebar active={tab} onChange={setTab} pendingCount={cartCount} />
      <MobileNav
        active={tab}
        onChange={setTab}
        cartCount={cartCount}
        onPedido={handlePedido}
      />

      <div className="pos-main">
        {apiDown && (
          <p className="offline-banner">
            Modo sin conexión: el servidor no responde, se muestra el menú guardado.
          </p>
        )}

        {/* Las pantallas se mantienen MONTADAS y solo se ocultan: así el
            estado (listas de ventas, filas desplegadas, posición de scroll)
            nunca se pierde al cambiar de pestaña ni al hacer scroll.
            Cada pantalla recarga sus datos de la API (SQLite) al activarse. */}
        <div className="tab-pane" hidden={tab !== 'inicio'}>
        {tab === 'inicio' && (
          <div className="terminal">
            <div className="terminal-main">
              <div className="topbar">
                <div className="search">
                  <span aria-hidden="true">🔍</span>
                  <input
                    type="search"
                    placeholder="Buscar un producto…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="btn-filter"
                  onClick={() => setCategory('todo')}
                  title="Mostrar todas las categorías"
                >
                  ☰ Filtrar
                </button>
              </div>

              <div className="category-pills" role="group" aria-label="Categorías">
                <button
                  type="button"
                  className={`pill${category === 'todo' ? ' active' : ''}`}
                  onClick={() => setCategory('todo')}
                >
                  Todo
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`pill${category === c.id ? ' active' : ''}`}
                    onClick={() => setCategory(c.id)}
                  >
                    <span aria-hidden="true">{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>

              <ProductGrid
                dishes={visibleDishes}
                cart={cart}
                onAdd={addToCart}
                onQty={changeQty}
              />
            </div>

            <OrderPanel
              cart={cart}
              note={note}
              onNote={setNote}
              onQty={changeQty}
              onRemove={removeItem}
              tableLabel={tableLabel}
              onTableLabel={setTableLabel}
              onCheckout={() => setCashOpen(true)}
            />
          </div>
        )}
        </div>

        <div className="tab-pane" hidden={tab !== 'menu'}>
          <MenuCatalog dishes={dishes} />
        </div>
        <div className="tab-pane" hidden={tab !== 'pedidos'}>
          <OrdersScreen active={tab === 'pedidos'} />
        </div>
        <div className="tab-pane" hidden={tab !== 'ventas'}>
          <SalesScreen active={tab === 'ventas'} />
        </div>
        <div className="tab-pane" hidden={tab !== 'registro'}>
          <RegistroScreen active={tab === 'registro'} />
        </div>
        <div className="tab-pane" hidden={tab !== 'ajustes'}>
          <SettingsScreen />
        </div>
      </div>

      {cashOpen && (
        <CashModal
          cart={cart}
          total={total}
          orderType="mesa"
          tableLabel={tableLabel}
          note={note}
          onClose={() => setCashOpen(false)}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
}
