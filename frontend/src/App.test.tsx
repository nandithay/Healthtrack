// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { analyzeSymptoms } from './api'

vi.mock('./api', () => ({
  analyzeSymptoms: vi.fn(),
  saveAnalysis: vi.fn(),
  getHistory: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

test('shows an input error, then a summary and three conditions after a valid submission', async () => {
  const user = userEvent.setup()
  vi.mocked(analyzeSymptoms).mockResolvedValue({
    symptoms: 'Fever and cough for three days',
    cached: false,
    analysis: {
      summary: 'Fever and cough have lasted three days.',
      conditions: [
        { name: 'Condition A', reason: 'Reason for A' },
        { name: 'Condition B', reason: 'Reason for B' },
        { name: 'Condition C', reason: 'Reason for C' },
      ],
      clinical_note: 'Professional assessment is required.',
    },
  })

  render(<App />)
  const submitButton = within(screen.getByRole('form', { name: 'Symptom analysis' })).getByRole('button', { name: /analyze symptoms/i })
  await user.type(screen.getByLabelText(/symptom description/i), 'cough')
  await user.click(submitButton)
  expect(screen.getByRole('alert')).toHaveTextContent('at least 10 characters')
  expect(analyzeSymptoms).not.toHaveBeenCalled()

  await user.clear(screen.getByLabelText(/symptom description/i))
  await user.type(screen.getByLabelText(/symptom description/i), 'Fever and cough for three days')
  await user.click(submitButton)

  await waitFor(() => expect(screen.getByText('Fever and cough have lasted three days.')).toBeInTheDocument())
  expect(screen.getByText('Condition A')).toBeInTheDocument()
  expect(screen.getByText('Condition B')).toBeInTheDocument()
  expect(screen.getByText('Condition C')).toBeInTheDocument()
  expect(analyzeSymptoms).toHaveBeenCalledWith('Fever and cough for three days')
})
