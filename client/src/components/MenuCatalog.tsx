// Vista MENÚ: catálogo completo agrupado por categoría, con buscador.
import { useMemo, useState } from 'react';
import DishVisual from './DishVisual';
import {
  CATEGORIES,
  formatPrice,
  type Dish,
} from '../data/menu';

interface Props {
  dishes: Dish[];
}

export default function MenuCatalog({ dishes }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dishes;
    return dishes.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    );
  }, [dishes, query]);

  return (
    <div className="screen">
      <header className="screen-header">
        <h1>Menú</h1>
        <p className="screen-sub">
          {filtered.length} producto{filtered.length === 1 ? '' : 's'} · precios en pesos colombianos
        </p>
      </header>

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
      </div>

      {CATEGORIES.map((cat) => {
        const items = filtered.filter((d) => d.categoryId === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="catalog-group">
            <h2>
              <span aria-hidden="true">{cat.icon}</span> {cat.name}
            </h2>
            <ul className="catalog-list">
              {items.map((d) => (
                <li key={d.id} className="catalog-item">
                  <div className="catalog-thumb" aria-hidden="true">
                    <DishVisual kind={d.visual} />
                  </div>
                  <div className="catalog-info">
                    <h3>{d.name}</h3>
                    <p>{d.description}</p>
                  </div>
                  <span className="catalog-price">{formatPrice(d.price)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
