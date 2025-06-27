import { createClient } from '@/util/supabase/client'
import type { Pet, PetInsert, PetUpdate } from '@/lib/pets/types'
import { validatePetInsert, validatePetUpdate } from '@/lib/pets/types'
import type { SupabaseClient } from '@supabase/supabase-js';


/**
 * Get all pets for the current user
 */
export async function getPets(client: SupabaseClient): Promise<{ data: Pet[] | null; error: any }> {
  try {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await client
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Get a specific pet by ID
 */
export async function getPetById(client: SupabaseClient, petId: string): Promise<{ data: Pet | null; error: any }> {
  try {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await client
      .from('pets')
      .select('*')
      .eq('id', petId)
      .eq('user_id', user.id)
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Create a new pet with validation
 */
export async function createPet(client: SupabaseClient, petData: PetInsert): Promise<{ data: Pet | null; error: any }> {
  try {
    // Validate input data
    const validation = validatePetInsert(petData)
    if (!validation.success) {
      return {
        data: null,
        error: `Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`
      }
    }

    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await client
      .from('pets')
      .insert({
        ...validation.data,
        user_id: user.id
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Update an existing pet with validation
 */
export async function updatePet(client: SupabaseClient, petId: string, petData: PetUpdate): Promise<{ data: Pet | null; error: any }> {
  try {
    // Validate input data
    const validation = validatePetUpdate(petData)
    if (!validation.success) {
      return {
        data: null,
        error: `Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`
      }
    }

    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await client
      .from('pets')
      .update(validation.data)
      .eq('id', petId)
      .eq('user_id', user.id)
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Delete a pet
 */
export async function deletePet(client: SupabaseClient, petId: string): Promise<{ error: any }> {
  try {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    const { error } = await client
      .from('pets')
      .delete()
      .eq('id', petId)
      .eq('user_id', user.id)

    return { error }
  } catch (error) {
    return { error }
  }
}

/**
 * Get the user's first pet (for default selection)
 */
export async function getFirstPet(client: SupabaseClient): Promise<{ data: Pet | null; error: any }> {
  try {
    const { data: { user } } = await client.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await client
      .from('pets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}