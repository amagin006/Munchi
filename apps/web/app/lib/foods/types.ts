export interface FoodMaster {
  id: string;
  name: string;
  brand: string;
  type: string;
  calories_per_100g: number | null;
  is_favorite: boolean;
  usage_count: number;
  last_used_at: string | null;
}

export interface RecentRecord {
  food_name: string;
  food_brand: string;
  amount_given: number | null;
  meal_time: string;
}

export interface FoodMasterInsert {
  name: string;
  brand?: string;
  type: string;
  calories_per_100g?: number | null;
  protein_per_100g?: number | null;
  fat_per_100g?: number | null;
  carb_per_100g?: number | null;
  package_size?: number | null;
  price?: number | null;
  purchase_url?: string | null;
  is_favorite?: boolean;
  is_active?: boolean;
  usage_count?: number;
}