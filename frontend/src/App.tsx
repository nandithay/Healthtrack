import { useState, type FormEvent } from 'react'
import {
  Activity,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  FileHeart,
  HeartPulse,
  History,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import { analyzeSymptoms, getHistory, saveAnalysis } from './api'
import type { AnalysisContent, AnalysisResponse, SavedAnalysis } from './types'
import { validateSymptoms } from './validation'

type View = 'analyze' | 'history'

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function ConditionList({ analysis }: { analysis: AnalysisContent }) {
  return (
    <div className="space-y-3">
      {analysis.conditions.map((condition, index) => (
        <div key={`${condition.name}-${index}`} className="condition-card flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div>
            <h4 className="text-base font-semibold text-slate-900">{condition.name}</h4>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{condition.reason}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('analyze')
  const [symptoms, setSymptoms] = useState('')
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [history, setHistory] = useState<SavedAnalysis[]>([])
  const [selectedSaved, setSelectedSaved] = useState<SavedAnalysis | null>(null)
  const [error, setError] = useState('')
  const [historyError, setHistoryError] = useState('')
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<number | null>(null)

  function startNew() {
    setView('analyze')
    setSymptoms('')
    setResult(null)
    setError('')
    setSavedId(null)
    setSelectedSaved(null)
  }

  async function openHistory() {
    setView('history')
    setHistoryError('')
    try {
      setHistory(await getHistory())
    } catch (cause) {
      setHistoryError(cause instanceof Error ? cause.message : 'Could not load history.')
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateSymptoms(symptoms)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setResult(null)
    setSavedId(null)
    setBusy(true)
    try {
      setResult(await analyzeSymptoms(symptoms))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Analysis failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function saveCurrent() {
    if (!result || saving) return
    setSaving(true)
    setError('')
    try {
      const saved = await saveAnalysis(result.symptoms)
      setSavedId(saved.id)
      setHistory((items) => [saved, ...items])
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save this analysis.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-slate-900 lg:flex">
      <aside className="sidebar flex flex-col bg-[#102c36] text-white lg:min-h-screen lg:w-[260px] lg:shrink-0">
        <div className="flex items-center gap-3 px-5 py-5 lg:px-7 lg:py-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#38d6c1] text-[#102c36]">
            <HeartPulse size={24} strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight">HealthTrack</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-teal-200/70">Clinical workspace</div>
          </div>
        </div>

        <nav className="flex gap-2 px-4 pb-4 lg:mt-6 lg:flex-col lg:px-4" aria-label="Main navigation">
          <button onClick={() => setView('analyze')} className={`nav-link ${view === 'analyze' ? 'nav-link-active' : ''}`}>
            <Activity size={18} /> <span>Analyze symptoms</span>
          </button>
          <button onClick={openHistory} className={`nav-link ${view === 'history' ? 'nav-link-active' : ''}`}>
            <History size={18} /> <span>Saved history</span>
          </button>
        </nav>

        <div className="mx-4 mb-5 hidden rounded-2xl border border-white/10 bg-white/5 p-4 lg:mt-auto lg:block">
          <ShieldCheck className="mb-3 text-[#65decf]" size={22} />
          <p className="text-sm font-semibold">Clinical review required</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">AI suggestions support professional judgment. They are not a diagnosis.</p>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10 xl:px-14">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" /> Care intelligence
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#14313a] sm:text-4xl">
              {view === 'analyze' ? 'Symptom analysis' : 'Saved analyses'}
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              {view === 'analyze' ? 'A clearer starting point for clinical assessment.' : 'Revisit previous symptom reviews and their suggested conditions.'}
            </p>
          </div>
          <button onClick={startNew} className="inline-flex items-center gap-2 rounded-xl bg-[#163a45] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#235460] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            <Plus size={17} /> New analysis
          </button>
        </header>

        {view === 'analyze' ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(290px,0.6fr)]">
            <div className="space-y-6">
              <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_12px_42px_rgba(20,49,58,0.05)]">
                <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e5f7f3] text-teal-700"><Stethoscope size={20} /></div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#14313a]">Patient symptoms</h2>
                      <p className="text-sm text-slate-500">Describe what the patient is experiencing.</p>
                    </div>
                  </div>
                </div>
                <form aria-label="Symptom analysis" onSubmit={submit} className="p-6 sm:p-8">
                  <label htmlFor="symptoms" className="mb-2 block text-sm font-semibold text-slate-700">Symptom description <span className="text-rose-600">*</span></label>
                  <textarea
                    id="symptoms"
                    value={symptoms}
                    onChange={(event) => { setSymptoms(event.target.value); if (error) setError('') }}
                    placeholder="Example: Persistent dry cough, fever, fatigue, and shortness of breath for three days..."
                    rows={7}
                    maxLength={2000}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'symptom-error' : 'symptom-help'}
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-[#fbfcfc] px-4 py-4 text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span id="symptom-help">Use fictional details for this demo. Avoid names or identifiers.</span>
                    <span>{symptoms.length}/2,000</span>
                  </div>
                  {error && <div id="symptom-error" role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><CircleAlert className="mt-0.5 shrink-0" size={16} />{error}</div>}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
                    <p className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={16} className="text-teal-600" /> Reviewed by a professional before use</p>
                    <button disabled={busy} type="submit" className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(13,148,136,0.18)] transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
                      {busy ? <><LoaderCircle size={17} className="animate-spin" /> Analyzing...</> : <><Sparkles size={17} /> Analyze symptoms <ArrowRight size={16} /></>}
                    </button>
                  </div>
                </form>
              </section>

              {result && (
                <section aria-live="polite" className="space-y-5 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_42px_rgba(20,49,58,0.05)] sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Analysis complete</div><h2 className="text-xl font-bold text-[#14313a]">Clinical insights</h2></div>
                    <div className="flex items-center gap-2">
                      {result.cached && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">Cached result</span>}
                      <button onClick={saveCurrent} disabled={saving || savedId !== null} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#174650] hover:bg-slate-50 disabled:cursor-default disabled:opacity-60">
                        {savedId !== null ? <><Check size={16} /> Saved</> : saving ? <><LoaderCircle size={16} className="animate-spin" /> Saving</> : <><Bookmark size={16} /> Save analysis</>}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#eff8f5] p-5">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-teal-800"><ClipboardList size={15} /> Submitted symptoms</div>
                    <p className="text-sm leading-relaxed text-slate-700">{result.symptoms}</p>
                  </div>
                  <div><h3 className="mb-2 text-sm font-semibold text-slate-800">AI summary</h3><p className="text-sm leading-relaxed text-slate-600">{result.analysis.summary}</p></div>
                  <div><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">Potential conditions</h3><span className="text-xs text-slate-400">{result.analysis.conditions.length} possibilities</span></div><ConditionList analysis={result.analysis} /></div>
                  <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"><CircleAlert className="mt-0.5 shrink-0" size={18} /><p>{result.analysis.clinical_note}</p></div>
                </section>
              )}
            </div>

            <div className="space-y-6">
              <section className="hero-panel relative overflow-hidden rounded-[24px] bg-[#153c46] p-6 text-white sm:p-7">
                <div className="relative z-10"><div className="mb-7 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#7de1d4]"><FileHeart size={22} /></div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#88e4d7]">Built for better decisions</p><h2 className="mt-2 max-w-[250px] text-2xl font-bold leading-snug">From symptoms to a clearer clinical picture.</h2><p className="mt-3 max-w-[260px] text-sm leading-relaxed text-slate-300">Review possible conditions with context, then apply your own clinical judgment.</p></div>
                <div className="hero-orbit" />
              </section>
              <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 sm:p-7">
                <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Clock3 size={20} /></div><div><h2 className="font-semibold text-[#14313a]">Your workflow</h2><p className="text-xs text-slate-500">Three simple steps</p></div></div>
                <ol className="space-y-4">
                  <li className="flex gap-3"><span className="step-dot">1</span><div><p className="text-sm font-semibold">Describe symptoms</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500">Add a clear, de-identified description.</p></div></li>
                  <li className="flex gap-3"><span className="step-dot">2</span><div><p className="text-sm font-semibold">Review possibilities</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500">Compare the AI suggestions with your assessment.</p></div></li>
                  <li className="flex gap-3"><span className="step-dot">3</span><div><p className="text-sm font-semibold">Save for reference</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500">Return to past analyses from your history.</p></div></li>
                </ol>
              </section>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.65fr)_minmax(0,1fr)]">
            <section className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_12px_42px_rgba(20,49,58,0.05)] sm:p-6">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold text-[#14313a]">Previous reviews</h2><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{history.length} saved</span></div>
              {historyError && <div role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{historyError}</div>}
              {history.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-12 text-center"><History className="mx-auto mb-3 text-slate-300" size={28} /><h3 className="font-semibold text-slate-700">No saved analyses yet</h3><p className="mt-1 text-sm text-slate-500">Run an analysis and select Save analysis to see it here.</p></div> : (
                <div className="space-y-2">{history.map((item) => <button key={item.id} onClick={() => setSelectedSaved(item)} className={`w-full rounded-2xl border p-4 text-left transition hover:border-teal-300 hover:bg-teal-50/40 ${selectedSaved?.id === item.id ? 'border-teal-400 bg-teal-50/40' : 'border-slate-200'}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.symptoms}</p><p className="mt-2 text-xs text-slate-500">{formatDate(item.created_at)} · {item.analysis.conditions.length} conditions</p></div><ChevronRight size={18} className="shrink-0 text-slate-400" /></div></button>)}</div>
              )}
            </section>
            <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_42px_rgba(20,49,58,0.05)] sm:p-8">
              {selectedSaved ? <div className="space-y-5"><div><div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Saved {formatDate(selectedSaved.created_at)}</div><h2 className="text-xl font-bold text-[#14313a]">Analysis details</h2></div><div className="rounded-2xl bg-[#eff8f5] p-5"><div className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-teal-800">Submitted symptoms</div><p className="text-sm leading-relaxed text-slate-700">{selectedSaved.symptoms}</p></div><div><h3 className="mb-2 text-sm font-semibold">AI summary</h3><p className="text-sm leading-relaxed text-slate-600">{selectedSaved.analysis.summary}</p></div><div><h3 className="mb-3 text-sm font-semibold">Potential conditions</h3><ConditionList analysis={selectedSaved.analysis} /></div><div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><CircleAlert className="shrink-0" size={18} /><p>{selectedSaved.analysis.clinical_note}</p></div></div> : <div className="flex min-h-[380px] flex-col items-center justify-center text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"><FileHeart size={28} /></div><h2 className="text-lg font-semibold text-[#14313a]">Select an analysis</h2><p className="mt-2 max-w-xs text-sm text-slate-500">Choose a saved review to see its symptom summary and potential conditions.</p></div>}
            </section>
          </div>
        )}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400"><span>HealthTrack · Clinical decision support prototype</span><span>For educational use with fictional cases only</span></footer>
      </main>
    </div>
  )
}

