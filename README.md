# QA Automation Sandbox

A single-page React application built as a **"testable universe"** for Playwright automation. Every room isolates a distinct browser API, UI pattern, or timing challenge. Use it to practice, demonstrate, and benchmark QA automation skills.

**Stack:** Vite · React 19 · TypeScript · Tailwind CSS · @dnd-kit · Express (in-process backend)

```bash
npm install
npm run dev       # boots Vite (5173) + API (5174) together
npm run build     # production build (frontend only)
npm run dev:web   # frontend only
npm run dev:api   # backend only
```

---

## Backend

A small Express + TypeScript server lives in [`/server`](server/) and powers the 6 rooms that need real HTTP. In dev, `npm run dev` boots it via `concurrently` alongside Vite, and Vite proxies `/api/*` to it (configured in [vite.config.ts](vite.config.ts)), so the frontend uses same-origin URLs and there's no CORS to deal with.

- **Port:** `5174` (override with `API_PORT`)
- **Storage:** in-memory — every restart re-seeds. No DB.
- **Auth:** HS256 JWT signed with `process.env.JWT_SECRET` (defaults to a sandbox secret).

### Endpoint reference

| Endpoint | Used by | Notes |
|---|---|---|
| `GET /api/health` | smoke checks | `{ok: true}` |
| `POST /api/login` | AuthRoom | Body `{username, password}`. Returns `{token, username}` and sets `auth-session` cookie. Password literal `"wrong"` → 401. Empty fields → 400. |
| `GET /api/me` | AuthRoom (optional) | Verifies `Authorization: Bearer <token>`. |
| `POST /api/logout` | AuthRoom | Clears the cookie. 204. |
| `GET /api/rows` | TableRoom | Returns the 10 seed rows. |
| `DELETE /api/rows/:id` | TableRoom | 204 on success, 404 if missing. |
| `PATCH /api/rows/:id` | TableRoom | Body `{status: 'Active' \| 'Inactive'}`. Returns the updated row. |
| `POST /api/_reset/rows` | tests | Re-seeds the table store. 204. |
| `POST /api/upload` | UploadRoom | `multipart/form-data` with field name `files`. 10 MB cap per file (413 on overflow). Returns `{files: [{id, name, size, type}]}`. |
| `GET /api/records?page=N&limit=8` | PaginationRoom (paged tab) | Returns `{items, page, totalPages, total}`. |
| `GET /api/records?offset=N&limit=10` | PaginationRoom (infinite tab) | Returns `{items, offset, limit, total}`. |
| `POST /api/flaky/deterministic` | RetryRoom | Per-session counter keyed by `x-session-id` header. 500 first 2 calls, 200 on 3rd. |
| `POST /api/flaky/deterministic/reset` | RetryRoom | Resets the counter for the calling session. 204. |
| `POST /api/flaky/probabilistic` | RetryRoom | 40% chance of 500, else 200. 400–800 ms latency. |
| `* /api/mock/*` | MockApiRoom | Any method/path under `/api/mock`. Query params `mockStatus=<code>` and `mockDelay=<ms>` shape the response. Body matches the canonical mock body for the requested status. |

### Server layout

```
server/
  index.ts                 # Express bootstrap, mounts routers, listens on 5174
  routes/
    auth.ts                # /api/login, /api/me, /api/logout
    table.ts               # /api/rows CRUD
    upload.ts              # /api/upload (multer, memory storage, 10MB limit)
    pagination.ts          # /api/records (page+limit or offset+limit)
    retry.ts               # /api/flaky/{deterministic,probabilistic}
    mockApi.ts             # /api/mock/* — honors ?mockStatus= & ?mockDelay=
  data/
    rows.ts                # TableRow seed + in-memory store
    records.ts             # 50 paginated records, same generator the room used to use
  middleware/
    delay.ts               # parses ?mockDelay= and sleeps before next()
```

---

## Rooms

### Core

