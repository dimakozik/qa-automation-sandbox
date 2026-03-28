import { useState, useEffect, useRef } from 'react'

const ITEMS = [
  'Playwright', 'Cypress', 'Selenium', 'Puppeteer',
  'WebdriverIO', 'TestCafe', 'Nightwatch', 'Appium',
]

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function DynamicRoom() {
  // Search
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebounce(searchInput, 500)
  const filtered = ITEMS.filter((i) =>
    i.toLowerCase().includes(debouncedSearch.toLowerCase()),
  )

  // Slow load
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done'>('idle')
  function handleSlowLoad() {
    if (loadState === 'loading') return
    setLoadState('loading')
    setTimeout(() => setLoadState('done'), 3000)
  }

  // Hidden trigger
  const [hiddenVisible, setHiddenVisible] = useState(false)
  const [triggerDisabled, setTriggerDisabled] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  function handleHiddenTrigger() {
    if (triggerDisabled) return
    setTriggerDisabled(true)
    setHiddenVisible(false)
    const delay = 1000 + Math.random() * 3000
    timerRef.current = setTimeout(() => {
      setHiddenVisible(true)
      setTriggerDisabled(false)
    }, delay)
  }

  return (
    <div data-testid="dynamic-room" className="p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dynamic &amp; Async</h1>
        <p className="text-sm text-gray-500">
          Tests for waiting, polling, and async element appearance in Playwright.
        </p>
      </div>

      {/* Debounced Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Debounced Search <span className="text-gray-400 font-normal">(500ms)</span>
        </h2>
        <input
          data-testid="search-input"
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Type to filter tools..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />
        <ul data-testid="search-results" className="space-y-1">
          {filtered.length === 0 ? (
            <li data-testid="search-no-results" className="text-sm text-gray-400 italic">No results found.</li>
          ) : (
            filtered.map((item) => (
              <li
                key={item}
                data-testid={`search-result-${item.toLowerCase()}`}
                className="text-sm text-gray-700 px-3 py-1.5 bg-gray-50 rounded-md"
              >
                {item}
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Slow Load */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Slow Load <span className="text-gray-400 font-normal">(3s delay)</span>
        </h2>
        <button
          data-testid="slow-load-button"
          onClick={handleSlowLoad}
          disabled={loadState === 'loading'}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadState === 'loading' ? 'Loading...' : 'Trigger Slow Load'}
        </button>

        {loadState === 'loading' && (
          <div className="mt-4 flex items-center gap-3" data-testid="loading-spinner">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Fetching data, please wait...</span>
          </div>
        )}

        {loadState === 'done' && (
          <div data-testid="slow-load-data" className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">Data loaded successfully!</p>
            <p className="text-xs text-green-600 mt-1 font-mono">
              {JSON.stringify({ status: 'ok', records: 42, timestamp: new Date().toISOString() })}
            </p>
          </div>
        )}
      </div>

      {/* Hidden Trigger */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Hidden Trigger <span className="text-gray-400 font-normal">(random 1–4s delay)</span>
        </h2>
        <button
          data-testid="hidden-trigger-button"
          onClick={handleHiddenTrigger}
          disabled={triggerDisabled}
          className="bg-amber-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {triggerDisabled ? 'Waiting...' : 'Fire Hidden Trigger'}
        </button>

        {hiddenVisible && (
          <div
            data-testid="hidden-element"
            className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <p className="text-sm font-medium text-amber-800">
              Hidden element appeared! <span className="font-mono">TRIGGER_SUCCESS</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
