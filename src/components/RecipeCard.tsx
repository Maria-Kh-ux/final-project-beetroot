import React from 'react';
import { Check, Plus, Clock, ChefHat, Sparkles } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  key?: string | number;
  recipe: Recipe;
  fridgeIngredients: string[];
  onOpenDetails: (recipe: Recipe) => void;
  onAddMissingToShoppingList: (recipe: Recipe) => void;
  isRecommended?: boolean;
}

export default function RecipeCard({
  recipe,
  fridgeIngredients,
  onOpenDetails,
  onAddMissingToShoppingList,
  isRecommended = false,
}: RecipeCardProps) {
  // Calculate matching stats
  const recipeIngLower = recipe.ingredients.map((i) => i.name.toLowerCase());
  const ownedIngredients = recipeIngLower.filter((name) => fridgeIngredients.includes(name));
  const missingCount = recipe.ingredients.length - ownedIngredients.length;
  const matchPercent = Math.round((ownedIngredients.length / recipe.ingredients.length) * 100);

  // Difficulty badge details
  const difficultyConfig = {
    easy: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', label: 'Легка (2-4 інгр.)' },
    medium: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', label: 'Середня (4-7 інгр.)' },
    hard: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', label: 'Складна (7+ інгр.)' },
  };

  const difficulty = difficultyConfig[recipe.difficulty] || difficultyConfig.easy;

  // Total time
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div
      className={`relative group bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-250 hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${
        isRecommended
          ? 'border-indigo-400 dark:border-indigo-800 shadow-sm shadow-indigo-100 dark:shadow-none'
          : 'border-gray-100 dark:border-zinc-800 shadow-2xs hover:shadow-md'
      }`}
      id={`recipe-card-${recipe.id}`}
    >
      {/* Recommended Ribbon */}
      {isRecommended && (
        <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-300" />
          Рекомендовано
        </div>
      )}

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category & Difficulty Header */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {recipe.category}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${difficulty.bg} ${difficulty.text}`}>
            {difficulty.label}
          </span>
        </div>

        {/* Recipe Title & Desc */}
        <h3 className="text-base font-bold text-gray-900 dark:text-zinc-50 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-150 line-clamp-1">
          {recipe.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 mb-4 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>

        {/* Visual Progress Bar of Matching Ingredients */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5 font-sans font-medium">
            <span className="text-gray-500 dark:text-zinc-400">Наявні інгредієнти</span>
            <span className={matchPercent === 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-700 dark:text-zinc-300 font-bold'}>
              {ownedIngredients.length} з {recipe.ingredients.length} ({matchPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                matchPercent === 100
                  ? 'bg-emerald-500'
                  : matchPercent > 50
                  ? 'bg-amber-500'
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${matchPercent}%` }}
            />
          </div>
        </div>

        {/* Quick ingredients look */}
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1.5">
            {recipe.ingredients.slice(0, 4).map((ing, idx) => {
              const isOwned = fridgeIngredients.includes(ing.name.toLowerCase());
              return (
                <span
                  key={idx}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 border ${
                    isOwned
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200/50 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-gray-50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800 text-gray-500 dark:text-zinc-400'
                  }`}
                >
                  {isOwned && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  {ing.name}
                </span>
              );
            })}
            {recipe.ingredients.length > 4 && (
              <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-semibold bg-gray-100/50 dark:bg-zinc-800/20 px-2 py-1 rounded-lg">
                +{recipe.ingredients.length - 4} більше
              </span>
            )}
          </div>
        </div>

        {/* Quick info row */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 pt-3 border-t border-gray-100/60 dark:border-zinc-800/60">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {totalTime} хв
          </span>
          <span className="flex items-center gap-1 font-medium">
            <ChefHat className="w-3.5 h-3.5 text-gray-400" />
            {recipe.prepTime} хв підг.
          </span>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-4 bg-gray-50/50 dark:bg-zinc-900/30 border-t border-gray-100/60 dark:border-zinc-800/60 grid grid-cols-12 gap-2">
        <button
          onClick={() => onOpenDetails(recipe)}
          className="col-span-7 py-2 text-center bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-2xs transition-all duration-200 cursor-pointer active:scale-95"
          id={`open-recipe-btn-${recipe.id}`}
        >
          Приготувати
        </button>
        {missingCount > 0 ? (
          <button
            onClick={() => onAddMissingToShoppingList(recipe)}
            title="Додати відсутні інгредієнти у список покупок"
            className="col-span-5 py-2 px-1 text-center bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-zinc-700/50 border border-gray-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer active:scale-95"
            id={`add-missing-btn-${recipe.id}`}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            Купити ({missingCount})
          </button>
        ) : (
          <div className="col-span-5 text-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl flex items-center justify-center border border-emerald-200/50 dark:border-emerald-900/20 px-1 py-1.5">
            Усе в наявності! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
