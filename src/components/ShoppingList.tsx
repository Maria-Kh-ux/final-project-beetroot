import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square, ShoppingBag, ShoppingCart } from 'lucide-react';
import { ShoppingItem } from '../types';

interface ShoppingListProps {
  shoppingList: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: (name: string, amount: string) => void;
  onClearCompleted: () => void;
  onClearAll: () => void;
}

export default function ShoppingList({
  shoppingList,
  onToggleItem,
  onRemoveItem,
  onAddItem,
  onClearCompleted,
  onClearAll,
}: ShoppingListProps) {
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onAddItem(nameInput.trim(), amountInput.trim() || '1 шт');
    setNameInput('');
    setAmountInput('');
  };

  const completedCount = shoppingList.filter((item) => item.completed).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="shopping-list-container">
      {/* Adding custom item panel */}
      <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xs flex flex-col justify-between h-fit">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-50 text-base tracking-tight mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-500" />
            Додати власну покупку
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 mb-1.5">
                Назва продукту
              </label>
              <input
                type="text"
                placeholder="напр. Молоко"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
                id="shopping-name-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-zinc-500 mb-1.5">
                Кількість / Вага
              </label>
              <input
                type="text"
                placeholder="напр. 1 літр, 200г"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
                id="shopping-amount-input"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              id="shopping-add-submit-btn"
            >
              <Plus className="w-4 h-4" />
              Додати до списку
            </button>
          </form>
        </div>

        {shoppingList.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-2">
            <button
              onClick={onClearCompleted}
              className="w-full py-2 text-center text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 transition-colors cursor-pointer"
              id="clear-completed-shopping-btn"
            >
              Прибрати куплене ({completedCount})
            </button>
            <button
              onClick={onClearAll}
              className="w-full py-2 text-center text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/25 rounded-lg border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
              id="clear-all-shopping-btn"
            >
              Очистити весь список
            </button>
          </div>
        )}
      </div>

      {/* Shopping List Items display */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xs flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
              Список кулінарних покупок
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Тут зібрані інгредієнти, яких вам бракує для приготування обраних рецептів.
            </p>
          </div>
          {shoppingList.length > 0 && (
            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-full font-mono">
              Куплено {completedCount} з {shoppingList.length}
            </span>
          )}
        </div>

        {shoppingList.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800/80 max-h-[420px] overflow-y-auto pr-1">
            {shoppingList.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between group transition-colors"
                id={`shopping-item-row-${item.id}`}
              >
                <div
                  onClick={() => onToggleItem(item.id)}
                  className="flex items-center gap-3 cursor-pointer select-none flex-1"
                >
                  {item.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 dark:text-zinc-700 hover:text-indigo-500 transition-colors shrink-0" />
                  )}
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-semibold transition-all duration-200 ${
                        item.completed
                          ? 'line-through text-gray-400 dark:text-zinc-500 font-normal'
                          : 'text-gray-800 dark:text-zinc-200'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
                      Кількість: <span className="font-mono font-medium">{item.amount}</span>
                      {item.recipeName && (
                        <span>
                          {' '}
                          • для страви <span className="italic font-medium">{item.recipeName}</span>
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-2 rounded-lg text-gray-300 hover:text-rose-600 dark:text-zinc-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 cursor-pointer"
                  title="Видалити зі списку"
                  id={`remove-shopping-btn-${item.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 dark:text-zinc-500 border border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl bg-gray-50/40 dark:bg-zinc-950/5">
            <span className="text-5xl block mb-3">📝</span>
            <p className="font-medium text-gray-700 dark:text-zinc-300">Ваш список покупок вільний!</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-normal">
              Додавайте товари вручну ліворуч, або просто натисніть кнопку "Купити відсутні" на картці рецепту.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
