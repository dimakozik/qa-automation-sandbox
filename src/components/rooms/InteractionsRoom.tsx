import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DragTask } from '../../types'

const INITIAL_TASKS: DragTask[] = [
  { id: 'task-1', label: 'Write test spec',    column: 'todo' },
  { id: 'task-2', label: 'Set up fixtures',    column: 'todo' },
  { id: 'task-3', label: 'Configure CI',       column: 'todo' },
  { id: 'task-4', label: 'Install Playwright', column: 'done' },
  { id: 'task-5', label: 'Read the docs',      column: 'done' },
]

function SortableCard({ task }: { task: DragTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid={`task-${task.id}`}
      className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-800 shadow-sm cursor-grab active:cursor-grabbing select-none hover:border-indigo-300 transition-colors"
    >
      ⠿ {task.label}
    </div>
  )
}

export default function InteractionsRoom() {
  const [tasks, setTasks] = useState<DragTask[]>(INITIAL_TASKS)
  const [confirmResult, setConfirmResult] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Determine which column the dragged item is being dropped into
    // by checking if `over.id` is a column sentinel or another task
    const overTask = tasks.find((t) => t.id === over.id)
    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    const targetColumn = (over.id === 'col-todo' || over.id === 'col-done')
      ? (over.id === 'col-todo' ? 'todo' : 'done')
      : (overTask?.column ?? activeTask.column)

    setTasks((ts) =>
      ts.map((t) => (t.id === active.id ? { ...t, column: targetColumn } : t)),
    )
  }

  function handleConfirm() {
    const result = window.confirm('Are you sure you want to proceed?')
    setConfirmResult(result ? 'confirmed' : 'cancelled')
  }

  const todoTasks = tasks.filter((t) => t.column === 'todo')
  const doneTasks = tasks.filter((t) => t.column === 'done')

  return (
    <div data-testid="interactions-room" className="p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Interactions &amp; Shadow</h1>
        <p className="text-sm text-gray-500">
          Drag-and-drop, dialogs, new tabs, and hover effects.
        </p>
      </div>

      {/* Drag and Drop */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Drag &amp; Drop
        </h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-4">
            {/* Todo Column */}
            <div
              data-testid="column-todo"
              id="col-todo"
              className="bg-gray-50 rounded-lg p-4 min-h-32"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Todo ({todoTasks.length})
              </p>
              <SortableContext
                items={todoTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {todoTasks.map((task) => (
                    <SortableCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>

            {/* Done Column */}
            <div
              data-testid="column-done"
              id="col-done"
              className="bg-green-50 rounded-lg p-4 min-h-32"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Done ({doneTasks.length})
              </p>
              <SortableContext
                items={doneTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {doneTasks.map((task) => (
                    <SortableCard key={task.id} task={task} />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
        </DndContext>
      </div>

      {/* Browser Dialog */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Browser Dialog
        </h2>
        <div className="flex items-center gap-4">
          <button
            data-testid="confirm-dialog-button"
            onClick={handleConfirm}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Trigger window.confirm
          </button>
          {confirmResult && (
            <p
              data-testid="confirm-result"
              className={`text-sm font-medium ${
                confirmResult === 'confirmed' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              Dialog {confirmResult}
            </p>
          )}
        </div>
      </div>

      {/* New Tab Link */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          New Tab Link
        </h2>
        <a
          data-testid="new-tab-link"
          href="https://playwright.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
        >
          Open Playwright Docs in New Tab ↗
        </a>
      </div>

      {/* Hover Secret */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Hover to Reveal
        </h2>
        <div
          data-testid="hover-secret"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="inline-flex items-center gap-3 px-5 py-3 bg-gray-800 rounded-lg cursor-default"
        >
          <span className="text-sm text-gray-400 select-none">Hover over this element</span>
          {hovered && (
            <span
              data-testid="secret-code"
              className="text-sm font-mono font-bold text-yellow-400 tracking-widest"
            >
              CODE-7749
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
