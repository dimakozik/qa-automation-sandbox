export type Room =
  | 'auth'
  | 'form'
  | 'dynamic'
  | 'table'
  | 'interactions'
  | 'cdp'
  | 'mock-api'
  | 'iframe'
  | 'shadow-dom'
  | 'toast'
  | 'retry'
  | 'pagination'
  | 'upload'
  | 'a11y'

export interface NavItem {
  id: Room
  label: string
  icon: string
  section?: string
}

export interface TableRow {
  id: number
  name: string
  status: 'Active' | 'Inactive'
  role: string
}

export interface DragTask {
  id: string
  label: string
  column: 'todo' | 'done'
}

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  endpoint: string
  statusCode: number
  delay: number
  body: string
}

export interface ApiResponse {
  status: number
  ok: boolean
  headers: Record<string, string>
  body: unknown
  duration: number
  timestamp: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}
