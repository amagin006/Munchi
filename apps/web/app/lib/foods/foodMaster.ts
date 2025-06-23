import type { Pet, PetInsert, PetUpdate } from '@/lib/pets/types'
import { validatePetInsert, validatePetUpdate } from '@/lib/pets/types'
import type { SupabaseClient } from '@supabase/supabase-js';
import type { FoodMaster, FoodMasterInsert } from '@/lib/foods/types'

/**
 * Get all pets for the current user
 */
export async function getFoodMaster(client: SupabaseClient): Promise<{ data: FoodMaster[] | null; error: any }> {
  try {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await client
      .from("food_master")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .eq("is_favorite", true)
      .order("name");

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Create a new food for the current user
 */
export async function createFood(client: SupabaseClient, foodData: FoodMasterInsert): Promise<{ data: any; error: any }> {
  try {
    // TODO: Add validation for foodData if needed
    const { data: { user } } = await client.auth.getUser();
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }
    const { data, error } = await client
      .from('food_master')
      .insert({
        ...foodData,
        user_id: user.id,
      })
      .select()
      .single();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

