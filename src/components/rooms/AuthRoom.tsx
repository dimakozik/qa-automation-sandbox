import { useState } from 'react'

interface AuthState {
  loggedIn: boolean
  token: string | null
  username: string
  password: string
  error: string
}

export default function AuthRoom() {
  const [state, setState] = useState<AuthState>({
    loggedIn: false,
    token: null,
    username: '',
    password: '',
    error: '',
  })

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!state.username || !state.password) {
      setState((s) => ({ ...s, error: 'Both fields are required.' }))
      return
    }
    const token = 'dummy-token-xyz-' + Date.now()
    localStorage.setItem('auth-token', token)
    document.cookie = 'auth-session=active; path=/'
    setState((s) => ({ ...s, loggedIn: true, token, error: '' }))
  }

  function handleLogout() {
    localStorage.removeItem('auth-token')
    document.cookie = 'auth-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setState({ loggedIn: false, token: null, username: '', password: '', error: '' })
  }

  return (
    <div data-testid="auth-room" className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Auth &amp; Session</h1>
      <p className="text-sm text-gray-500 mb-8">
        Tests localStorage token storage and cookie-based session via Playwright <code>storageState</code>.
      </p>

      {!state.loggedIn ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Sign In</h2>
          <form data-testid="login-form" onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                data-testid="username-input"
                type="text"
                value={state.username}
                onChange={(e) => setState((s) => ({ ...s, username: e.target.value }))}
                placeholder="testuser"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                data-testid="password-input"
                type="password"
                value={state.password}
                onChange={(e) => setState((s) => ({ ...s, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {state.error && (
              <p data-testid="login-error" className="text-sm text-red-600">
                {state.error}
              </p>
            )}
            <button
              data-testid="login-button"
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      ) : (
        <div data-testid="login-success-message" className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-500 text-xl">✓</span>
            <h2 className="text-base font-semibold text-gray-800">Logged In Successfully</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">localStorage key: <code>auth-token</code></p>
              <p data-testid="auth-token-display" className="font-mono text-gray-800 break-all">
                {state.token}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Cookie</p>
              <p data-testid="auth-cookie-display" className="font-mono text-gray-800">
                auth-session=active
              </p>
            </div>
          </div>
          <button
            data-testid="logout-button"
            onClick={handleLogout}
            className="mt-5 w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
