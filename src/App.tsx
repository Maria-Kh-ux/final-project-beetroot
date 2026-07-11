import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  Refrigerator, 
  ListOrdered, 
  Sparkles, 
  CheckCircle, 
  Wifi, 
  WifiOff, 
  Info,
  SlidersHorizontal,
  ChevronRight,
  BookOpen
} from 'lucide-react';

import { Recipe, ShoppingItem, UserPreferences } from './types';
import { RECIPES_DATA } from './data/recipes';

// Subcomponents
import FridgeView from './components/FridgeView';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import ShoppingList from './components/ShoppingList';
import PreferencesPanel from './components/PreferencesPanel';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  // --- Persistent States (with Offline support) ---
  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>(() => {
    const saved = localStorage.getItem('fc_fridge');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length === 4 &&
          parsed.includes('томати') &&
          parsed.includes('сир') &&
          parsed.includes('яйця') &&
          parsed.includes('хліб')
        ) {
          return [];
        }
        return parsed;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('fc_shopping');
    return saved ? JSON.parse(saved) : [];
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fc_dark');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [cookedHistory, setCookedHistory] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('fc_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('fc_prefs');
    return saved ? JSON.parse(saved) : {
      diet: 'all',
      favoriteCategories: ['Сніданки', 'Гарячі страви'],
      maxTime: 45
    };
  });

  // --- Runtime UI States ---
  const [activeTab, setActiveTab] = useState<'fridge' | 'recipes' | 'recommendations' | 'shopping' | 'preferences'>('fridge');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState<{ show: boolean; message: string; type: 'success' | 'info' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Recipe-specific filtering in All Recipes Tab
  const [recipeSearch, setRecipeSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [onlyFullyCookable, setOnlyFullyCookable] = useState(false);

  // --- Sync Effects ---
  useEffect(() => {
    localStorage.setItem('fc_fridge', JSON.stringify(fridgeIngredients));
  }, [fridgeIngredients]);

  useEffect(() => {
    localStorage.setItem('fc_shopping', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('fc_dark', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('fc_history', JSON.stringify(cookedHistory));
  }, [cookedHistory]);

  useEffect(() => {
    localStorage.setItem('fc_prefs', JSON.stringify(preferences));
  }, [preferences]);

  // Online/Offline status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Toast auto-closer
  useEffect(() => {
    if (showToast.show) {
      const timer = setTimeout(() => {
        setShowToast({ ...showToast, show: false });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast.show]);

  const triggerToast = (message: string, type: 'success' | 'info' = 'success') => {
    setShowToast({ show: true, message, type });
  };

  // --- Handlers ---
  const handleToggleFridgeIngredient = (name: string) => {
    const lower = name.toLowerCase();
    if (fridgeIngredients.includes(lower)) {
      setFridgeIngredients(fridgeIngredients.filter((i) => i !== lower));
      triggerToast(`Вилучено з холодильника: ${name}`, 'info');
    } else {
      setFridgeIngredients([...fridgeIngredients, lower]);
      triggerToast(`Додано до холодильника: ${name}`, 'success');
    }
  };

  const handleClearFridge = () => {
    setFridgeIngredients([]);
    triggerToast('Холодильник повністю очищено', 'info');
  };

  const handleAddCustomFridgeIngredient = (name: string) => {
    const lower = name.toLowerCase();
    if (fridgeIngredients.includes(lower)) {
      triggerToast('Цей інгредієнт вже є у вашому холодильнику!', 'info');
      return;
    }
    setFridgeIngredients([...fridgeIngredients, lower]);
    triggerToast(`Додано новий інгредієнт: ${name}`, 'success');
  };

  // Shopping List logic
  const handleToggleShoppingItem = (id: string) => {
    setShoppingList(
      shoppingList.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRemoveShoppingItem = (id: string) => {
    const item = shoppingList.find((i) => i.id === id);
    setShoppingList(shoppingList.filter((item) => item.id !== id));
    if (item) {
      triggerToast(`Вилучено зі списку покупок: ${item.name}`, 'info');
    }
  };

  const handleAddShoppingItem = (name: string, amount: string) => {
    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name,
      amount,
      completed: false,
    };
    setShoppingList([...shoppingList, newItem]);
    triggerToast(`Додано до списку покупок: ${name}`, 'success');
  };

  const handleAddMissingToShoppingList = (recipe: Recipe) => {
    const missing = recipe.ingredients.filter(
      (ing) => !fridgeIngredients.includes(ing.name.toLowerCase())
    );

    if (missing.length === 0) {
      triggerToast('Всі інгредієнти для цієї страви вже є у вашому холодильнику!', 'info');
      return;
    }

    const itemsToAdd: ShoppingItem[] = missing.map((ing) => ({
      id: (Date.now() + Math.random()).toString(),
      name: ing.name,
      amount: ing.amount,
      completed: false,
      recipeName: recipe.name,
    }));

    // Filter out duplicates that might already be in the list
    const currentNames = shoppingList.map((item) => item.name.toLowerCase());
    const uniqueItemsToAdd = itemsToAdd.filter(
      (item) => !currentNames.includes(item.name.toLowerCase())
    );

    if (uniqueItemsToAdd.length === 0) {
      triggerToast('Ці інгредієнти вже додані до вашого списку покупок!', 'info');
      return;
    }

    setShoppingList([...shoppingList, ...uniqueItemsToAdd]);
    triggerToast(
      `Додано ${uniqueItemsToAdd.length} відсутніх інгредієнтів для "${recipe.name}"!`,
      'success'
    );
  };

  const handleClearCompletedShopping = () => {
    setShoppingList(shoppingList.filter((item) => !item.completed));
    triggerToast('Прибрано куплені продукти', 'info');
  };

  const handleClearAllShopping = () => {
    setShoppingList([]);
    triggerToast('Список покупок повністю очищено', 'info');
  };

  // Recipe Cooked / History feedback
  const handleMarkAsCooked = (recipe: Recipe) => {
    setCookedHistory((prev) => ({
      ...prev,
      [recipe.id]: (prev[recipe.id] || 0) + 1,
    }));
    triggerToast(`Вітаємо! Смачного приготування страви "${recipe.name}"! 🎉`, 'success');
  };

  // Extract all categories in the recipe catalog
  const availableCategories = Array.from(new Set(RECIPES_DATA.map((r) => r.category)));

  // --- Recommendation Engine (Fully client-side, offline, smart scoring) ---
  const recommendedRecipes = RECIPES_DATA.map((recipe) => {
    let score = 0;

    // A. HARD FILTERS
    // 1. Dietary Constraint
    if (preferences.diet !== 'all') {
      const tagsLower = recipe.tags.map((t) => t.toLowerCase());
      const isVeg = tagsLower.includes('вегетаріанське') || tagsLower.includes('веганське');
      const isVegan = tagsLower.includes('веганське');
      const isGlutenFree = tagsLower.includes('безглютенове');
      const isLowCarb = tagsLower.includes('низьковуглеводне');

      if (preferences.diet === 'vegetarian' && !isVeg) return null;
      if (preferences.diet === 'vegan' && !isVegan) return null;
      if (preferences.diet === 'gluten-free' && !isGlutenFree) return null;
      if (preferences.diet === 'low-carb' && !isLowCarb) return null;
    }

    // 2. Maximum Prep/Cook Time Limit
    const totalTime = recipe.prepTime + recipe.cookTime;
    if (totalTime > preferences.maxTime) return null;

    // B. SOFT SCORING
    // 1. Ingredient Match (up to 40 pts)
    const recipeIngLower = recipe.ingredients.map((i) => i.name.toLowerCase());
    const owned = recipeIngLower.filter((name) => fridgeIngredients.includes(name));
    const matchPercent = recipe.ingredients.length > 0 ? owned.length / recipe.ingredients.length : 0;
    score += matchPercent * 45;

    // 2. Favorite Category match (+30 pts)
    if (preferences.favoriteCategories.includes(recipe.category)) {
      score += 25;
    }

    // 3. User Cook History (+15 pts per cook, capped at 30 pts)
    const cooks = cookedHistory[recipe.id] || 0;
    score += Math.min(cooks * 15, 30);

    return { ...recipe, score };
  })
    .filter((r): r is (Recipe & { score: number }) => r !== null)
    .sort((a, b) => b.score - a.score);

  // --- Filter and Search on standard recipes tab ---
  const filteredRecipes = RECIPES_DATA.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
      recipe.ingredients.some((i) => i.name.toLowerCase().includes(recipeSearch.toLowerCase()));

    const matchesDifficulty = difficultyFilter === 'all' || recipe.difficulty === difficultyFilter;

    // Check if user has ALL ingredients for this recipe
    const hasAllIngredients = recipe.ingredients.every((ing) =>
      fridgeIngredients.includes(ing.name.toLowerCase())
    );
    const matchesFullyCookable = !onlyFullyCookable || hasAllIngredients;

    return matchesSearch && matchesDifficulty && matchesFullyCookable;
  });

  // --- Quick Match suggestions for the Fridge Tab ---
  const fridgeMatchedRecipes = useMemo(() => {
    return RECIPES_DATA.map((recipe) => {
      const recipeIngLower = recipe.ingredients.map((i) => i.name.toLowerCase());
      const owned = recipeIngLower.filter((name) => fridgeIngredients.includes(name));
      const matchPercent = recipe.ingredients.length > 0 ? (owned.length / recipe.ingredients.length) * 100 : 0;
      return { ...recipe, matchPercent, ownedCount: owned.length };
    })
    .filter((recipe) => recipe.ownedCount > 0)
    .sort((a, b) => {
      if (b.matchPercent !== a.matchPercent) {
        return b.matchPercent - a.matchPercent;
      }
      return b.ownedCount - a.ownedCount;
    });
  }, [fridgeIngredients]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-zinc-950 dark:text-zinc-50 transition-colors duration-250 flex flex-col font-sans selection:bg-emerald-500/20 antialiased">
      {/* Offline Alert & Status Pill */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 dark:shadow-none animate-spin-slow">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-zinc-50">
                Fridge Chef
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                Розумний Кулінарний Помічник
              </p>
            </div>
          </div>

          {/* Center Tabs: Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-gray-100/80 dark:bg-zinc-800/40 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('fridge')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'fridge'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
              id="desktop-tab-fridge"
            >
              <Refrigerator className="w-4 h-4 text-emerald-500" />
              Мій холодильник
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'recipes'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
              id="desktop-tab-recipes"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Усі рецепти
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'recommendations'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
              id="desktop-tab-recs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Рекомендації
              <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] text-white px-1 py-0.5 rounded-full font-bold">
                PRO
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shopping'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
              id="desktop-tab-shopping"
            >
              <ListOrdered className="w-4 h-4 text-rose-500" />
              Список покупок
              {shoppingList.length > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {shoppingList.filter((i) => !i.completed).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
              id="desktop-tab-preferences"
            >
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              Вподобання
            </button>
          </nav>

          {/* Right Header Panel (Theme, Offline, Info) */}
          <div className="flex items-center gap-2.5">
            {/* Connection Indicator */}
            {isOnline ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                <Wifi className="w-3.5 h-3.5" /> ОНЛАЙН
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full font-bold animate-pulse">
                <WifiOff className="w-3.5 h-3.5" /> ОФЛАЙН
              </span>
            )}

            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Connection status note banner for offline confidence */}
        {!isOnline && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-4 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Офлайн-режим активовано!</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                Всі ваші інгредієнти, рецепти, список покупок та налаштування працюють локально і зберігаються у вашому браузері. Ви можете безпечно продовжувати користуватися додатком навіть без підключення до Інтернету.
              </p>
            </div>
          </div>
        )}

        {/* Tab content wrapper with custom animations */}
        <div className="min-h-[450px]">
          {activeTab === 'fridge' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FridgeView
                selectedIngredients={fridgeIngredients}
                toggleIngredient={handleToggleFridgeIngredient}
                clearIngredients={handleClearFridge}
                addCustomIngredient={handleAddCustomFridgeIngredient}
              />

              {/* Instant Quick suggestions block below fridge to entice cook experience */}
              <div className="mt-12 border-t border-gray-100 dark:border-zinc-800/80 pt-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-gray-950 dark:text-zinc-50 flex items-center gap-2">
                      <span className="text-xl">💡</span> Швидкі страви з ваших інгредієнтів
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-zinc-500">
                      Страви, які ви можете приготувати прямо зараз або з мінімальною кількістю покупок.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('recipes')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    Переглянути всі <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {fridgeMatchedRecipes.slice(0, 3).map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      fridgeIngredients={fridgeIngredients}
                      onOpenDetails={setSelectedRecipe}
                      onAddMissingToShoppingList={handleAddMissingToShoppingList}
                    />
                  ))}
                  {fridgeMatchedRecipes.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-400 dark:text-zinc-500 bg-gray-50/50 dark:bg-zinc-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                      Оберіть кілька інгредієнтів у холодильнику, щоб побачити відповідні рецепти тут!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'recipes' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Filter controls row */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="w-full md:w-1/3">
                  <input
                    type="text"
                    placeholder="Пошук рецепту чи інгредієнту..."
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 text-xs transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                  {/* Difficulty selector */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                    <span className="text-xs font-semibold text-gray-400">Складність:</span>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="bg-gray-50 dark:bg-zinc-950/30 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="all">Будь-яка</option>
                      <option value="easy">Легка (2-4 інгр.)</option>
                      <option value="medium">Середня (4-7 інгр.)</option>
                      <option value="hard">Складна (7+ інгр.)</option>
                    </select>
                  </div>

                  {/* Toggle filter fully cookable */}
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-gray-600 dark:text-zinc-300 cursor-pointer self-start sm:self-center">
                    <input
                      type="checkbox"
                      checked={onlyFullyCookable}
                      onChange={(e) => setOnlyFullyCookable(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded-sm focus:ring-emerald-500 dark:bg-zinc-800"
                    />
                    <span>Тільки ті, що можу приготувати зараз</span>
                  </label>
                </div>
              </div>

              {/* Recipe Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    fridgeIngredients={fridgeIngredients}
                    onOpenDetails={setSelectedRecipe}
                    onAddMissingToShoppingList={handleAddMissingToShoppingList}
                  />
                ))}

                {filteredRecipes.length === 0 && (
                  <div className="col-span-full text-center py-24 text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6">
                    <span className="text-5xl block mb-3 opacity-50">🍽️</span>
                    <p className="font-bold text-base">Жодної страви не знайдено за заданими фільтрами</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Спробуйте додати більше інгредієнтів до вашого холодильника або зняти обмеження з фільтрів пошуку.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'recommendations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 dark:from-emerald-950/20 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-950/45 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                  Ваша персональна тарілка
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  Офлайн-система рекомендацій підбирає та сортує страви, враховуючи наявні у вас інгредієнти (<strong>+45 балів</strong>), обрані улюблені категорії страв (<strong>+25 балів</strong>) та вашу особисту історію приготувань (<strong>до +30 балів</strong>).
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    Змінити вподобання
                  </button>
                </div>
              </div>

              {/* Recommended list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedRecipes.slice(0, 6).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    fridgeIngredients={fridgeIngredients}
                    onOpenDetails={setSelectedRecipe}
                    onAddMissingToShoppingList={handleAddMissingToShoppingList}
                    isRecommended={true}
                  />
                ))}

                {recommendedRecipes.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6">
                    <span className="text-5xl block mb-3">🥬</span>
                    <p className="font-bold">Немає рекомендацій за вашими фільтрами</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Спробуйте збільшити максимальний час приготування або змінити дієту в розділі вподобань.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'shopping' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ShoppingList
                shoppingList={shoppingList}
                onToggleItem={handleToggleShoppingItem}
                onRemoveItem={handleRemoveShoppingItem}
                onAddItem={handleAddShoppingItem}
                onClearCompleted={handleClearCompletedShopping}
                onClearAll={handleClearAllShopping}
              />
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PreferencesPanel
                preferences={preferences}
                setPreferences={setPreferences}
                availableCategories={availableCategories}
              />
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer Navigation: Mobile-friendly bottom rail */}
      <footer className="md:hidden sticky bottom-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-zinc-800/50 px-4 py-2 shadow-lg">
        <div className="grid grid-cols-5 gap-1 text-center max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('fridge')}
            className={`flex flex-col items-center justify-center py-1.5 transition-all text-gray-500 hover:text-emerald-500 ${
              activeTab === 'fridge' ? 'text-emerald-500 dark:text-emerald-400 font-bold scale-105' : 'text-gray-400 dark:text-zinc-500'
            }`}
            id="mobile-tab-fridge"
          >
            <Refrigerator className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">Холодильник</span>
          </button>

          <button
            onClick={() => setActiveTab('recipes')}
            className={`flex flex-col items-center justify-center py-1.5 transition-all text-gray-500 hover:text-indigo-500 ${
              activeTab === 'recipes' ? 'text-indigo-500 dark:text-indigo-400 font-bold scale-105' : 'text-gray-400 dark:text-zinc-500'
            }`}
            id="mobile-tab-recipes"
          >
            <BookOpen className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">Рецепти</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex flex-col items-center justify-center py-1.5 transition-all text-gray-500 hover:text-amber-500 relative ${
              activeTab === 'recommendations' ? 'text-amber-500 dark:text-amber-400 font-bold scale-105' : 'text-gray-400 dark:text-zinc-500'
            }`}
            id="mobile-tab-recs"
          >
            <Sparkles className="w-5 h-5 mb-0.5 text-amber-500" />
            <span className="text-[9px]">Тарілка</span>
          </button>

          <button
            onClick={() => setActiveTab('shopping')}
            className={`flex flex-col items-center justify-center py-1.5 transition-all text-gray-500 hover:text-rose-500 relative ${
              activeTab === 'shopping' ? 'text-rose-500 dark:text-rose-400 font-bold scale-105' : 'text-gray-400 dark:text-zinc-500'
            }`}
            id="mobile-tab-shopping"
          >
            <ListOrdered className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">Покупки</span>
            {shoppingList.filter((i) => !i.completed).length > 0 && (
              <span className="absolute top-1 right-2 bg-rose-500 text-white text-[8px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {shoppingList.filter((i) => !i.completed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex flex-col items-center justify-center py-1.5 transition-all text-gray-500 hover:text-indigo-500 ${
              activeTab === 'preferences' ? 'text-indigo-500 dark:text-indigo-400 font-bold scale-105' : 'text-gray-400 dark:text-zinc-500'
            }`}
            id="mobile-tab-pref"
          >
            <SlidersHorizontal className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">Вподобання</span>
          </button>
        </div>
      </footer>

      {/* Interactive Detail Modal Overlay */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          fridgeIngredients={fridgeIngredients}
          onClose={() => setSelectedRecipe(null)}
          onAddMissingToShoppingList={handleAddMissingToShoppingList}
          onMarkAsCooked={handleMarkAsCooked}
          cookedCount={cookedHistory[selectedRecipe.id] || 0}
        />
      )}

      {/* Sleek Custom System Toasts */}
      <AnimatePresence>
        {showToast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 sm:bottom-8 right-4 left-4 sm:left-auto sm:right-8 z-50 pointer-events-none"
            id="toast-container"
          >
            <div className={`p-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-md bg-zinc-900 text-white border dark:bg-white dark:text-zinc-900 ${
              showToast.type === 'success' 
                ? 'border-emerald-500' 
                : 'border-zinc-700 dark:border-gray-200'
            }`}>
              <CheckCircle className={`w-5 h-5 shrink-0 ${showToast.type === 'success' ? 'text-emerald-400' : 'text-gray-400'}`} />
              <p className="text-xs font-semibold leading-relaxed">
                {showToast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
