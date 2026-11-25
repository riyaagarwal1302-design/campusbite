import React, { useState, useMemo } from 'react';
import { Minus, Plus, Search, ShoppingBag, UtensilsCrossed, X } from 'lucide-react';
import type { CartItem, MenuCategory, MenuItem } from '../types/campusBite';

interface MenuSectionProps {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onOpenCart: () => void;
}

const CATEGORIES: MenuCategory[] = ['All', 'Daily Thalis', 'Comfort Bowls', 'Snacks & Chai'];

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  cart,
  onAddToCart,
  onUpdateQuantity,
  onOpenCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDetailItem, setActiveDetailItem] = useState<MenuItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [items, selectedCategory, searchQuery]);

  const cartSummary = useMemo(() => {
    return cart.reduce(
      (acc, entry) => ({
        count: acc.count + entry.quantity,
        total: acc.total + entry.item.price * entry.quantity,
      }),
      { count: 0, total: 0 }
    );
  }, [cart]);

  const getQuantity = (itemId: string) =>
    cart.find((entry) => entry.item.id === itemId)?.quantity ?? 0;

  return (
    <section id="daily-menu" className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">
              Curated Student Menu · Prepared Daily
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-[#171E1A]">
              Today&apos;s Homemade Meals
            </h2>
          </div>

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#171E1A] hover:bg-[#29352E] text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start md:self-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Meal Tray</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {cartSummary.count} {cartSummary.count === 1 ? 'item' : 'items'} · ₹{cartSummary.total}
            </span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 border-b border-stone-200/80 mb-8">
          <div
            role="tablist"
            aria-label="Meal categories"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-stone-100 border border-stone-200/80 rounded-lg self-start"
          >
            {CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-2 min-h-[36px] text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#171E1A] shadow-sm'
                      : 'text-stone-600 hover:text-[#171E1A]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thali, rajma, poha..."
              aria-label="Search menu items"
              className="w-full pl-10 pr-4 py-2.5 min-h-[40px] text-sm bg-white border border-stone-200 rounded-lg text-[#171E1A] placeholder:text-stone-400 focus:outline-none focus:border-[#166534]"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white border border-stone-200 rounded-xl">
            <p className="text-base font-medium text-[#171E1A]">No dishes match your filter.</p>
            <p className="text-sm text-stone-500 mt-1 mb-4">
              Try clearing your search or switching back to all categories.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-sm font-medium text-[#166534] border border-stone-300 rounded-lg hover:bg-stone-50 cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredItems.map((item) => {
              const qty = getQuantity(item.id);
              const imgError = failedImages[item.id];

              return (
                <article
                  key={item.id}
                  className="bg-white border border-stone-200/90 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setActiveDetailItem(item)}
                    className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                  >
                    {!imgError ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-stone-100 to-stone-200 text-stone-600">
                        <UtensilsCrossed className="w-8 h-8 mb-2 text-[#166534]" />
                        <span className="text-sm font-medium text-[#171E1A]">{item.name}</span>
                      </div>
                    )}
                  </button>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.prepWindow}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.calories}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveDetailItem(item)}
                      className="text-left cursor-pointer group"
                    >
                      <h3 className="text-base font-semibold text-[#171E1A] group-hover:text-[#166534] transition-colors">
                        {item.name}
                      </h3>
                    </button>

                    <p className="mt-2 text-sm text-stone-600 leading-relaxed line-clamp-2 flex-1">
                      {item.description}
                    </p>

                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-[#171E1A] tabular-nums">
                          ₹{item.price}
                        </p>
                        <p className="text-xs text-stone-500">{item.dietaryTag}</p>
                      </div>

                      {qty === 0 ? (
                        <button
                          type="button"
                          onClick={() => onAddToCart(item)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#166534]"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center border border-stone-300 rounded-lg bg-stone-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-9 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-l-lg cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-sm font-semibold text-[#171E1A] tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-9 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-r-lg cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {activeDetailItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="meal-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setActiveDetailItem(null)}
        >
          <div
            className="bg-white border border-stone-200 rounded-2xl max-w-2xl w-full overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-5 bg-stone-100 min-h-[220px]">
                <img
                  src={activeDetailItem.image}
                  alt={activeDetailItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-6 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs text-stone-500">
                      {activeDetailItem.category} · {activeDetailItem.prepWindow}
                    </p>
                    <h3
                      id="meal-detail-title"
                      className="font-display text-2xl font-semibold text-[#171E1A] mt-1"
                    >
                      {activeDetailItem.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDetailItem(null)}
                    aria-label="Close meal details"
                    className="p-2 text-stone-500 hover:text-[#171E1A] rounded-lg hover:bg-stone-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                  {activeDetailItem.description}
                </p>

                <div className="mt-4 pt-4 border-t border-stone-100">
                  <p className="text-xs font-semibold text-[#171E1A] mb-2">
                    What&apos;s inside ({activeDetailItem.portionNote})
                  </p>
                  <ul className="space-y-1.5 text-sm text-stone-600">
                    {activeDetailItem.ingredients.map((ing) => (
                      <li key={ing} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-[#166534] shrink-0" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold text-[#171E1A] tabular-nums">
                      ₹{activeDetailItem.price}
                    </p>
                    <p className="text-xs text-stone-500">
                      {activeDetailItem.calories} · {activeDetailItem.dietaryTag}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(activeDetailItem);
                      setActiveDetailItem(null);
                      onOpenCart();
                    }}
                    className="px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#166534] hover:bg-[#14532D] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Add to Meal Tray
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
