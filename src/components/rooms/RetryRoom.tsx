import { useState } from 'react'

// ---------- Deterministic: fails first N-1 attempts ----------
function DeterministicRetry() {
  const MAX_FAILURES = 2
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    setLoading(false)
    const next = attempts + 1
    setAttempts(next)
    setStatus(next > MAX_FAILURES ? 'success' : 'error')
  }

  function reset() {
    setAttempts(0)
    setStatus('idle')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
        Deterministic Failure
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Fails the first {MAX_FAILURES} clicks, succeeds on click #{MAX_FAILURES + 1}.
        Good for testing Playwright's <code>toPass()</code> retry helper.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <button
          data-testid="retry-button"
          onClick={handleClick}
          disabled={loading || status === 'success'}
          className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {status === 'success' ? '✓ Done' : 'Attempt Action'}
        </button>
        <button
          data-testid="retry-reset"
          onClick={reset}
          className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Attempts</p>
          <p data-testid="retry-attempt-count" className="text-xl font-bold text-gray-800">{attempts}</p>
        </div>
        <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Remaining failures</p>
          <p data-testid="retry-failures-left" className="text-xl font-bold text-orange-500">
            {Math.max(0, MAX_FAILURES - attempts)}
          </p>
        </div>
        <div className="text-center px-3 py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">Status</p>
          <p
            data-testid="retry-status"
            className={`text-sm font-bold mt-1 ${
              status === 'success' ? 'text-green-600' :
              status === 'error'   ? 'text-red-600'   :
              'text-gray-400'
            }`}
          >
            {status === 'idle' ? '—' : status.toUpperCase()}
          </p>
        </div>
      </div>

      {status === 'error' && (
        <div data-testid="retry-error-message" className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          ✗ Request failed (attempt {attempts}/{MAX_FAILURES + 1} required for success)
        </div>
      )}
      {status === 'success' && (
        <div data-testid="retry-success-message" className="mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          ✓ Success after {attempts} attempt{attempts !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ---------- Probabilistic: random 40% failure rate ----------
function ProbabilisticRetry() {
  const FAIL_RATE = 0.4
  const [results, setResults] = useState<Array<'success' | 'error'>>([])
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400 + Math.random() * 400))
    setLoading(false)
    const outcome: 'success' | 'error' = Math.random() < FAIL_RATE ? 'error' : 'success'
    setResults((r) => [outcome, ...r].slice(0, 20))
  }

  const successCount = results.filter((r) => r === 'success').length
  const errorCount   = results.filter((r) => r === 'error').length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
        Probabilistic Failure
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Fails randomly ~{Math.round(FAIL_RATE * 100)}% of the time. Simulate real-world flakiness.
        Tests <code>expect.poll()</code> and retry-aware assertions.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <button
          data-testid="flaky-button"
          onClick={handleClick}
          disabled={loading}
          className="bg-amber-500 text-white py-2 px-5 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          Flaky Action
        </button>
        <button
          data-testid="flaky-clear"
          onClick={() => setResults([])}
          className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-green-50 rounded-lg flex-1">
              <p className="text-xs text-gray-500">Successes</p>
              <p data-testid="flaky-success-count" className="text-xl font-bold text-green-600">{successCount}</p>
            </div>
            <div className="text-center px-4 py-2 bg-red-50 rounded-lg flex-1">
              <p className="text-xs text-gray-500">Failures</p>
              <p data-testid="flaky-error-count" className="text-xl font-bold text-red-600">{errorCount}</p>
            </div>
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg flex-1">
              <p className="text-xs text-gray-500">Rate</p>
              <p data-testid="flaky-success-rate" className="text-xl font-bold text-gray-700">
                {results.length ? Math.round((successCount / results.length) * 100) : 0}%
              </p>
            </div>
          </div>

          <div data-testid="flaky-history" className="flex flex-wrap gap-1.5 pt-1">
            {results.map((r, i) => (
              <span
                key={i}
                data-testid={`flaky-result-${i}`}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  r === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
                title={r}
              >
                {r === 'success' ? '✓' : '✗'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Loading state race: button disabled during in-flight request ----------
function DoubleSubmitGuard() {
  const [submitted, setSubmitted] = useState(false)
  const [submitCount, setSubmitCount] = useState(0)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setSubmitCount((c) => c + 1)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
        Double-Submit Guard
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Button is disabled during a 2s in-flight request — tests that a rapid second click is ignored.
      </p>

      <div className="flex items-center gap-3">
        <button
          data-testid="double-submit-button"
          onClick={handleSubmit}
          disabled={loading || submitted}
          className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitted ? '✓ Submitted' : loading ? 'Processing...' : 'Submit'}
        </button>
        <button
          data-testid="double-submit-reset"
          onClick={() => { setSubmitted(false); setSubmitCount(0) }}
          className="text-sm px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Submit fires triggered:{' '}
        <span data-testid="double-submit-count" className="font-bold text-gray-700">{submitCount}</span> time{submitCount !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function RetryRoom() {
  return (
    <div data-testid="retry-room" className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Retry &amp; Flaky</h1>
        <p className="text-sm text-gray-500">
          Three patterns that expose retry logic, flakiness handling, and race condition guards.
        </p>
      </div>
      <DeterministicRetry />
      <ProbabilisticRetry />
      <DoubleSubmitGuard />
    </div>
  )
}
