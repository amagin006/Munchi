import { useState, useEffect } from 'react'
import type { Pet, PetInsert, PetUpdate } from '@/lib/pets/types'
import { getPets, createPet, updatePet, deletePet } from '@/lib/pets/pets'

export interface UsePetsReturn {
  pets: Pet[]
  loading: boolean
  error: string | null
  selectedPet: Pet | null
  setSelectedPet: (pet: Pet | null) => void
  refreshPets: () => Promise<void>
  addPet: (petData: PetInsert) => Promise<{ success: boolean; error?: string }>
  updatePet: (petId: string, petData: PetUpdate) => Promise<{ success: boolean; error?: string }>
  deletePet: (petId: string) => Promise<{ success: boolean; error?: string }>
}

export function usePets(): UsePetsReturn {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)

  // Load pets on mount
  useEffect(() => {
    loadPets()
  }, [])

  // Auto-select first pet when pets change
  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0])
    }
  }, [pets, selectedPet])

  const loadPets = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await getPets()

      if (error) {
        setError(error.message || 'Failed to load pets')
        setPets([])
      } else {
        setPets(data || [])
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setPets([])
    } finally {
      setLoading(false)
    }
  }

  const refreshPets = async () => {
    await loadPets()
  }

  const addPet = async (petData: PetInsert): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await createPet(petData)

      if (error) {
        return { success: false, error: error.message || 'Failed to create pet' }
      }

      if (data) {
        setPets(prev => [...prev, data])

        // Auto-select the new pet if it's the first one
        if (pets.length === 0) {
          setSelectedPet(data)
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const updatePetHandler = async (petId: string, petData: PetUpdate): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await updatePet(petId, petData)

      if (error) {
        return { success: false, error: error.message || 'Failed to update pet' }
      }

      if (data) {
        setPets(prev => prev.map(pet => pet.id === petId ? data : pet))

        // Update selected pet if it's the one being updated
        if (selectedPet?.id === petId) {
          setSelectedPet(data)
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const deletePetHandler = async (petId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await deletePet(petId)

      if (error) {
        return { success: false, error: error.message || 'Failed to delete pet' }
      }

      setPets(prev => prev.filter(pet => pet.id !== petId))

      // Clear selected pet if it's the one being deleted
      if (selectedPet?.id === petId) {
        const remainingPets = pets.filter(pet => pet.id !== petId)
        setSelectedPet(remainingPets.length > 0 ? remainingPets[0] : null)
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  return {
    pets,
    loading,
    error,
    selectedPet,
    setSelectedPet,
    refreshPets,
    addPet,
    updatePet: updatePetHandler,
    deletePet: deletePetHandler
  }
}