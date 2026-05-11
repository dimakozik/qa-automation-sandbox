export interface TableRow {
  id: number
  name: string
  status: 'Active' | 'Inactive'
  role: string
}

const SEED: TableRow[] = [
  { id: 1,  name: 'Alice Johnson',  status: 'Active',   role: 'Engineer' },
  { id: 2,  name: 'Bob Smith',      status: 'Inactive', role: 'Designer' },
  { id: 3,  name: 'Carol Williams', status: 'Active',   role: 'Manager' },
  { id: 4,  name: 'David Brown',    status: 'Active',   role: 'Engineer' },
  { id: 5,  name: 'Eva Martinez',   status: 'Inactive', role: 'QA' },
  { id: 6,  name: 'Frank Garcia',   status: 'Active',   role: 'DevOps' },
  { id: 7,  name: 'Grace Lee',      status: 'Active',   role: 'Engineer' },
  { id: 8,  name: 'Henry Wilson',   status: 'Inactive', role: 'Designer' },
  { id: 9,  name: 'Iris Taylor',    status: 'Active',   role: 'QA' },
  { id: 10, name: 'Jack Anderson',  status: 'Active',   role: 'Manager' },
]

let rows: TableRow[] = SEED.map((r) => ({ ...r }))

export const rowsStore = {
  list: () => rows,
  find: (id: number) => rows.find((r) => r.id === id),
  remove: (id: number) => {
    const idx = rows.findIndex((r) => r.id === id)
    if (idx === -1) return false
    rows.splice(idx, 1)
    return true
  },
  update: (id: number, patch: Partial<Omit<TableRow, 'id'>>) => {
    const row = rows.find((r) => r.id === id)
    if (!row) return null
    Object.assign(row, patch)
    return row
  },
  reset: () => {
    rows = SEED.map((r) => ({ ...r }))
  },
}
