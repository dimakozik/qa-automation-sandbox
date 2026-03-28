import { useState, useEffect, useRef, useCallback } from 'react'

interface Record {
  id: number
  name: string
  email: string
  department: string
  score: number
}

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'QA', 'DevOps', 'Legal', 'Finance']
const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
  'Karen', 'Leo', 'Maya', 'Nate', 'Olivia', 'Peter', 'Quinn', 'Rosa', 'Sam', 'Tina']
const LAST_NAMES  = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore']

function makeRecord(id: number): Record {
  const fn = FIRST_NAMES[id % FIRST_NAMES.length]
  const ln = LAST_NAMES[id % LAST_NAMES.length]
  return {
    id,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@corp.dev`,
    department: DEPARTMENTS[id % DEPARTMENTS.length],
    score: 40 + (id * 37 + 13) % 60,
  }
}

const ALL_RECORDS: Record[] = Array.from({ length: 50 }, (_, i) => makeRecord(i + 1))
const PAGE_SIZE = 8
const INFINITE_BATCH = 10

// ─── Paginated view ───────────────────────────────────────────────────────────
function PaginatedView() {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(ALL_RECORDS.length / PAGE_SIZE)
  const slice = ALL_RECORDS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div data-testid="paginated-view">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="paginated-table">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dept</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slice.map((r) => (
              <tr key={r.id} data-testid={`paginated-row-${r.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-gray-500">{r.email}</td>
                <td className="px-4 py-3 text-gray-600">{r.department}</td>
                <td className="px-4 py-3">
                  <span
                    data-testid={`score-${r.id}`}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.score >= 80 ? 'bg-green-100 text-green-700' :
                      r.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {r.score}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-500" data-testid="pagination-info">
          Page <span data-testid="current-page">{page}</span> of{' '}
          <span data-testid="total-pages">{totalPages}</span> — {ALL_RECORDS.length} records
        </p>
        <div className="flex items-center gap-1">
          <button
            data-testid="prev-page-button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 text-xs border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {pages.map((p) => (
            <button
              key={p}
              data-testid={`page-button-${p}`}
              onClick={() => setPage(p)}
              className={`w-7 h-7 text-xs rounded-md font-medium ${
                p === page
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            data-testid="next-page-button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1 text-xs border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Infinite scroll view ─────────────────────────────────────────────────────
function InfiniteScrollView() {
  const [visible, setVisible] = useState(INFINITE_BATCH)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(() => {
    if (loading || visible >= ALL_RECORDS.length) return
    setLoading(true)
    setTimeout(() => {
      setVisible((v) => Math.min(v + INFINITE_BATCH, ALL_RECORDS.length))
      setLoading(false)
    }, 800)
  }, [loading, visible])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) loadMore() },
      { threshold: 0.1 },
    )
    obs.observe(sentinel)
    return () => obs.disconnect()
  }, [loadMore])

  const slice = ALL_RECORDS.slice(0, visible)
  const hasMore = visible < ALL_RECORDS.length

  return (
    <div data-testid="infinite-scroll-view">
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto" data-testid="infinite-list">
        {slice.map((r) => (
          <div
            key={r.id}
            data-testid={`infinite-row-${r.id}`}
            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {r.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm">{r.name}</p>
              <p className="text-xs text-gray-500 truncate">{r.email}</p>
            </div>
            <span className="text-xs text-gray-400">{r.department}</span>
          </div>
        ))}

        {/* Sentinel for IntersectionObserver */}
        {hasMore && (
          <div ref={sentinelRef} data-testid="infinite-sentinel" className="flex justify-center py-4">
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400" data-testid="infinite-loading">
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Loading more...
              </div>
            ) : (
              <button
                data-testid="load-more-button"
                onClick={loadMore}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Load more ↓
              </button>
            )}
          </div>
        )}

        {!hasMore && (
          <p data-testid="infinite-end" className="text-center text-xs text-gray-400 py-4">
            All {ALL_RECORDS.length} records loaded.
          </p>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
        Showing <span data-testid="infinite-visible-count">{visible}</span> of {ALL_RECORDS.length}
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function PaginationRoom() {
  const [tab, setTab] = useState<'paginated' | 'infinite'>('paginated')

  return (
    <div data-testid="pagination-room" className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pagination &amp; Infinite Scroll</h1>
        <p className="text-sm text-gray-500">
          50 records, two loading strategies. Tests page-button clicks, scroll-triggered loading,
          and <code>IntersectionObserver</code>-based sentinel detection.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-200" data-testid="pagination-tabs">
          {(['paginated', 'infinite'] as const).map((t) => (
            <button
              key={t}
              data-testid={`tab-${t}`}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t === 'paginated' ? '📄 Paginated' : '♾️ Infinite Scroll'}
            </button>
          ))}
        </div>

        {tab === 'paginated' ? <PaginatedView /> : <InfiniteScrollView />}
      </div>
    </div>
  )
}
