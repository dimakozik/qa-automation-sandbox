import { useState } from 'react'

// Self-contained HTML page embedded via srcdoc
const IFRAME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Embedded Frame</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f8fafc; padding: 24px; color: #1e293b; }
    h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 16px; }
    label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #374151; }
    input, select { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 13px; margin-bottom: 12px; outline: none; }
    input:focus, select:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.2); }
    button { width: 100%; padding: 9px; background: #6366f1; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 4px; }
    button:hover { background: #4f46e5; }
    .counter { display: flex; align-items: center; gap: 12px; margin-top: 20px; }
    .counter button { width: auto; padding: 6px 16px; }
    #counter-value { font-size: 24px; font-weight: 700; color: #6366f1; min-width: 40px; text-align: center; }
    #frame-result { margin-top: 14px; padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 13px; color: #166534; display: none; }
  </style>
</head>
<body>
  <h2>Login Form (inside iframe)</h2>

  <label for="frame-username">Username</label>
  <input id="frame-username" data-testid="frame-username" type="text" placeholder="Enter username" />

  <label for="frame-password">Password</label>
  <input id="frame-password" data-testid="frame-password" type="password" placeholder="Enter password" />

  <label for="frame-role">Role</label>
  <select id="frame-role" data-testid="frame-role">
    <option value="">-- Select role --</option>
    <option value="admin">Admin</option>
    <option value="editor">Editor</option>
    <option value="viewer">Viewer</option>
  </select>

  <button id="frame-submit" data-testid="frame-submit">Submit</button>
  <div id="frame-result" data-testid="frame-result"></div>

  <div class="counter">
    <button id="counter-dec" data-testid="counter-dec">−</button>
    <span id="counter-value" data-testid="counter-value">0</span>
    <button id="counter-inc" data-testid="counter-inc">+</button>
  </div>

  <script>
    let count = 0;
    document.getElementById('counter-inc').addEventListener('click', () => {
      count++;
      document.getElementById('counter-value').textContent = count;
    });
    document.getElementById('counter-dec').addEventListener('click', () => {
      count--;
      document.getElementById('counter-value').textContent = count;
    });
    document.getElementById('frame-submit').addEventListener('click', () => {
      const user = document.getElementById('frame-username').value;
      const role = document.getElementById('frame-role').value;
      const result = document.getElementById('frame-result');
      if (!user || !role) {
        result.style.display = 'block';
        result.style.background = '#fef2f2';
        result.style.borderColor = '#fecaca';
        result.style.color = '#991b1b';
        result.textContent = 'Please fill in all fields.';
      } else {
        result.style.display = 'block';
        result.style.background = '#f0fdf4';
        result.style.borderColor = '#bbf7d0';
        result.style.color = '#166534';
        result.textContent = 'Logged in as ' + user + ' (' + role + ')';
      }
    });
  </script>
</body>
</html>`

const PLAYWRIGHT_SNIPPET = `// Target elements inside the iframe
const frame = page.frameLocator('[data-testid="embedded-iframe"]')

// Fill the login form inside the frame
await frame.locator('[data-testid="frame-username"]').fill('testuser')
await frame.locator('[data-testid="frame-password"]').fill('secret')
await frame.locator('[data-testid="frame-role"]').selectOption('admin')
await frame.locator('[data-testid="frame-submit"]').click()

// Assert result inside the frame
await expect(frame.locator('[data-testid="frame-result"]'))
  .toContainText('Logged in as testuser')

// Counter inside the frame
await frame.locator('[data-testid="counter-inc"]').click()
await frame.locator('[data-testid="counter-inc"]').click()
await expect(frame.locator('[data-testid="counter-value"]')).toHaveText('2')`

export default function IframeRoom() {
  const [showSnippet, setShowSnippet] = useState(false)
  const [copied, setCopied] = useState(false)

  function copySnippet() {
    navigator.clipboard.writeText(PLAYWRIGHT_SNIPPET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div data-testid="iframe-room" className="p-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">iFrame</h1>
        <p className="text-sm text-gray-500">
          Elements inside an <code>&lt;iframe&gt;</code> require Playwright's{' '}
          <code>frameLocator()</code> — regular locators won't reach them.
        </p>
      </div>

      {/* The iframe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-gray-400 font-mono">embedded-frame</span>
        </div>
        <iframe
          data-testid="embedded-iframe"
          srcDoc={IFRAME_HTML}
          title="Embedded test frame"
          className="w-full border-0"
          style={{ height: 400 }}
          sandbox="allow-scripts"
        />
      </div>

      {/* Playwright snippet */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Playwright Snippet
          </h2>
          <div className="flex gap-2">
            <button
              data-testid="toggle-snippet-button"
              onClick={() => setShowSnippet((s) => !s)}
              className="text-xs px-3 py-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
            >
              {showSnippet ? 'Hide' : 'Show'} Code
            </button>
            {showSnippet && (
              <button
                data-testid="copy-snippet-button"
                onClick={copySnippet}
                className="text-xs px-3 py-1 border border-indigo-300 rounded-md text-indigo-600 hover:bg-indigo-50"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>
        {showSnippet && (
          <pre data-testid="playwright-snippet" className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto whitespace-pre">
            {PLAYWRIGHT_SNIPPET}
          </pre>
        )}
        {!showSnippet && (
          <p className="text-sm text-gray-400 italic">Click "Show Code" to see how to automate this iframe with Playwright.</p>
        )}
      </div>
    </div>
  )
}
