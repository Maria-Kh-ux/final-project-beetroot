import { ChangeEvent } from 'react';
import { Leaf, Clock, Heart, Sparkles, Filter } from 'lucide-react';
import { UserPreferences } from '../types';

interface PreferencesPanelProps {
  preferences: UserPreferences;
  setPreferences: (prefs: UserPreferences) => void;
  availableCategories: string[];
}

export default function PreferencesPanel({
  preferences,
  setPreferences,
  availableCategories,
}: PreferencesPanelProps) {
  const diets: { value: UserPreferences['diet']; label: string; desc: string }[] = [
    { value: 'all', label: 'Усе', desc: 'Будь-які рецепти' },
    { value: 'vegetarian', label: 'Вегетаріанська', desc: 'Без м\'яса та риби' },
    { value: 'vegan', label: 'Веганська', desc: 'Тільки рослинна їжа' },
    { value: 'gluten-free', label: 'Безглютенова', desc: 'Без пшениці та глютену' },
    { value: 'low-carb', label: 'Низьковуглеводна', desc: 'Багато білків, мало вуглеводів' },
  ];

  const handleDietChange = (diet: UserPreferences['diet']) => {
    setPreferences({ ...preferences, diet });
  };

  const handleCategoryToggle = (category: string) => {
    const favoriteCategories = preferences.favoriteCategories.includes(category)
      ? preferences.favoriteCategories.filter((c) => c !== category)
      : [...preferences.favoriteCategories, category];
    setPreferences({ ...preferences, favoriteCategories });
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPreferences({ ...preferences, maxTime: parseInt(e.target.value) });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-gray-100 dark:border-zinc-800 shadow-xs" id="preferences-panel">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-50 font-sans tracking-tight">
          Персональні вподобання
        </h2>
      </div>

      {/* Diet selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
          <Leaf className="w-4 h-4 text-emerald-500" />
          Тип дієти / Обмеження
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {diets.map((d) => (
            <button
              key={d.value}
              onClick={() => handleDietChange(d.value)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                preferences.diet === d.value
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-500'
                  : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/50 text-gray-700 dark:text-zinc-300'
              }`}
              id={`diet-btn-${d.value}`}
            >
              <span className="block font-medium text-sm">{d.label}</span>
              <span className="block text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-tight">{d.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cooking Time filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" />
            Максимальний час приготування
          </label>
          <span className="text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full font-mono">
            до {preferences.maxTime} хв
          </span>
        </div>
        <input
          type="range"
          min="5"
          max="60"
          step="5"
          value={preferences.maxTime}
          onChange={handleTimeChange}
          className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
          id="max-time-range"
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500 mt-1 font-mono">
          <span>5 хв</span>
          <span>30 хв</span>
          <span>60 хв</span>
        </div>
      </div>

      {/* Favorite categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-500" />
          Улюблені категорії страв
        </label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => {
            const isSelected = preferences.favoriteCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => handleCategoryToggle(category)}
                className={`px-4 py-2 rounded-full border text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-600 dark:text-zinc-400 bg-white dark:bg-zinc-900'
                }`}
                id={`category-btn-${category}`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
