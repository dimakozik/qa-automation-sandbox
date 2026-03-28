import { useState } from 'react'

interface FormState {
  text: string
  textarea: string
  checkboxA: boolean
  checkboxB: boolean
  checkboxC: boolean
  radio: string
  select: string
  date: string
  range: number
}

const INITIAL: FormState = {
  text: '',
  textarea: '',
  checkboxA: false,
  checkboxB: false,
  checkboxC: false,
  radio: '',
  select: '',
  date: '',
  range: 50,
}

function isComplete(f: FormState): boolean {
  return (
    f.text.trim() !== '' &&
    f.textarea.trim() !== '' &&
    (f.checkboxA || f.checkboxB || f.checkboxC) &&
    f.radio !== '' &&
    f.select !== '' &&
    f.date !== ''
  )
}

export default function FormRoom() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [submitted, setSubmitted] = useState<'idle' | 'success' | 'error'>('idle')

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setSubmitted('idle')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(isComplete(form) ? 'success' : 'error')
  }

  return (
    <div data-testid="form-room" className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Form &amp; Elements</h1>
      <p className="text-sm text-gray-500 mb-8">
        Every input type for Playwright to interact with. Submit validates all fields.
      </p>

      <form data-testid="form-elements-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Text Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Text Fields</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="text-input"
                data-testid="text-input"
                type="text"
                value={form.text}
                onChange={(e) => set('text', e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="textarea-input" className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                id="textarea-input"
                data-testid="textarea-input"
                value={form.textarea}
                onChange={(e) => set('textarea', e.target.value)}
                rows={3}
                placeholder="Enter your comments..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Checkboxes</h2>
          <div className="space-y-2">
            {(['A', 'B', 'C'] as const).map((letter) => {
              const key = `checkbox${letter}` as 'checkboxA' | 'checkboxB' | 'checkboxC'
              return (
                <label key={letter} className="flex items-center gap-3 cursor-pointer">
                  <input
                    data-testid={`checkbox-${letter.toLowerCase()}`}
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="w-4 h-4 accent-indigo-600"
                  />
                  <span className="text-sm text-gray-700">Option {letter}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Radio Group */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Radio Group</h2>
          <div className="space-y-2">
            {['Alpha', 'Beta', 'Gamma'].map((opt) => (
              <label key={opt} className="flex items-center gap-3 cursor-pointer">
                <input
                  data-testid={`radio-${opt.toLowerCase()}`}
                  type="radio"
                  name="radio-group"
                  value={opt}
                  checked={form.radio === opt}
                  onChange={(e) => set('radio', e.target.value)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Select + Date + Range */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Select, Date &amp; Range</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="select-input" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                id="select-input"
                data-testid="select-input"
                value={form.select}
                onChange={(e) => set('select', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select a country --</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="de">Germany</option>
              </select>
            </div>

            <div>
              <label htmlFor="date-input" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                id="date-input"
                data-testid="date-input"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="range-input" className="block text-sm font-medium text-gray-700 mb-1">
                Range: <span data-testid="range-value">{form.range}</span>
              </label>
              <input
                id="range-input"
                data-testid="range-input"
                type="range"
                min={0}
                max={100}
                value={form.range}
                onChange={(e) => set('range', Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            data-testid="submit-button"
            type="submit"
            className="bg-indigo-600 text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Submit Form
          </button>
          {submitted === 'success' && (
            <p data-testid="success-message" className="text-sm font-medium text-green-600">
              ✓ All fields validated — form submitted successfully!
            </p>
          )}
          {submitted === 'error' && (
            <p data-testid="error-message" className="text-sm font-medium text-red-600">
              ✗ Please fill in all required fields.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
