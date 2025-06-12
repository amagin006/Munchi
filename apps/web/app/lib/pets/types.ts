import { z } from 'zod'

// Pet type enum
export const PetTypeSchema = z.enum(['cat', 'dog', 'other'])

// Weight unit enum
export const WeightUnitSchema = z.enum(['kg', 'lbs'])

// Base pet schema (from database)
export const PetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1, 'Pet name is required').max(50, 'Pet name must be less than 50 characters'),
  type: PetTypeSchema,
  age: z.number().min(0, 'Age must be positive').max(30, 'Age must be realistic').nullable().optional(),
  weight: z.number().min(0.1, 'Weight must be positive').max(200, 'Weight must be realistic').nullable().optional(),
  weight_unit: WeightUnitSchema.nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

// Schema for creating a new pet
export const PetInsertSchema = z.object({
  name: z.string()
    .min(1, 'Pet name is required')
    .max(50, 'Pet name must be less than 50 characters')
    .trim(),
  type: PetTypeSchema,
  age: z.number()
    .min(0, 'Age must be positive')
    .max(30, 'Age must be realistic')
    .nullable()
    .optional()
    .transform(val => val === null || val === undefined || val === 0 ? null : val),
  weight: z.number()
    .min(0.1, 'Weight must be positive')
    .max(200, 'Weight must be realistic')
    .nullable()
    .optional()
    .transform(val => val === null || val === undefined || val === 0 ? null : val),
  weight_unit: WeightUnitSchema.default('kg'),
})

// Schema for updating a pet (all fields optional except validation rules)
export const PetUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Pet name is required')
    .max(50, 'Pet name must be less than 50 characters')
    .trim()
    .optional(),
  type: PetTypeSchema.optional(),
  age: z.number()
    .min(0, 'Age must be positive')
    .max(30, 'Age must be realistic')
    .nullable()
    .optional()
    .transform(val => val === null || val === undefined || val === 0 ? null : val),
  weight: z.number()
    .min(0.1, 'Weight must be positive')
    .max(200, 'Weight must be realistic')
    .nullable()
    .optional()
    .transform(val => val === null || val === undefined || val === 0 ? null : val),
  weight_unit: WeightUnitSchema.optional(),
})

// Form schema for client-side validation (handles string inputs)
export const PetFormSchema = z.object({
  name: z.string()
    .min(1, 'Pet name is required')
    .max(50, 'Pet name must be less than 50 characters')
    .trim(),
  type: PetTypeSchema,
  age: z.string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return null
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    })
    .pipe(z.number().min(0, 'Age must be positive').max(30, 'Age must be realistic').nullable()),
  weight: z.string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return null
      const num = parseFloat(val)
      return isNaN(num) ? null : num
    })
    .pipe(z.number().min(0.1, 'Weight must be positive').max(200, 'Weight must be realistic').nullable()),
  weight_unit: WeightUnitSchema.default('kg'),
})

// Infer TypeScript types from schemas
export type Pet = z.infer<typeof PetSchema>
export type PetInsert = z.infer<typeof PetInsertSchema>
export type PetUpdate = z.infer<typeof PetUpdateSchema>
export type PetForm = {
  name: string;
  type: z.infer<typeof PetTypeSchema> | undefined;
  age: string;
  weight: string;
  weight_unit: "kg" | "lbs";
};
export type PetType = z.infer<typeof PetTypeSchema>
export type WeightUnit = z.infer<typeof WeightUnitSchema>

// Validation helper functions
export const validatePetInsert = (data: unknown) => {
  return PetInsertSchema.safeParse(data)
}

export const validatePetUpdate = (data: unknown) => {
  return PetUpdateSchema.safeParse(data)
}

export const validatePetForm = (data: unknown) => {
  return PetFormSchema.safeParse(data)
}

// Transform form data to insert data
export const transformFormToPetInsert = (formData: PetForm): PetInsert => {
  return {
    name: formData.name,
    type: formData.type as PetType,
    age: formData.age && formData.age.trim() !== "" ? parseFloat(formData.age) : null,
    weight: formData.weight && formData.weight.trim() !== "" ? parseFloat(formData.weight) : null,
    weight_unit: formData.weight_unit,
  }
}

// Helper function to get display name for pet type
export const getPetTypeDisplayName = (type: PetType): string => {
  switch (type) {
    case 'cat':
      return 'Cat'
    case 'dog':
      return 'Dog'
    case 'other':
      return 'Other'
    default:
      return 'Unknown'
  }
}

// Helper function to format weight display
export const formatWeight = (weight: number | null, unit: WeightUnit | null): string => {
  if (!weight || !unit) return ''
  return `${weight} ${unit}`
}

// Helper function to format age display
export const formatAge = (age: number | null): string => {
  if (!age) return ''
  return age === 1 ? '1 year' : `${age} years`
}