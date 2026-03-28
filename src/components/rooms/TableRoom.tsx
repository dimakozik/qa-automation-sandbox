import { useState } from 'react'
import type { TableRow } from '../../types'

const INITIAL_ROWS: TableRow[] = [
  { id: 1,  name: 'Alice Johnson',   status: 'Active',   role: 'Engineer' },
  { id: 2,  name: 'Bob Smith',       status: 'Inactive', role: 'Designer' },
  { id: 3,  name: 'Carol Williams',  status: 'Active',   role: 'Manager' },
  { id: 4,  name: 'David Brown',     status: 'Active',   role: 'Engineer' },
  { id: 5,  name: 'Eva Martinez',    status: 'Inactive', role: 'QA' },
  { id: 6,  name: 'Frank Garcia',    status: 'Active',   role: 'DevOps' },
  { id: 7,  name: 'Grace Lee',       status: 'Active',   role: 'Engineer' },
  { id: 8,  name: 'Henry Wilson',    status: 'Inactive', role: 'Designer' },
  { id: 9,  name: 'Iris Taylor',     status: 'Active',   role: 'QA' },
  { id: 10, name: 'Jack Anderson',   status: 'Active',   role: 'Manager' },
]

export default function TableRoom() {
  const [rows, setRows] = useState<TableRow[]>(INITIAL_ROWS)

  function deleteRow(id: number) {
    setRows((r) => r.filter((row) => row.id !== id))
  }

  function toggleStatus(id: number) {
    setRows((r) =>
      r.map((row) =>
        row.id === id
          ? { ...row, status: row.status === 'Active' ? 'Inactive' : 'Active' }
          : row,
      ),
    )
  }

  return (
    <div data-testid="table-room" className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Table &amp; Data</h1>
      <p className="text-sm text-gray-500 mb-8">
        Delete rows and toggle status. Each row and action has a unique <code>data-testid</code>.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table data-testid="data-table" className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">ID</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400" data-testid="table-empty">
                    No rows remaining.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    data-testid={`row-${row.id}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{row.id}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{row.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{row.role}</td>
                    <td className="px-5 py-3.5">
                      <span
                        data-testid={`status-${row.id}`}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          data-testid={`toggle-btn-${row.id}`}
                          onClick={() => toggleStatus(row.id)}
                          className="text-xs px-2.5 py-1 rounded-md border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium"
                        >
                          Toggle Status
                        </button>
                        <button
                          data-testid={`delete-btn-${row.id}`}
                          onClick={() => deleteRow(row.id)}
                          className="text-xs px-2.5 py-1 rounded-md border border-red-300 text-red-600 hover:bg-red-50 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500" data-testid="table-row-count">
          {rows.length} row{rows.length !== 1 ? 's' : ''} displayed
        </div>
      </div>
    </div>
  )
}
