import { useState } from 'react'
import type { ApiRequest, ApiResponse } from '../../types'

const ENDPOINTS = [
  '/api/users',
  '/api/users/42',
  '/api/products',
  '/api/orders/7',
  '/api/auth/token',
]

const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 422, 429, 500, 503]

const MOCK_BODIES: Record<number, unknown> = {
  200: { success: true, data: { id: 42, name: 'Jane Doe', email: 'jane@example.com', role: 'admin' } },
  201: { success: true, created: true, id: 99, timestamp: new Date().toISOString() },
  204: null,
  400: { success: false, error: 'Bad Request', message: 'Invalid payload structure' },
  401: { success: false, error: 'Unauthorized', message: 'Token missing or expired' },
  403: { success: false, error: 'Forbidden', message: 'Insufficient permissions' },
  404: { success: false, error: 'Not Found', message: 'Resource does not exist' },
  422: { success: false, error: 'Unprocessable Entity', errors: [{ field: 'email', message: 'Invalid format' }] },
  429: { success: false, error: 'Too Many Requests', retryAfter: 60 },
  500: { success: false, error: 'Internal Server Error', message: 'Something went wrong on the server' },
  503: { success: false, error: 'Service Unavailable', message: 'Server is temporarily down' },
}

function statusColor(code: number) {
  if (code < 300) return 'text-green-400'
  if (code < 400) return 'text-yellow-400'
  if (code < 500) return 'text-orange-400'
  return 'text-red-400'
}

async function simulateFetch(req: ApiRequest): Promise<ApiResponse> {
  await new Promise((r) => setTimeout(r, req.delay))
  const body = MOCK_BODIES[req.statusCode] ?? { error: 'Unknown status' }
  return {
    status: req.statusCode,
    ok: req.statusCode >= 200 && req.statusCode < 300,
    headers: {
      'content-type': 'application/json',
      'x-request-id': crypto.randomUUID(),
      'x-response-time': `${req.delay}ms`,
    },
    body,
    duration: req.delay,
    timestamp: new Date().toISOString(),
  }
}

export default function MockApiRoom() {
  const [req, setReq] = useState<ApiRequest>({
    method: 'GET',
    endpoint: '/api/users',
    statusCode: 200,
    delay: 300,
    body: '{\n  "name": "Jane Doe",\n  "email": "jane@example.com"\n}',
  })
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<ApiResponse[]>([])

  async function handleSend() {
    setLoading(true)
    setResponse(null)
    const res = await simulateFetch(req)
    setResponse(res)
    setHistory((h) => [res, ...h].slice(0, 5))
    setLoading(false)
  }

  const showBody = req.method !== 'GET' && req.method !== 'DELETE'

  return (
    <div data-testid="mock-api-room" className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Mock API</h1>
        <p className="text-sm text-gray-500">
          Simulate HTTP requests with configurable status codes and delays.
          Tests Playwright's <code>page.route()</code> interception patterns.
        </p>
      </div>

      {/* Request Builder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Request Builder</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
            <select
              data-testid="api-method-select"
              value={req.method}
              onChange={(e) => setReq((r) => ({ ...r, method: e.target.value as ApiRequest['method'] }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Endpoint</label>
            <select
              data-testid="api-endpoint-select"
              value={req.endpoint}
              onChange={(e) => setReq((r) => ({ ...r, endpoint: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ENDPOINTS.map((ep) => <option key={ep}>{ep}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mock Status Code</label>
            <select
              data-testid="api-status-select"
              value={req.statusCode}
              onChange={(e) => setReq((r) => ({ ...r, statusCode: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_CODES.map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Delay: <span data-testid="api-delay-value">{req.delay}ms</span>
            </label>
            <input
              data-testid="api-delay-slider"
              type="range"
              min={0}
              max={3000}
              step={100}
              value={req.delay}
              onChange={(e) => setReq((r) => ({ ...r, delay: Number(e.target.value) }))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {showBody && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Request Body (JSON)</label>
            <textarea
              data-testid="api-body-input"
              value={req.body}
              onChange={(e) => setReq((r) => ({ ...r, body: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        )}

        <button
          data-testid="api-send-button"
          onClick={handleSend}
          disabled={loading}
          className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {loading ? 'Sending...' : `Send ${req.method}`}
        </button>
      </div>

      {/* Response Panel */}
      {response && (
        <div data-testid="api-response-panel" className="bg-gray-900 rounded-xl p-5 text-sm font-mono space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span data-testid="api-response-status" className={`font-bold text-lg ${statusColor(response.status)}`}>
                {response.status}
              </span>
              <span className="text-gray-400">{response.ok ? '✓ OK' : '✗ Error'}</span>
            </div>
            <span data-testid="api-response-duration" className="text-gray-500 text-xs">
              {response.duration}ms
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Response Headers</p>
            <div data-testid="api-response-headers" className="space-y-0.5">
              {Object.entries(response.headers).map(([k, v]) => (
                <p key={k} className="text-gray-400">
                  <span className="text-indigo-400">{k}:</span> {v}
                </p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Response Body</p>
            <pre data-testid="api-response-body" className="text-green-400 overflow-x-auto whitespace-pre-wrap">
              {response.body === null ? '(no content)' : JSON.stringify(response.body, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Request History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Request History</h2>
          <ul data-testid="api-history" className="space-y-1.5">
            {history.map((h, i) => (
              <li
                key={i}
                data-testid={`api-history-item-${i}`}
                className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 rounded-lg"
              >
                <span className={`font-mono font-bold ${statusColor(h.status)}`}>{h.status}</span>
                <span className="text-gray-500 text-xs">{h.timestamp.slice(11, 23)}</span>
                <span className="text-gray-400 text-xs">{h.duration}ms</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
