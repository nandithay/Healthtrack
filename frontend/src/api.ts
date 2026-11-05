import type { AnalysisResponse, SavedAnalysis } from './types'

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = body?.detail
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail) && detail.length > 0
        ? detail[0].msg
        : 'The request could not be completed. Please try again.'
    throw new Error(message)
  }
  return body as T
}

export async function analyzeSymptoms(symptoms: string): Promise<AnalysisResponse> {
  return readJson<AnalysisResponse>(await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  }))
}

export async function saveAnalysis(symptoms: string): Promise<SavedAnalysis> {
  return readJson<SavedAnalysis>(await fetch('/api/analyses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  }))
}

export async function getHistory(): Promise<SavedAnalysis[]> {
  const data = await readJson<{ analyses: SavedAnalysis[] }>(await fetch('/api/analyses'))
  return data.analyses
}

