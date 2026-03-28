import type { Room, NavItem } from '../types'

const NAV_ITEMS: NavItem[] = [
  // Core rooms
  { id: 'auth',         label: 'Auth & Session',       icon: '🔐', section: 'Core' },
  { id: 'form',         label: 'Form & Elements',       icon: '📋' },
  { id: 'dynamic',      label: 'Dynamic & Async',       icon: '⚡' },
  { id: 'table',        label: 'Table & Data',          icon: '📊' },
  { id: 'interactions', label: 'Interactions & Shadow', icon: '🎯' },
  { id: 'cdp',          label: 'CDP (System)',           icon: '🛰️' },
  // Advanced rooms
  { id: 'mock-api',     label: 'Mock API',              icon: '🔌', section: 'Advanced' },
  { id: 'iframe',       label: 'iFrame',                icon: '🖼️' },
  { id: 'shadow-dom',   label: 'Shadow DOM',            icon: '👻' },
  { id: 'toast',        label: 'Toast & Alerts',        icon: '🔔' },
  { id: 'retry',        label: 'Retry & Flaky',         icon: '🎲' },
  { id: 'pagination',   label: 'Pagination & Scroll',   icon: '📄' },
  { id: 'upload',       label: 'File Upload',           icon: '📁' },
  { id: 'a11y',         label: 'Keyboard & a11y',       icon: '♿' },
]

interface SidebarProps {
  activeRoom: Room
  onNavigate: (room: Room) => void
}

export default function Sidebar({ activeRoom, onNavigate }: SidebarProps) {
  let lastSection = ''

  return (
    <aside
      data-testid="sidebar"
      className="w-64 min-h-screen bg-gray-900 flex flex-col flex-shrink-0"
    >
      <div className="px-6 py-5 border-b border-gray-700">
        <p data-testid="sidebar-logo" className="text-xs font-semibold uppercase tracking-widest text-gray-400 mt-1">
          QA Automation Sandbox
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" data-testid="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const showSection = item.section && item.section !== lastSection
          if (item.section) lastSection = item.section
          const isActive = item.id === activeRoom

          return (
            <div key={item.id}>
              {showSection && (
                <p className="px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {item.section}
                </p>
              )}
              <button
                data-testid={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            </div>
          )
        })}
      </nav>

      <div className="px-6 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">Playwright Test Target v2.0</p>
      </div>
    </aside>
  )
}
