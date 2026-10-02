// Ilustraciones apetitosas dibujadas en SVG (sin imágenes externas).
// Cada producto del menú tiene un `visual` que elige la ilustración.
import { useId } from 'react';
import type { DishVisualKind } from '../data/menu';

function Steam({ light = false }: { light?: boolean }) {
  const c = light ? '#8A5A3B' : '#FFFFFF';
  return (
    <g stroke={c} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65">
      <path d="M43 20c-3-5 3-8 0-13" />
      <path d="M57 20c-3-5 3-8 0-13" opacity="0.7" />
    </g>
  );
}

/** Taza vista de lado con líquido del color indicado y extras opcionales. */
function Cup({
  liquid,
  foam = false,
  drizzle = false,
  crema = false,
  glass = false,
}: {
  liquid: string;
  foam?: boolean;
  drizzle?: boolean;
  crema?: boolean;
  glass?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const bodyFill = glass ? '#F3E7D3' : '#3E2723';
  return (
    <g>
      <defs>
        <linearGradient id={`liq-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquid} stopOpacity="0.95" />
          <stop offset="100%" stopColor={liquid} />
        </linearGradient>
      </defs>
      <Steam />
      {/* platillo */}
      <ellipse cx="50" cy="82" rx="30" ry="6" fill="#3E2723" opacity="0.12" />
      {/* asa */}
      <path
        d="M74 52c8 0 10 10 2 14"
        stroke={bodyFill}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
      {/* cuerpo */}
      <path
        d="M28 44h44l-6 30a6 6 0 0 1-6 5H40a6 6 0 0 1-6-5l-6-30z"
        fill={bodyFill}
      />
      {/* líquido */}
      <ellipse cx="50" cy="44" rx="22" ry="6" fill={`url(#liq-${uid})`} />
      {crema && <ellipse cx="50" cy="43" rx="13" ry="3.5" fill="#E8C99A" opacity="0.9" />}
      {foam && (
        <g>
          <ellipse cx="50" cy="41" rx="20" ry="6.5" fill="#FFF8F0" />
          <circle cx="43" cy="40" r="1.6" fill="#8A5A3B" opacity="0.7" />
          <circle cx="52" cy="42" r="1.6" fill="#8A5A3B" opacity="0.7" />
          <circle cx="59" cy="39" r="1.6" fill="#8A5A3B" opacity="0.7" />
        </g>
      )}
      {drizzle && (
        <path
          d="M36 42c6-4 12 4 18 0s12 4 12 0"
          stroke="#2E1B12"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function Empanada() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`emp-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0BE5C" />
          <stop offset="100%" stopColor="#D18A2E" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="80" rx="32" ry="6" fill="#3E2723" opacity="0.12" />
      <path d="M18 66a32 32 0 0 1 64 0z" fill={`url(#emp-${uid})`} />
      {/* repulgue */}
      <g stroke="#A8641F" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M24 58c2-3 6-3 8 0" />
        <path d="M35 50c2-3 6-3 8 0" />
        <path d="M47 46c2-3 6-3 8 0" />
        <path d="M59 50c2-3 6-3 8 0" />
      </g>
      {/* dorado */}
      <ellipse cx="42" cy="60" rx="8" ry="4" fill="#F7D488" opacity="0.8" />
      <circle cx="62" cy="62" r="2" fill="#A8641F" opacity="0.5" />
      <circle cx="55" cy="66" r="1.5" fill="#A8641F" opacity="0.5" />
    </g>
  );
}

function AjiBowl() {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`aji-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D2691E" />
          <stop offset="100%" stopColor="#A34A12" />
        </linearGradient>
      </defs>
      <Steam light />
      <ellipse cx="50" cy="80" rx="30" ry="6" fill="#3E2723" opacity="0.12" />
      <path d="M22 58h56a4 4 0 0 1-3 7l-8 12a10 10 0 0 1-9 6H42a10 10 0 0 1-9-6l-8-12a4 4 0 0 1-3-7z" fill="#8A4A2B" />
      <ellipse cx="50" cy="58" rx="28" ry="8" fill={`url(#aji-${uid})`} />
      <g fill="#E8C99A">
        <circle cx="42" cy="57" r="2.5" />
        <circle cx="52" cy="59" r="2.5" />
        <circle cx="60" cy="56" r="2.5" />
      </g>
      <path d="M36 55c4-3 8 3 12 0" stroke="#7A3410" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function TeaGlass({ liquid }: { liquid: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <linearGradient id={`tea-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquid} stopOpacity="0.85" />
          <stop offset="100%" stopColor={liquid} />
        </linearGradient>
      </defs>
      <Steam light />
      <ellipse cx="50" cy="84" rx="24" ry="5" fill="#3E2723" opacity="0.12" />
      <path
        d="M34 40h32l-4 38a6 6 0 0 1-6 5H44a6 6 0 0 1-6-5l-4-38z"
        fill="#F7EFDF"
        opacity="0.9"
      />
      <path
        d="M37 48h26l-3 28a5 5 0 0 1-5 4.5h-10a5 5 0 0 1-5-4.5l-3-28z"
        fill={`url(#tea-${uid})`}
      />
      {/* bolsita de té */}
      <line x1="62" y1="34" x2="58" y2="52" stroke="#8A5A3B" strokeWidth="1.8" />
      <rect x="53" y="50" width="10" height="8" rx="2" fill="#E8DCC3" stroke="#8A5A3B" strokeWidth="1.2" />
    </g>
  );
}

export default function DishVisual({ kind }: { kind: DishVisualKind }) {
  return (
    <svg viewBox="0 0 100 100" role="img" aria-hidden="true" className="dish-visual">
      <circle cx="50" cy="50" r="46" fill="#FBF3E4" />
      {kind === 'empanada' && <Empanada />}
      {kind === 'aji' && <AjiBowl />}
      {kind === 'cafe' && <Cup liquid="#2E1B12" />}
      {kind === 'latte' && <Cup liquid="#C89B6A" crema />}
      {kind === 'capuchino' && <Cup liquid="#8A5A3B" foam />}
      {kind === 'mocachino' && <Cup liquid="#4A2C1A" drizzle foam />}
      {kind === 'chocolate' && <Cup liquid="#3A2114" />}
      {kind === 'panela' && <Cup liquid="#B97A2E" />}
      {kind === 'matcha' && <Cup liquid="#7A9A4D" crema />}
      {kind === 'te' && <TeaGlass liquid="#C97B2E" />}
    </svg>
  );
}
