export interface PaginationRecord {
  id: number
  name: string
  email: string
  department: string
  score: number
}

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'Sales', 'QA', 'DevOps', 'Legal', 'Finance']
const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Eve', 'Frank', 'Grace', 'Henry', 'Iris', 'Jack',
  'Karen', 'Leo', 'Maya', 'Nate', 'Olivia', 'Peter', 'Quinn', 'Rosa', 'Sam', 'Tina',
]
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore']

function makeRecord(id: number): PaginationRecord {
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

export const ALL_RECORDS: PaginationRecord[] = Array.from({ length: 50 }, (_, i) => makeRecord(i + 1))