- [Auth & Session](#1-auth--session)
- [Form & Elements](#2-form--elements)
- [Dynamic & Async](#3-dynamic--async)
- [Table & Data](#4-table--data)
- [Interactions & Shadow](#5-interactions--shadow)
- [CDP (System)](#6-cdp-system)

### Advanced

- [Mock API](#7-mock-api)
- [iFrame](#8-iframe)
- [Shadow DOM](#9-shadow-dom)
- [Toast & Alerts](#10-toast--alerts)
- [Retry & Flaky](#11-retry--flaky)
- [Pagination & Infinite Scroll](#12-pagination--infinite-scroll)
- [File Upload](#13-file-upload)
- [Keyboard & a11y](#14-keyboard--a11y)

---

## 1. Auth & Session

**Route:** `nav-auth` sidebar button

Real login flow. The form `POST`s to `/api/login` (Express). The server validates credentials, signs an HS256 JWT, returns it in the body, and sets an `auth-session` cookie. The room writes the token to `localStorage`, giving Playwright's `storageState` something authentic to capture and restore. Password literal `"wrong"` returns a 401 for deterministic failure tests.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `username-input` | Username text field |
| `password-input` | Password field |
| `login-button` | Submits the form |
| `login-error` | Shown when fields are empty |
| `login-success-message` | Container revealed after login |
| `auth-token-display` | Shows the token value |
| `auth-cookie-display` | Shows the cookie string |
| `logout-button` | Clears token + cookie, resets state |

**Test cases**

```
✓ Login with empty fields shows error message ("Both fields are required")
✓ Login with password "wrong" surfaces "Invalid credentials" from a real 401
✓ Login with valid credentials hides the form and shows success panel
✓ localStorage["auth-token"] contains a real JWT (3 dot-separated segments) after login
✓ The auth-session cookie is set by the server (visible in document.cookie)
✓ Logout button POSTs /api/logout and clears localStorage
✓ Page reloaded after storageState saved — token still present, login form not shown
✓ Intercept POST /api/login with page.route() to return a custom token
```

---

## 2. Form & Elements

**Route:** `nav-form` sidebar button

Covers every standard HTML input type in a single form. Submit is blocked unless all fields are filled, making it ideal for testing validation flows.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `text-input` | Full name text field |
| `textarea-input` | Multi-line comments field |
| `checkbox-a/b/c` | Three independent checkboxes |
| `radio-alpha/beta/gamma` | Radio button group |
| `select-input` | Country `<select>` dropdown |
| `date-input` | `<input type="date">` |
| `range-input` | 0–100 range slider |
| `range-value` | Live display of slider value |
| `submit-button` | Validates and submits |
| `success-message` | Shown when all fields are filled |
| `error-message` | Shown when any field is missing |

**Test cases**

```
✓ Submit with all fields empty shows error message
✓ Submit with all fields filled shows success message
✓ Filling text input updates its value
✓ Checking checkbox-a reflects checked state
✓ Selecting radio-beta deselects radio-alpha
✓ Selecting a country from the dropdown updates select value
✓ Setting date input to a specific date persists the value
✓ Dragging the range slider to max updates range-value to "100"
✓ Success message disappears after clearing a field and resubmitting
```

---

## 3. Dynamic & Async

**Route:** `nav-dynamic` sidebar button

Three independent async patterns that require Playwright's waiting strategies rather than fixed sleeps.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `search-input` | Debounced search (500ms delay) |
| `search-results` | Filtered list container |
| `search-result-{name}` | Individual result items |
| `search-no-results` | Shown when filter matches nothing |
| `slow-load-button` | Triggers a 3-second loading state |
| `loading-spinner` | Visible during the 3s wait |
| `slow-load-data` | Appears after spinner disappears |
| `hidden-trigger-button` | Starts a random 1–4s countdown |
| `hidden-element` | Appears after the random delay |

**Test cases**

```
✓ Typing "play" in search-input shows only "Playwright" after 500ms debounce
✓ Typing "zzz" shows search-no-results
✓ Clearing search restores full list
✓ Clicking slow-load-button makes loading-spinner visible
✓ loading-spinner disappears and slow-load-data appears within 4s
✓ slow-load-data contains expected JSON keys
✓ Clicking hidden-trigger-button eventually reveals hidden-element
✓ hidden-element appears without using a fixed sleep (use waitForSelector)
```

---

## 4. Table & Data

**Route:** `nav-table` sidebar button

A 10-row data table backed by `/api/rows`. Mutations (delete, status toggle) are real HTTP calls with optimistic UI updates and rollback on failure. State persists across reloads within a server run — use `POST /api/_reset/rows` to restore the seed.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `data-table` | The `<table>` element |
| `row-{id}` | Each `<tr>` (e.g. `row-1`) |
| `status-{id}` | Status badge per row |
| `toggle-btn-{id}` | Flips Active ↔ Inactive |
| `delete-btn-{id}` | Removes the row from the DOM |
| `table-row-count` | Footer showing current row count |
| `table-empty` | Shown when all rows are deleted |
| `table-loading` | Shown while the initial `GET /api/rows` is in flight |

**Test cases**

```
✓ Table renders 10 rows on load
✓ Clicking delete-btn-3 removes row-3 from the DOM
✓ table-row-count decrements after deletion
✓ Clicking toggle-btn-1 changes status-1 from "Active" to "Inactive"
✓ Clicking toggle-btn-1 again restores status-1 to "Active"
✓ Deleting all rows shows table-empty
✓ Status badge colour matches the status text
✓ Deleting row-3 then reloading the page — row-3 is still missing (server persisted)
✓ POST /api/_reset/rows restores all 10 rows
✓ page.route('**/api/rows/3', r => r.fulfill({status: 500})) — UI rolls back the optimistic delete
```

---

## 5. Interactions & Shadow

**Route:** `nav-interactions` sidebar button

Covers browser interactions that go beyond simple clicks: drag-and-drop, native browser dialogs, multi-context links, and CSS hover states.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `column-todo` | "Todo" DnD column |
| `column-done` | "Done" DnD column |
| `task-{task-id}` | Draggable task cards |
| `confirm-dialog-button` | Triggers `window.confirm` |
| `confirm-result` | Shows "confirmed" or "cancelled" |
| `new-tab-link` | `target="_blank"` anchor |
| `hover-secret` | Hover target |
| `secret-code` | Revealed on hover ("CODE-7749") |

**Test cases**

```
✓ Drag task-task-1 from column-todo to column-done — card appears in done column
✓ Dismiss window.confirm → confirm-result shows "cancelled"
✓ Accept window.confirm → confirm-result shows "confirmed"
✓ new-tab-link has attribute target="_blank"
✓ Clicking new-tab-link opens a new browser tab
✓ secret-code is not present in DOM before hover
✓ Hovering hover-secret reveals secret-code with text "CODE-7749"
✓ Moving mouse away hides secret-code again
```

---

## 6. CDP (System)

**Route:** `nav-cdp` sidebar button

Exercises browser APIs accessible via Chrome DevTools Protocol — geolocation override, network emulation, console interception, and performance/asset loading.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `get-location-button` | Calls `navigator.geolocation.getCurrentPosition` |
| `coordinates-display` | Shows "Your Coordinates: lat, lng" |
| `network-status` | "Online" or "Offline" badge |
| `network-status-dot` | Coloured indicator dot |
| `console-log-button` | Emits a structured JSON to `console.log` |
| `console-log-confirmation` | Briefly confirms the emit |
| `large-asset` | High-res image for performance metrics |

**Test cases**

```
✓ Mock geolocation to {lat: 51.5, lng: -0.1} — coordinates-display shows those values
✓ Set context offline → network-status shows "Offline"
✓ Set context back online → network-status shows "Online"
✓ Intercept console events: clicking console-log-button emits JSON with key "payload: qa-sandbox-audit-v1"
✓ large-asset loads with a measurable network timing entry
✓ Page performance metrics captured with page.evaluate(() => performance.getEntriesByType('navigation'))
```

---

## 7. Mock API

**Route:** `nav-mock-api` sidebar button

A visual HTTP request builder. Every "Send" fires a **real** `fetch()` to `/api/mock/*` with `?mockStatus=<code>&mockDelay=<ms>` query params, and the Express handler echoes the requested status, delay, and the canonical mock body. Because the request is real, Playwright's `page.route()` can intercept it for free.

The endpoint dropdown now offers `/api/mock/users`, `/api/mock/users/42`, `/api/mock/products`, `/api/mock/orders/7`, and `/api/mock/auth/token`.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `api-method-select` | HTTP method selector |
| `api-endpoint-select` | Endpoint path selector |
| `api-status-select` | Mock status code selector |
| `api-delay-slider` | Response delay (0–3000ms) |
| `api-delay-value` | Live delay display |
| `api-body-input` | Request body textarea (POST/PUT) |
| `api-send-button` | Fires the simulated request |
| `api-response-panel` | Response container |
| `api-response-status` | Status code in response |
| `api-response-duration` | Measured duration |
| `api-response-headers` | Response header list |
| `api-response-body` | JSON response body |
| `api-history` | Last 5 request results |
| `api-history-item-{n}` | Individual history entries |

**Test cases**

```
✓ Select GET + 200 → api-response-status shows "200", body contains "success: true"
✓ Select POST + 401 → response body contains "Unauthorized"
✓ Select DELETE + 404 → response body contains "Not Found"
✓ Set delay to 2000ms → api-response-duration shows ~2000ms
✓ Send 3 requests → api-history contains 3 items
✓ Intercept via page.route('**/api/mock/users**') and fulfill a custom body — api-response-body shows the mocked payload
✓ Set delay to 2000ms → DevTools network shows ~2000ms latency, api-response-duration matches
✓ api-response-headers contains x-mock-endpoint matching the requested path
✓ api-send-button is disabled while request is in-flight
```

---

## 8. iFrame

**Route:** `nav-iframe` sidebar button

A fully self-contained page embedded via `<iframe srcdoc>`. Standard Playwright locators cannot reach inside it — `frameLocator()` is required.

**Key `data-testid` attributes (inside the frame)**

| Selector | Description |
|---|---|
| `frame-username` | Username input inside the iframe |
| `frame-password` | Password input inside the iframe |
| `frame-role` | Role select dropdown inside the iframe |
| `frame-submit` | Submit button inside the iframe |
| `frame-result` | Success/error message inside the iframe |
| `counter-inc` | Increment button inside the iframe |
| `counter-dec` | Decrement button inside the iframe |
| `counter-value` | Counter display inside the iframe |

**Key `data-testid` attributes (outside the frame)**

| Selector | Description |
|---|---|
| `embedded-iframe` | The `<iframe>` element itself |
| `toggle-snippet-button` | Shows/hides the Playwright code snippet |
| `copy-snippet-button` | Copies snippet to clipboard |

**Test cases**

```
✓ page.locator('[data-testid="embedded-iframe"]') is visible
✓ frameLocator can reach frame-username and fill it
✓ Submitting with empty fields shows error in frame-result
✓ Submitting with username="admin" and role="admin" shows "Logged in as admin"
✓ Clicking counter-inc twice sets counter-value to "2"
✓ Clicking counter-dec once sets counter-value to "1"
✓ Regular locators cannot find frame-username (confirms iframe boundary)
```

---

## 9. Shadow DOM

**Route:** `nav-shadow-dom` sidebar button

A real Web Component with `attachShadow({ mode: 'open' })`. The shadow root contains an input, submit, reset, and a counter. Playwright pierces open shadow roots via locator chaining — no special API needed.

**Key `data-testid` attributes (inside shadow root)**

| Selector | Description |
|---|---|
| `shadow-input` | Text input inside shadow DOM |
| `shadow-submit` | Submit button inside shadow DOM |
| `shadow-reset` | Reset button inside shadow DOM |
| `shadow-output` | Output display inside shadow DOM |
| `shadow-counter` | Counter display inside shadow DOM |
| `shadow-counter-inc` | Increment inside shadow DOM |
| `shadow-counter-dec` | Decrement inside shadow DOM |

**Key `data-testid` attributes (outside shadow root)**

| Selector | Description |
|---|---|
| `shadow-host-wrapper` | Wrapper div containing the shadow host |
| `shadow-external-value` | React observer showing last submitted value |

**Test cases**

```
✓ shadow-input is reachable via locator chaining (no error thrown)
✓ Fill shadow-input with "hello" and click shadow-submit → shadow-output shows "hello"
✓ shadow-external-value (outside shadow root) updates after shadow-submit is clicked
✓ Click shadow-reset → shadow-output reverts to placeholder text
✓ Click shadow-counter-inc 3 times → shadow-counter shows "3"
✓ Click shadow-counter-dec once → shadow-counter shows "2"
✓ CSS selector approach: page.locator('div >> [data-testid="shadow-input"]') resolves correctly
```

---

## 10. Toast & Alerts

**Route:** `nav-toast` sidebar button

Transient notifications that auto-dismiss after 3 seconds. Tests timing-sensitive assertions, element appearance/disappearance, and stacking behaviour.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `toast-trigger-success/error/warning/info` | Quick-fire buttons |
| `custom-toast-type` | Type selector for custom toast |
| `custom-toast-message` | Message input for custom toast |
| `custom-toast-trigger` | Fires custom toast |
| `toast-container` | Fixed overlay holding active toasts |
| `toast-{id}` | Individual toast element |
| `toast-message-{id}` | Message text inside toast |
| `toast-dismiss-{id}` | Manual dismiss button |
| `toast-counter` | Total toasts fired |
| `toast-active-count` | Currently visible toasts |
| `dismiss-all-button` | Clears all active toasts |

**Test cases**

```
✓ Clicking toast-trigger-success adds a toast to toast-container
✓ Success toast contains the expected success message text
✓ Toast disappears from DOM within 4 seconds (auto-dismiss)
✓ Clicking toast-dismiss-{id} removes that toast immediately
✓ Firing 3 toasts in a row → toast-active-count shows "3"
✓ dismiss-all-button clears all toasts at once
✓ toast-counter increments with each toast triggered
✓ Custom toast with message "hello" and type "warning" renders with correct text and styling
```

---

## 11. Retry & Flaky

**Route:** `nav-retry` sidebar button

Three independent patterns for practicing retry logic, flakiness tolerance, and race condition handling.

The deterministic and probabilistic patterns are now driven by `/api/flaky/*` — real HTTP failures, not client-side simulations. Double-Submit Guard remains client-side (it's a UI guard, not a network test).

### Deterministic Failure

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `retry-button` | Action that fails first 2 times |
| `retry-reset` | Resets attempt count |
| `retry-attempt-count` | Total attempts made |
| `retry-failures-left` | Remaining forced failures |
| `retry-status` | Current state: IDLE / ERROR / SUCCESS |
| `retry-error-message` | Shown on failed attempts |
| `retry-success-message` | Shown on successful attempt |

### Probabilistic Failure

| Selector | Description |
|---|---|
| `flaky-button` | Fails randomly ~40% of the time |
| `flaky-clear` | Clears history |
| `flaky-success-count` | Running success count |
| `flaky-error-count` | Running error count |
| `flaky-success-rate` | Success percentage |
| `flaky-history` | Visual grid of pass/fail results |

### Double-Submit Guard

| Selector | Description |
|---|---|
| `double-submit-button` | Disabled while in-flight (2s) |
| `double-submit-count` | How many times the action fired |
| `double-submit-reset` | Resets state |

**Test cases**

```
✓ retry-button: first click → retry-status is "ERROR"
✓ retry-button: second click → retry-failures-left shows "0"
✓ retry-button: third click → retry-status is "SUCCESS" and retry-success-message is visible
✓ retry-reset restores attempt count to 0
✓ flaky-button: clicking 10 times produces some failures and some successes
✓ Using expect.poll(() => ...) eventually observes a success from flaky-button
✓ Clicking double-submit-button twice rapidly → double-submit-count remains "1"
✓ double-submit-button is disabled (aria-disabled) immediately after first click
✓ retry-button: three POSTs to /api/flaky/deterministic — server returns 500, 500, 200
✓ retry-reset POSTs /api/flaky/deterministic/reset so the next click is attempt #1 again
✓ flaky-button: page.route('**/api/flaky/probabilistic', r => r.fulfill({status: 200})) — every click succeeds
```

---

## 12. Pagination & Infinite Scroll

**Route:** `nav-pagination` sidebar button

50 records served by `/api/records`. The paginated tab fetches with `?page=N&limit=8`; the infinite tab uses `?offset=N&limit=10` and an IntersectionObserver sentinel. Each tab interaction is a real network call.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `pagination-tabs` | Tab bar container |
| `tab-paginated` / `tab-infinite` | Tab buttons |
| `paginated-table` | The paginated `<table>` |
| `paginated-row-{id}` | Individual table rows |
| `score-{id}` | Score badge per row |
| `pagination-info` | "Page X of Y" text |
| `current-page` | Current page number |
| `total-pages` | Total page count |
| `prev-page-button` | Go to previous page |
| `next-page-button` | Go to next page |
| `page-button-{n}` | Jump to page N |
| `infinite-list` | Scrollable container |
| `infinite-row-{id}` | Individual infinite scroll rows |
| `infinite-sentinel` | IntersectionObserver trigger element |
| `infinite-loading` | Spinner shown while loading more |
| `load-more-button` | Manual load-more trigger |
| `infinite-end` | "All records loaded" message |
| `infinite-visible-count` | How many records are shown |
| `paginated-loading` | Shown while the page fetch is in flight (initial load only) |

**Test cases**

```
✓ paginated-table shows 8 rows on initial load
✓ Clicking next-page-button shows the next 8 rows
✓ current-page updates to "2" after clicking next
✓ prev-page-button is disabled on page 1
✓ next-page-button is disabled on the last page
✓ Clicking page-button-3 jumps directly to page 3
✓ Switch to infinite tab → 10 rows visible initially
✓ Clicking load-more-button loads 10 more rows
✓ Scrolling to infinite-sentinel triggers automatic load
✓ After all 50 records load, infinite-end is visible
✓ Each page-button-* click fires a single GET /api/records?page=N&limit=8
✓ Infinite scroll: sentinel intersection triggers GET /api/records?offset=N&limit=10
✓ page.route('**/api/records*', r => r.fulfill({status: 500})) — UI handles the failure gracefully (last good state kept)
```

---

## 13. File Upload

**Route:** `nav-upload` sidebar button

A file upload interface with both a traditional `<input type="file">` (target for Playwright's `setInputFiles()`) and a drag-and-drop zone. Selected files are POSTed as real `multipart/form-data` to `/api/upload`. The server caps each file at 10 MB (413 on overflow). Image previews are still generated client-side via `URL.createObjectURL`.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `file-input` | Hidden `<input type="file" multiple>` |
| `drop-zone` | Click or drag-drop target |
| `drop-zone-active` | Overlay shown during drag |
| `file-list` | `<ul>` of selected files |
| `file-count` | Number of files selected |
| `file-item-{n}` | Individual file list entry |
| `file-name-{n}` | File name display |
| `file-size-{n}` | Formatted size (e.g. "1.2 MB") |
| `file-type-{n}` | MIME type display |
| `file-preview-{n}` | Image preview (images only) |
| `file-remove-{n}` | Remove button per file |
| `total-size` | Sum of all file sizes |
| `clear-all-button` | Removes all files |
| `no-files-message` | Shown when list is empty |
| `upload-status` | Shows `Idle` / `Uploading…` / `Upload complete` / `✗ <error>` |
| `upload-error` | The inline error message (when upload-status is in error state) |

**Test cases**

```
✓ no-files-message is visible before any file is selected
✓ setInputFiles on file-input with a text file → file-list shows 1 item
✓ file-name-0 shows the correct filename
✓ file-size-0 shows a human-readable size
✓ setInputFiles with 3 files → file-count shows "3"
✓ Clicking file-remove-0 removes the first file, count drops to 2
✓ clear-all-button removes all files, no-files-message reappears
✓ setInputFiles with an image file → file-preview-0 is an <img> element
✓ total-size reflects the sum of all selected file sizes
✓ setInputFiles fires a real POST /api/upload visible in DevTools Network
✓ Uploading a single file → upload-status shows "Upload complete"
✓ Uploading a 15 MB file → upload-status surfaces the 413 (File too large)
✓ Network offline → upload-status shows "Network error" and file-list stays empty
```

---

## 14. Keyboard & a11y

**Route:** `nav-a11y` sidebar button

Four accessibility patterns: focus trap modal, arrow-key navigable list, ARIA live region, and tab-order visualizer.

**Key `data-testid` attributes**

| Selector | Description |
|---|---|
| `open-modal-button` | Opens the focus trap modal |
| `modal-overlay` | Modal backdrop (`role="dialog"`) |
| `modal` | Modal content container |
| `modal-title` | Modal heading |
| `modal-input` | First focusable element in modal |
| `modal-select` | Second focusable element in modal |
| `modal-confirm` | Confirm button (closes modal) |
| `modal-cancel` | Cancel button (closes modal) |
| `arrow-key-list` | `role="listbox"` list (`tabIndex=0`) |
| `list-item-{n}` | Each list item |
| `arrow-key-selected` | Currently selected item label |
| `aria-live-region` | Hidden `aria-live="polite"` region |
| `announce-{label}` | Buttons that post to live region |
| `announcement-log` | Visual log of announcements |
| `tab-order-form` | Container with 5 tab-ordered fields |
| `tab-input-{id}` | Individual tab-order inputs |
| `tab-focused-field` | Shows currently focused field id |

**Test cases**

```
✓ Clicking open-modal-button makes modal-overlay visible
✓ After modal opens, focus is on modal-input (toBeFocused)
✓ Pressing Tab from modal-input moves focus to modal-select
✓ Pressing Tab from modal-cancel cycles focus back to modal-input (focus trap)
✓ Pressing Escape closes the modal
✓ After modal closes, focus returns to open-modal-button

✓ Click arrow-key-list, press ArrowDown → list-item-1 is selected
✓ Press ArrowDown 6 more times → list-item-6 is selected (boundary)
✓ Press End → last item is selected; press Home → first item selected

✓ Clicking announce-saved → aria-live-region contains "Changes saved"
✓ aria-live-region content updates on each announce button click

✓ Press Tab 5 times through tab-order-form → tab-focused-field shows "tab-address"
✓ tab-input-tab-email has correct tabindex order (comes before tab-phone)
```

---

## data-testid Convention

All selectors follow the pattern `{noun}-{descriptor}` in kebab-case:

- Room wrappers: `{room-id}-room` (e.g. `auth-room`, `mock-api-room`)
- Per-row elements: `{noun}-{rowId}` (e.g. `delete-btn-3`, `status-3`)
- Dynamic elements: `{noun}-{generated-id}` (e.g. `toast-abc123`)
- Indexed elements: `{noun}-{index}` (e.g. `file-item-0`, `list-item-2`)
