import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Focus Trap Modal ─────────────────────────────────────────────────────────
function FocusTrapModal({ onClose }: { onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    const modal = modalRef.current
    if (!modal) return

    // Trap focus on open
    const firstEl = modal.querySelectorAll<HTMLElement>(FOCUSABLE)[0]
    firstEl?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = Array.from(modal!.querySelectorAll<HTMLElement>(FOCUSABLE))
      const first = focusable[0]
      const last  = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus() }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      data-testid="modal-overlay"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        data-testid="modal"
        className="bg-white rounded-xl shadow-2xl w-96 p-6"
      >
        <h2 id="modal-title" data-testid="modal-title" className="text-lg font-bold text-gray-900 mb-2">
          Focus Trap Modal
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Tab cycles within this modal. Escape closes it. Focus never escapes.
        </p>
        <div className="space-y-3">
          <input
            data-testid="modal-input"
            type="text"
            placeholder="Input inside modal"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            data-testid="modal-select"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Option A</option>
            <option>Option B</option>
            <option>Option C</option>
          </select>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            data-testid="modal-confirm"
            onClick={onClose}
            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Confirm
          </button>
          <button
            data-testid="modal-cancel"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Arrow-key List ───────────────────────────────────────────────────────────
const LIST_ITEMS = ['Dashboard', 'Analytics', 'Reports', 'Settings', 'Users', 'Billing', 'Integrations']

function ArrowKeyList() {
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, LIST_ITEMS.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(LIST_ITEMS.length - 1)
    }
  }

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const item = list.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
        Arrow Key Navigation
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Click the list, then use ↑ ↓ Home End keys. Tests <code>page.keyboard.press('ArrowDown')</code>.
      </p>
      <ul
        ref={listRef}
        data-testid="arrow-key-list"
        role="listbox"
        aria-label="Navigation menu"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="border border-gray-200 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 divide-y divide-gray-100"
      >
        {LIST_ITEMS.map((item, i) => (
          <li
            key={item}
            role="option"
            aria-selected={i === activeIndex}
            data-testid={`list-item-${i}`}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
              i === activeIndex
                ? 'bg-indigo-600 text-white font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-gray-400">
        Selected: <span data-testid="arrow-key-selected" className="font-semibold text-gray-700">{LIST_ITEMS[activeIndex]}</span>
      </p>
    </div>
  )
}

// ─── ARIA Live Region ─────────────────────────────────────────────────────────
function AriaLiveRegion() {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [live, setLive] = useState('')
  const counter = useRef(0)

  function announce(msg: string) {
    counter.current++
    setLive(msg)
    setAnnouncements((a) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...a].slice(0, 6))
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
        ARIA Live Region
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Announcements read aloud by screen readers. Tests <code>toHaveText</code> on{' '}
        <code>aria-live</code> regions.
      </p>

      {/* Hidden live region — screen readers pick this up */}
      <div
        data-testid="aria-live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {live}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { label: 'Saved', msg: '✓ Changes saved successfully' },
          { label: 'Error', msg: '✗ Failed to connect to server' },
          { label: 'Loading', msg: '⏳ Loading data, please wait...' },
          { label: 'Warning', msg: '⚠ Session expires in 2 minutes' },
        ].map(({ label, msg }) => (
          <button
            key={label}
            data-testid={`announce-${label.toLowerCase()}`}
            onClick={() => announce(msg)}
            className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Announce {label}
          </button>
        ))}
      </div>

      {announcements.length > 0 && (
        <div data-testid="announcement-log" className="space-y-1">
          {announcements.map((a, i) => (
            <p key={i} data-testid={`announcement-${i}`} className="text-xs font-mono text-gray-500 px-2 py-1 bg-gray-50 rounded">
              {a}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tab Order Visualizer ─────────────────────────────────────────────────────
const TAB_FIELDS: Array<{ id: string; label: string; full: boolean }> = [
  { id: 'tab-first-name', label: 'First Name (tab 1)', full: false },
  { id: 'tab-last-name',  label: 'Last Name (tab 2)',  full: false },
  { id: 'tab-email',      label: 'Email (tab 3)',      full: false },
  { id: 'tab-phone',      label: 'Phone (tab 4)',      full: false },
  { id: 'tab-address',    label: 'Address (tab 5)',    full: true  },
]

function TabOrderVisualizer() {
  const [focused, setFocused] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
        Tab Order &amp; Focus Highlight
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Press Tab to move focus through the fields in DOM order. Tests <code>page.keyboard.press('Tab')</code>{' '}
        and <code>toBeFocused()</code>.
      </p>
      <div data-testid="tab-order-form" className="grid grid-cols-2 gap-3">
        {TAB_FIELDS.map(({ id, label, full }) => (
          <div key={id} className={`relative ${full ? 'col-span-2' : ''}`}>
            {focused === id && (
              <span className="absolute -top-2 -left-1 bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded font-bold z-10">
                focused
              </span>
            )}
            <input
              data-testid={`tab-input-${id}`}
              id={id}
              type="text"
              placeholder={label}
              onFocus={() => setFocused(id)}
              onBlur={() => setFocused(null)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none transition-colors ${
                focused === id
                  ? 'border-indigo-500 ring-2 ring-indigo-300 bg-indigo-50'
                  : 'border-gray-300'
              }`}
            />
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Currently focused:{' '}
        <span data-testid="tab-focused-field" className="font-mono text-indigo-600">
          {focused ?? 'none'}
        </span>
      </p>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function A11yRoom() {
  const [modalOpen, setModalOpen] = useState(false)
  const openModal  = useCallback(() => setModalOpen(true),  [])
  const closeModal = useCallback(() => setModalOpen(false), [])

  return (
    <div data-testid="a11y-room" className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Keyboard &amp; a11y</h1>
        <p className="text-sm text-gray-500">
          Focus trapping, keyboard navigation, ARIA live regions, and tab-order verification.
        </p>
      </div>

      {/* Focus trap modal trigger */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
          Focus Trap Modal
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Focus is trapped inside the modal. Tab and Shift+Tab cycle within it. Escape closes.
          Tests <code>page.keyboard.press('Tab')</code> and <code>toBeFocused()</code>.
        </p>
        <button
          data-testid="open-modal-button"
          onClick={openModal}
          className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Open Modal
        </button>
      </div>

      <ArrowKeyList />
      <AriaLiveRegion />
      <TabOrderVisualizer />

      {modalOpen && <FocusTrapModal onClose={closeModal} />}
    </div>
  )
}
