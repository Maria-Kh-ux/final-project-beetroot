export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Ingredient {
  name: string;
  amount: string;
  category: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  difficulty: Difficulty;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  steps: string[];
  category: string;
  tags: string[];
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  completed: boolean;
  recipeName?: string;
}

export interface UserPreferences {
  diet: 'all' | 'vegetarian' | 'vegan' | 'gluten-free' | 'low-carb';
  favoriteCategories: string[];
  maxTime: number; // in minutes
}

export interface FridgeState {
  ingredients: string[]; // names of ingredients in lowercase
}
