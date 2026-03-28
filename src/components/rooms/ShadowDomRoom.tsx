import { useEffect, useRef, useState } from 'react'

const PLAYWRIGHT_SNIPPET = `// Playwright pierces open shadow roots automatically
// Use locator chaining — no special API needed for open shadow DOM

// Read value from shadow input
const shadowInput = page.locator('qa-sandbox-widget').locator('[data-testid="shadow-input"]')
await shadowInput.fill('hello from playwright')

// Click the shadow button
await page.locator('qa-sandbox-widget').locator('[data-testid="shadow-submit"]').click()

// Assert the shadow output
await expect(
  page.locator('qa-sandbox-widget').locator('[data-testid="shadow-output"]')
).toContainText('hello from playwright')

// CSS selector approach (also works for open shadow roots)
await page.locator('qa-sandbox-widget >> [data-testid="shadow-counter"]').waitFor()`

export default function ShadowDomRoom() {
  const hostRef = useRef<HTMLDivElement>(null)
  const [externalValue, setExternalValue] = useState<string | null>(null)
  const [showSnippet, setShowSnippet] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host || host.shadowRoot) return

    const shadow = host.attachShadow({ mode: 'open' })

    shadow.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
        .widget { padding: 20px; background: #1e1b4b; border-radius: 12px; color: white; }
        .title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #a5b4fc; margin-bottom: 16px; }
        .badge { display: inline-block; background: #312e81; color: #c7d2fe; font-size: 10px; padding: 2px 8px; border-radius: 999px; margin-bottom: 12px; }
        label { display: block; font-size: 12px; color: #c7d2fe; margin-bottom: 4px; }
        input { width: 100%; padding: 8px 10px; background: #312e81; border: 1px solid #4f46e5; border-radius: 6px; color: white; font-size: 13px; outline: none; margin-bottom: 10px; }
        input::placeholder { color: #6366f1; }
        input:focus { border-color: #818cf8; }
        .buttons { display: flex; gap: 8px; }
        button { padding: 7px 14px; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .btn-primary { background: #6366f1; color: white; }
        .btn-primary:hover { background: #4f46e5; }
        .btn-secondary { background: #312e81; color: #a5b4fc; }
        .btn-secondary:hover { background: #3730a3; }
        .output { margin-top: 12px; padding: 10px; background: #312e81; border-radius: 6px; font-size: 13px; color: #a5b4fc; min-height: 36px; }
        .counter-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
        .counter-row button { padding: 4px 12px; }
        #shadow-counter { font-size: 20px; font-weight: 700; color: #818cf8; min-width: 30px; text-align: center; }
      </style>
      <div class="widget">
        <div class="badge">⚡ Shadow Root (mode: open)</div>
        <div class="title">Shadow DOM Widget</div>

        <label for="shadow-input-el">Message</label>
        <input id="shadow-input-el" data-testid="shadow-input" placeholder="Type something..." />

        <div class="buttons">
          <button class="btn-primary" data-testid="shadow-submit" id="shadow-submit-btn">Submit</button>
          <button class="btn-secondary" data-testid="shadow-reset" id="shadow-reset-btn">Reset</button>
        </div>

        <div class="output" data-testid="shadow-output" id="shadow-output">Output will appear here...</div>

        <div class="counter-row">
          <button class="btn-secondary" data-testid="shadow-counter-dec" id="shadow-dec">−</button>
          <span data-testid="shadow-counter" id="shadow-counter">0</span>
          <button class="btn-secondary" data-testid="shadow-counter-inc" id="shadow-inc">+</button>
        </div>
      </div>
    `

    let count = 0

    shadow.getElementById('shadow-submit-btn')!.addEventListener('click', () => {
      const val = (shadow.getElementById('shadow-input-el') as HTMLInputElement).value
      const out = shadow.getElementById('shadow-output')!
      out.textContent = val || '(empty)'
      // Dispatch a custom event so the outer React component can observe it
      host.dispatchEvent(new CustomEvent('shadow-submit', { detail: val, bubbles: true }))
    })

    shadow.getElementById('shadow-reset-btn')!.addEventListener('click', () => {
      ;(shadow.getElementById('shadow-input-el') as HTMLInputElement).value = ''
      shadow.getElementById('shadow-output')!.textContent = 'Output will appear here...'
      host.dispatchEvent(new CustomEvent('shadow-submit', { detail: null, bubbles: true }))
    })

    shadow.getElementById('shadow-inc')!.addEventListener('click', () => {
      count++
      shadow.getElementById('shadow-counter')!.textContent = String(count)
    })

    shadow.getElementById('shadow-dec')!.addEventListener('click', () => {
      count--
      shadow.getElementById('shadow-counter')!.textContent = String(count)
    })
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const handler = (e: Event) => {
      setExternalValue((e as CustomEvent<string | null>).detail)
    }
    host.addEventListener('shadow-submit', handler)
    return () => host.removeEventListener('shadow-submit', handler)
  }, [])

  return (
    <div data-testid="shadow-dom-room" className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Shadow DOM</h1>
        <p className="text-sm text-gray-500">
          A real Web Component with an <strong>open</strong> shadow root. Playwright pierces open
          shadow roots automatically via locator chaining.
        </p>
      </div>

      {/* The custom element host */}
      <div data-testid="shadow-host-wrapper" className="rounded-xl overflow-hidden">
        <div ref={hostRef} />
      </div>

      {/* React-side observation of shadow events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          React Observer (outside shadow root)
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          The shadow widget dispatches a custom event on submit — React listens at the host boundary.
        </p>
        <div data-testid="shadow-external-value" className="text-sm font-mono px-3 py-2 bg-gray-50 rounded-lg text-gray-700">
          Last submitted value:{' '}
          <span className="text-indigo-600">
            {externalValue === null ? '(none yet)' : externalValue === '' ? '(empty reset)' : `"${externalValue}"`}
          </span>
        </div>
      </div>

      {/* Playwright snippet */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Playwright Snippet
          </h2>
          <button
            data-testid="toggle-shadow-snippet"
            onClick={() => setShowSnippet((s) => !s)}
            className="text-xs px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
          >
            {showSnippet ? 'Hide' : 'Show'} Code
          </button>
        </div>
        {showSnippet ? (
          <pre data-testid="shadow-snippet" className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre">
            {PLAYWRIGHT_SNIPPET}
          </pre>
        ) : (
          <p className="text-sm text-gray-400 italic">Click "Show Code" to see how to automate shadow DOM with Playwright.</p>
        )}
      </div>
    </div>
  )
}
