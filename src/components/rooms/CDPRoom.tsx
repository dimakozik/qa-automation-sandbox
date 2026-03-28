import { useState, useEffect } from 'react'

interface Coords {
  lat: number
  lng: number
}

export default function CDPRoom() {
  // Geolocation
  const [coords, setCoords] = useState<Coords | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGeoLoading(false)
      },
      (err) => {
        setGeoError(err.message)
        setGeoLoading(false)
      },
    )
  }

  // Network status
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Console audit
  const [auditFired, setAuditFired] = useState(false)
  function handleConsoleLog() {
    console.log({
      event: 'audit',
      timestamp: Date.now(),
      payload: 'qa-sandbox-audit-v1',
      source: 'CDPRoom',
    })
    setAuditFired(true)
    setTimeout(() => setAuditFired(false), 2000)
  }

  return (
    <div data-testid="cdp-room" className="p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">CDP (System)</h1>
        <p className="text-sm text-gray-500">
          Browser APIs accessible via Chrome DevTools Protocol in Playwright.
        </p>
      </div>

      {/* Geolocation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Geolocation</h2>
        <p className="text-xs text-gray-400 mb-4">
          Override via <code>page.context().setGeolocation()</code> in Playwright.
        </p>
        <button
          data-testid="get-location-button"
          onClick={handleGetLocation}
          disabled={geoLoading}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {geoLoading ? 'Requesting...' : 'Get My Location'}
        </button>

        <div
          data-testid="coordinates-display"
          className="mt-4 p-3 bg-gray-50 rounded-lg text-sm font-mono"
        >
          {coords
            ? `Your Coordinates: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
            : geoError
              ? <span className="text-red-600">Error: {geoError}</span>
              : <span className="text-gray-400">Coordinates will appear here...</span>
          }
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Network Status</h2>
        <p className="text-xs text-gray-400 mb-4">
          Emulate via <code>context.setOffline(true)</code> in Playwright.
        </p>
        <div className="flex items-center gap-3">
          <span
            data-testid="network-status"
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
              isOnline
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <span
              data-testid="network-status-dot"
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
            />
            {isOnline ? 'Online' : 'Offline'}
          </span>
          <span className="text-xs text-gray-400">Updates in real-time</span>
        </div>
      </div>

      {/* Console Audit */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Console Audit</h2>
        <p className="text-xs text-gray-400 mb-4">
          Intercept via <code>page.on('console', ...)</code> in Playwright.
        </p>
        <div className="flex items-center gap-4">
          <button
            data-testid="console-log-button"
            onClick={handleConsoleLog}
            className="bg-gray-800 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Emit console.log
          </button>
          {auditFired && (
            <p data-testid="console-log-confirmation" className="text-sm text-green-600 font-medium">
              ✓ Logged to console
            </p>
          )}
        </div>
        <pre className="mt-4 bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
{`console.log({
  event: "audit",
  timestamp: <Date.now()>,
  payload: "qa-sandbox-audit-v1",
  source: "CDPRoom"
})`}
        </pre>
      </div>

      {/* Large Asset */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Large Asset</h2>
        <p className="text-xs text-gray-400 mb-4">
          High-resolution image for network throttling and performance metric tests.
        </p>
        <img
          data-testid="large-asset"
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=4000&q=100"
          alt="High-resolution mountain landscape for performance testing"
          className="w-full rounded-lg object-cover max-h-72"
          loading="lazy"
        />
      </div>
    </div>
  )
}
