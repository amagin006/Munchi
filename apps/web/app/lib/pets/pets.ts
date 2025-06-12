import { createClient } from '@/util/supabase/client'
import type { Pet, PetInsert, PetUpdate } from '@/lib/pets/types'
import { validatePetInsert, validatePetUpdate } from '@/lib/pets/types'


/**
 * Get all pets for the current user
 */
export async function getPets(): Promise<{ data: Pet[] | null; error: any }> {
  try {
    const supabaseBrowserClient = createClient()
    const { data: { user } } = await supabaseBrowserClient.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabaseBrowserClient
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
export async function getPetById(petId: string): Promise<{ data: Pet | null; error: any }> {
  try {
    const supabaseBrowserClient = createClient()
    const { data: { user } } = await supabaseBrowserClient.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabaseBrowserClient
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
export async function createPet(petData: PetInsert): Promise<{ data: Pet | null; error: any }> {
  try {
    const supabase = createClient()
    // Validate input data
    const validation = validatePetInsert(petData)
    if (!validation.success) {
      return {
        data: null,
        error: `Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`
      }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabase
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
export async function updatePet(petId: string, petData: PetUpdate): Promise<{ data: Pet | null; error: any }> {
  const supabaseBrowserClient = createClient()
  try {
    // Validate input data
    const validation = validatePetUpdate(petData)
    if (!validation.success) {
      return {
        data: null,
        error: `Validation error: ${validation.error.errors.map(e => e.message).join(', ')}`
      }
    }

    const { data: { user } } = await supabaseBrowserClient.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabaseBrowserClient
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
export async function deletePet(petId: string): Promise<{ error: any }> {
  const supabaseBrowserClient = createClient()
  try {
    const { data: { user } } = await supabaseBrowserClient.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    const { error } = await supabaseBrowserClient
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
export async function getFirstPet(): Promise<{ data: Pet | null; error: any }> {
  const supabaseBrowserClient = createClient()
  try {
    const { data: { user } } = await supabaseBrowserClient.auth.getUser()

    if (!user) {
      return { data: null, error: 'User not authenticated' }
    }

    const { data, error } = await supabaseBrowserClient
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