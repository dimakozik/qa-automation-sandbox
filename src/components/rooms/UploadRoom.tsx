import { useState, useRef, useCallback } from 'react'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  preview: string | null
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function fileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️'
  if (type.startsWith('video/')) return '🎬'
  if (type.startsWith('audio/')) return '🎵'
  if (type.includes('pdf'))      return '📕'
  if (type.includes('zip') || type.includes('gzip')) return '📦'
  if (type.includes('json'))     return '📋'
  return '📄'
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function UploadRoom() {
  const [files, setFiles]       = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const [status, setStatus]     = useState<UploadStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const local = Array.from(fileList).map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))

    setStatus('uploading')
    setErrorMsg('')

    const fd = new FormData()
    local.forEach(({ file }) => fd.append('files', file))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        local.forEach(({ preview }) => { if (preview) URL.revokeObjectURL(preview) })
        setStatus('error')
        setErrorMsg(data.error ?? `Upload failed (${res.status})`)
        return
      }
      const serverFiles: Array<{ id: string; name: string; size: number; type: string }> = data.files ?? []
      const merged: UploadedFile[] = serverFiles.map((sf, i) => ({
        id: sf.id,
        name: sf.name,
        size: sf.size,
        type: sf.type,
        preview: local[i]?.preview ?? null,
      }))
      setFiles((f) => [...f, ...merged])
      setStatus('success')
    } catch (e) {
      local.forEach(({ preview }) => { if (preview) URL.revokeObjectURL(preview) })
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Network error')
    }
  }

  function removeFile(id: string) {
    setFiles((f) => {
      const target = f.find((x) => x.id === id)
      if (target?.preview) URL.revokeObjectURL(target.preview)
      return f.filter((x) => x.id !== id)
    })
  }

  function clearAll() {
    files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview) })
    setFiles([])
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])
  const onDragLeave = useCallback(() => setDragging(false), [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div data-testid="upload-room" className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">File Upload</h1>
        <p className="text-sm text-gray-500">
          Tests Playwright's <code>setInputFiles()</code> for the hidden input, and drag-and-drop
          via <code>page.dispatchEvent()</code> with a DataTransfer payload.
        </p>
      </div>

      {/* Drop zone */}
      <div
        data-testid="drop-zone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
      >
        <input
          ref={inputRef}
          data-testid="file-input"
          type="file"
          multiple
          onChange={(e) => processFiles(e.target.files)}
          className="sr-only"
          aria-label="File upload"
        />
        <p className="text-4xl mb-3">{dragging ? '📂' : '📁'}</p>
        <p className="text-sm font-medium text-gray-700">
          {dragging ? 'Drop files here' : 'Click or drag files here to upload'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Any file type · uploads POST to <code>/api/upload</code> (10MB limit per file)
        </p>
        {dragging && (
          <div
            data-testid="drop-zone-active"
            className="absolute inset-0 rounded-xl bg-indigo-100 opacity-30 pointer-events-none"
          />
        )}
      </div>

      {/* Upload status */}
      <div data-testid="upload-status" className="text-xs">
        {status === 'uploading' && (
          <span className="text-indigo-600 font-medium">⏳ Uploading…</span>
        )}
        {status === 'success' && (
          <span className="text-green-600 font-medium">✓ Upload complete</span>
        )}
        {status === 'error' && (
          <span data-testid="upload-error" className="text-red-600 font-medium">✗ {errorMsg}</span>
        )}
        {status === 'idle' && <span className="text-gray-400">Idle</span>}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">
              <span data-testid="file-count">{files.length}</span> file{files.length !== 1 ? 's' : ''} selected
            </p>
            <button
              data-testid="clear-all-button"
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Clear all
            </button>
          </div>

          <ul data-testid="file-list" className="divide-y divide-gray-50">
            {files.map((f, i) => (
              <li
                key={f.id}
                data-testid={`file-item-${i}`}
                className="flex items-center gap-4 px-5 py-3"
              >
                {f.preview ? (
                  <img
                    src={f.preview}
                    alt={f.name}
                    data-testid={`file-preview-${i}`}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="text-2xl flex-shrink-0" aria-hidden>{fileIcon(f.type)}</span>
                )}

                <div className="flex-1 min-w-0">
                  <p data-testid={`file-name-${i}`} className="text-sm font-medium text-gray-900 truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-gray-400 flex gap-2 mt-0.5">
                    <span data-testid={`file-size-${i}`}>{formatBytes(f.size)}</span>
                    <span>·</span>
                    <span data-testid={`file-type-${i}`}>{f.type}</span>
                  </p>
                </div>

                <button
                  data-testid={`file-remove-${i}`}
                  onClick={() => removeFile(f.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none px-1"
                  aria-label={`Remove ${f.name}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Total size:{' '}
            <span data-testid="total-size" className="font-semibold">
              {formatBytes(files.reduce((sum, f) => sum + f.size, 0))}
            </span>
          </div>
        </div>
      )}

      {files.length === 0 && (
        <p data-testid="no-files-message" className="text-sm text-gray-400 italic text-center">
          No files selected yet.
        </p>
      )}
    </div>
  )
}
