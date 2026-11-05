export function validateSymptoms(value: string): string | null {
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (cleaned.length < 10) return 'Describe the symptoms in at least 10 characters.'
  if (cleaned.length > 2000) return 'Keep the symptom description under 2,000 characters.'
  if (!/\p{L}/u.test(cleaned)) return 'Symptoms must contain words, not only numbers or symbols.'
  return null
}

