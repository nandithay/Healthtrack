export interface Condition {
  name: string
  reason: string
}

export interface AnalysisContent {
  summary: string
  conditions: Condition[]
  clinical_note: string
}

export interface AnalysisResponse {
  symptoms: string
  analysis: AnalysisContent
  cached: boolean
}

export interface SavedAnalysis {
  id: number
  symptoms: string
  analysis: AnalysisContent
  created_at: string
}

