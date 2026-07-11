import React, { useState } from 'react';
import { Search, Plus, Trash2, Check, RefreshCw, Layers, Sparkles } from 'lucide-react';
import { POPULAR_INGREDIENTS } from '../data/recipes';

interface FridgeViewProps {
  selectedIngredients: string[];
  toggleIngredient: (name: string) => void;
  clearIngredients: () => void;
  addCustomIngredient: (name: string) => void;
}

export default function FridgeView({
  selectedIngredients,
  toggleIngredient,
  clearIngredients,
  addCustomIngredient,
}: FridgeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Find unique categories from popular list
  const categories = ['all', ...Array.from(new Set(POPULAR_INGREDIENTS.map((item) => item.category)))];

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = customInput.trim();
    if (!name) return;
    addCustomIngredient(name);
    setCustomInput('');
  };

  // Filter popular list
  const filteredPopular = POPULAR_INGREDIENTS.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="fridge-view-container">
      {/* Selection Panel */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xs flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              <span className="text-2xl">🥑</span> Оберіть інгредієнти з вашого холодильника
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              Просто натискайте на продукти, які у вас є, щоб знайти відповідні страви.
            </p>
          </div>
          {selectedIngredients.length > 0 && (
            <button
              onClick={clearIngredients}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200 border border-rose-200 dark:border-rose-900/40 cursor-pointer flex items-center justify-center gap-1.5"
              id="clear-fridge-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Очистити холодильник
            </button>
          )}
        </div>

        {/* Search & Custom Input row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Швидкий пошук інгредієнтів..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:focus:border-emerald-500 text-sm transition-all duration-200"
              id="ingredient-search-input"
            />
          </div>

          <form onSubmit={handleCustomAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Свій інгредієнт (напр. Сіль)..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:focus:border-emerald-500 text-sm transition-all duration-200"
              id="custom-ingredient-input"
            />
            <button
              type="submit"
              className="px-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer font-medium text-sm shadow-xs active:scale-95"
              id="add-custom-ingredient-btn"
            >
              <Plus className="w-4 h-4" />
              Додати
            </button>
          </form>
        </div>

        {/* Category Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white'
                  : 'bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300'
              }`}
              id={`fridge-cat-${cat}`}
            >
              {cat === 'all' ? (
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Усі групи
                </span>
              ) : (
                cat
              )}
            </button>
          ))}
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto max-h-[460px] p-2 pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
          {filteredPopular.length > 0 ? (
            filteredPopular.map((ing) => {
              const isSelected = selectedIngredients.includes(ing.name.toLowerCase());
              return (
                <button
                  key={ing.name}
                  onClick={() => toggleIngredient(ing.name)}
                  className={`p-4 min-h-[82px] rounded-2xl border text-left transition-all duration-200 cursor-pointer flex justify-between items-center gap-2 group relative overflow-hidden ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500'
                      : 'border-gray-100 dark:border-zinc-800/80 hover:border-gray-200 dark:hover:border-zinc-700 bg-gray-50/30 dark:bg-zinc-900/30 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 shadow-3xs'
                  }`}
                  id={`ingredient-card-${ing.name}`}
                >
                  <div className="flex flex-col justify-center py-0.5 min-w-0">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold tracking-wider uppercase leading-normal truncate">
                      {ing.category}
                    </span>
                    <span className="font-bold text-sm mt-1 group-hover:translate-x-0.5 transition-transform duration-150 leading-tight text-gray-800 dark:text-zinc-100 break-words">
                      {ing.name}
                    </span>
                  </div>
                  {isSelected ? (
                    <span className="bg-emerald-500 text-white rounded-full p-1 shadow-xs shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-gray-300 dark:border-zinc-700 group-hover:border-emerald-400 dark:group-hover:border-emerald-500 transition-colors shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-zinc-400 bg-gray-50/50 dark:bg-zinc-950/10 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
              <span className="text-3xl block mb-2">🔍</span>
              Нічого не знайдено за вашим запитом.
              <br />
              <span className="text-xs text-gray-400 mt-1 block">
                Спробуйте інше слово або скористайтеся формою вище, щоб додати унікальний інгредієнт!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Owned Ingredients Inventory Sidebar */}
      <div className="lg:col-span-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between min-h-[300px]">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base tracking-tight flex items-center gap-2">
              <span>❄️</span> Вже у холодильнику
            </h3>
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full font-mono">
              {selectedIngredients.length}
            </span>
          </div>

          {selectedIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-[340px] overflow-y-auto pr-1">
              {selectedIngredients.map((name) => {
                // Find category to display if it's from the popular list
                const original = POPULAR_INGREDIENTS.find(
                  (item) => item.name.toLowerCase() === name.toLowerCase()
                );
                const displayName = original ? original.name : name.charAt(0).toUpperCase() + name.slice(1);
                return (
                  <button
                    key={name}
                    onClick={() => toggleIngredient(name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-gray-700 dark:text-zinc-200 hover:text-rose-700 dark:hover:text-rose-300 hover:border-rose-300 dark:hover:border-rose-900/50 border border-gray-200 dark:border-zinc-700 text-xs font-semibold cursor-pointer shadow-2xs group transition-all duration-200"
                    title="Натисніть, щоб видалити"
                    id={`active-ing-${name}`}
                  >
                    <span>{displayName}</span>
                    <Trash2 className="w-3 h-3 text-gray-400 group-hover:text-rose-600 transition-colors" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-zinc-500 border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
              <span className="text-4xl block mb-2 opacity-50">🛒</span>
              Ваш холодильник порожній.
              <br />
              <span className="text-xs mt-1 block px-4 leading-normal">
                Оберіть продукти ліворуч, щоб побачити їх тут та відібрати рецепти!
              </span>
            </div>
          )}
        </div>

        {selectedIngredients.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-950/25">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Рецепти підбираються автоматично на льоту!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
