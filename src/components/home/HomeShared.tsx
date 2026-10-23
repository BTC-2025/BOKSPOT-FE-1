import Link from 'next/link';
import { useWishlistStore, useCartStore } from '../../lib/store';

export function CategoryCard({
  label,
  icon,
  from,
  to,
  glow,
  href,
}: {
  label: string;
  icon: string;
  from: string;
  to: string;
  glow: string;
  href: string;
}) {
  return (
    <Link href={href} className="w-full group">
      <div
        className="relative h-[108px] rounded-2xl flex flex-col items-center justify-center gap-2.5 overflow-hidden border border-[color:var(--color-outline-variant)]/30 bg-[color:var(--color-surface-container)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 card-glass"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500"
          style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
        />
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `inset 0 0 0 1px ${glow}` }}
        />
        <div
          className="category-badge relative z-10"
          style={{
            background: `linear-gradient(135deg, ${from}, ${to})`,
            boxShadow: `0 4px 16px ${glow}, 0 2px 6px rgba(0,0,0,0.6)`,
          }}
        >
          <span className="material-symbols-outlined text-[#0C0C10] text-[21px]" style={{ fontVariationSettings: "'wght' 500" }}>
            {icon}
          </span>
        </div>
        <span className="relative z-10 text-[12px] font-semibold tracking-wide text-[color:var(--color-on-surface-variant)] group-hover:text-[color:var(--color-on-surface)] transition-colors duration-300">
          {label}
        </span>
      </div>
    </Link>
  );
}

export function SectionHeader({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        <h2 className="text-[18px] font-bold text-[color:var(--color-on-surface)] tracking-tight">{title}</h2>
        <p className="text-[12px] mt-0.5 text-[color:var(--color-outline)]">{sub}</p>
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-[12px] font-semibold text-[color:var(--color-primary)] hover:gap-2 transition-all duration-300 shrink-0"
      >
        View All
        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
      </Link>
    </div>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: string;
}) {
  return (
    <div className="card-glass rounded-2xl p-4 md:p-5 bg-[color:var(--color-surface-container)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] uppercase tracking-[0.18em] text-[color:var(--color-outline)]">{label}</p>
          <p className="mt-2 text-[24px] md:text-[28px] font-black text-[color:var(--color-on-surface)] leading-none">{value}</p>
          <p className="mt-2 text-[12px] text-[color:var(--color-on-surface-variant)]">{note}</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-[color:var(--color-primary)]/10 flex items-center justify-center border border-[color:var(--color-primary)]/20">
          <span className="material-symbols-outlined text-[color:var(--color-primary)] text-[22px]" style={{ fontVariationSettings: "'wght' 500" }}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

export function WishlistButton({ item }: { item?: any }) {
  const toggleItem = useWishlistStore(state => state.toggleItem);
  const items = useWishlistStore(state => state.items);
  const wished = item ? items.some((i: any) => i.id === item.id) : false;

  return (
    <button 
      onClick={(e) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        if (item) {
          toggleItem({
            id: item.id,
            title: item.title,
            price: parseInt(String(item.price || '0').replace(/[^0-9]/g, '')) || 0,
            image: item.image,
            tag: item.badge || item.tag || item.rating,
          });
        }
      }}
      aria-label="Wishlist"
      className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full z-20 backdrop-blur-xl bg-white/85 dark:bg-black/60 border border-white/40 dark:border-white/15 shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:scale-110 active:scale-90 transition-all duration-300 cursor-pointer"
    >
      <span 
        className={`material-symbols-outlined text-[15px] transition-all duration-300 ${wished ? 'text-rose-500 scale-110' : 'text-slate-600 dark:text-slate-300'}`}
        style={{ fontVariationSettings: wished ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
    </button>
  );
}

export function CartAddButton({ item }: { item?: any }) {
  const items = useCartStore(state => state.items);
  const setQuantity = useCartStore(state => state.setQuantity);
  
  const cartItem = item ? items.find((i: any) => i.id === item.id) : undefined;
  const qty = cartItem ? cartItem.quantity : 0;

  if (qty === 0) {
    return (
      <button 
        onClick={(e) => { 
          e.preventDefault(); 
          e.stopPropagation(); 
          if (item) {
            useCartStore.getState().addItem({
              id: item.id,
              title: item.title,
              price: parseInt(String(item.price || '0').replace(/[^0-9]/g, '')) || 0,
              quantity: 1,
              image: item.image
            });
          }
        }}
        className="absolute bottom-2.5 right-2.5 bg-white text-red-600 font-bold text-[20px] w-8 h-8 rounded-lg shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all z-20"
      >
        +
      </button>
    );
  }
  return (
    <div 
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      className="absolute bottom-2.5 right-2.5 bg-white text-red-600 font-bold text-[14px] px-1 py-1 rounded-lg shadow-md border border-gray-100 flex items-center justify-between min-w-[70px] h-8 z-20"
    >
      <button onClick={() => { if(item) setQuantity(item.id, qty - 1); }} className="px-2 text-red-600 hover:bg-gray-100 rounded text-lg leading-none">-</button>
      <span className="text-black text-xs">{qty}</span>
      <button onClick={() => { if(item) setQuantity(item.id, qty + 1); }} className="px-2 text-red-600 hover:bg-gray-100 rounded text-lg leading-none">+</button>
    </div>
  );
}
