import React from 'react';
import { X, Clock, ChefHat, Check, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeModalProps {
  recipe: Recipe;
  fridgeIngredients: string[];
  onClose: () => void;
  onAddMissingToShoppingList: (recipe: Recipe) => void;
  onMarkAsCooked: (recipe: Recipe) => void;
  cookedCount: number;
}

export default function RecipeModal({
  recipe,
  fridgeIngredients,
  onClose,
  onAddMissingToShoppingList,
  onMarkAsCooked,
  cookedCount,
}: RecipeModalProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  // Track matching ingredients
  const ownedIngredients = recipe.ingredients.filter((i) =>
    fridgeIngredients.includes(i.name.toLowerCase())
  );
  const missingIngredients = recipe.ingredients.filter(
    (i) => !fridgeIngredients.includes(i.name.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10"
      id="recipe-modal-backdrop"
    >
      {/* Backdrop background */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 transition-all transform scale-100 flex flex-col max-h-[85vh]"
        id="recipe-modal-content"
      >
        {/* Header decoration */}
        <div className="bg-emerald-600 dark:bg-emerald-700 px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/15 hover:bg-black/30 transition-colors text-white cursor-pointer"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-emerald-100">
            {recipe.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2 font-sans tracking-tight pr-8">
            {recipe.name}
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-lg leading-snug">
            {recipe.description}
          </p>
        </div>

        {/* Scrollable Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-800">
          {/* Times & stats Grid */}
          <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/60 text-center">
            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">
                Загальний час
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center justify-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-emerald-500" />
                {totalTime} хв
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">
                Підготовка
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-zinc-100 flex items-center justify-center gap-1 mt-1">
                <ChefHat className="w-4 h-4 text-indigo-500" />
                {recipe.prepTime} хв
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">
                Складність
              </span>
              <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block mt-2 capitalize">
                {recipe.difficulty === 'easy'
                  ? '🟢 Легка'
                  : recipe.difficulty === 'medium'
                  ? '🟡 Середня'
                  : '🔴 Складна'}
              </span>
            </div>
          </div>

          {/* Ingredients list */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base flex items-center gap-2">
                <span>🛒</span> Необхідні інгредієнти
              </h3>
              {missingIngredients.length > 0 && (
                <button
                  onClick={() => onAddMissingToShoppingList(recipe)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  id="modal-add-all-missing-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Купити відсутні ({missingIngredients.length})
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recipe.ingredients.map((ing, idx) => {
                const isOwned = fridgeIngredients.includes(ing.name.toLowerCase());
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between text-sm transition-all duration-200 ${
                      isOwned
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-100 dark:border-emerald-900/30'
                        : 'bg-gray-50/50 dark:bg-zinc-900/30 border-gray-100 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isOwned ? (
                        <span className="bg-emerald-500 text-white rounded-full p-0.5 shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-full p-0.5 shrink-0">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className={isOwned ? 'text-gray-800 dark:text-zinc-200 font-medium' : 'text-gray-500 dark:text-zinc-400'}>
                        {ing.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-mono text-gray-500 dark:text-zinc-400">
                      {ing.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cooking Steps */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-zinc-100 text-base mb-3.5 flex items-center gap-2">
              <span>🍳</span> Крок за кроком
            </h3>
            <div className="space-y-4">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 bg-gray-50 dark:bg-zinc-950/35 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-zinc-400 text-center sm:text-left">
            {cookedCount > 0 ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                Ви готували цю страву {cookedCount} {cookedCount === 1 ? 'раз' : 'рази'}!
              </span>
            ) : (
              <span>Приготуйте та додайте до вашого кулінарного досвіду.</span>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              onClick={() => onMarkAsCooked(recipe)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto"
              id="mark-cooked-modal-btn"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Вже приготовано!
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer w-full sm:w-auto"
              id="close-modal-footer-btn"
            >
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
