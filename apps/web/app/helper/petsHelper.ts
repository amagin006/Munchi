export const formatAge = (age: number | null | undefined): string => {
  if (age === null || age === undefined) return "Unknown age";
  return `${age} ${age === 1 ? 'year' : 'years'}`;
};

export const formatWeight = (weight: number | null | undefined, unit: string | null | undefined): string => {
  if (weight === null || weight === undefined) return "Unknown weight";
  return `${weight} ${unit || 'kg'}`;
};