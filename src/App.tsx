import { useState } from 'react'
import type { Room } from './types'
import Sidebar from './components/Sidebar'
import AuthRoom from './components/rooms/AuthRoom'
import FormRoom from './components/rooms/FormRoom'
import DynamicRoom from './components/rooms/DynamicRoom'
import TableRoom from './components/rooms/TableRoom'
import InteractionsRoom from './components/rooms/InteractionsRoom'
import CDPRoom from './components/rooms/CDPRoom'
import MockApiRoom from './components/rooms/MockApiRoom'
import IframeRoom from './components/rooms/IframeRoom'
import ShadowDomRoom from './components/rooms/ShadowDomRoom'
import ToastRoom from './components/rooms/ToastRoom'
import RetryRoom from './components/rooms/RetryRoom'
import PaginationRoom from './components/rooms/PaginationRoom'
import UploadRoom from './components/rooms/UploadRoom'
import A11yRoom from './components/rooms/A11yRoom'

function RoomRenderer({ room }: { room: Room }) {
  switch (room) {
    case 'auth':         return <AuthRoom />
    case 'form':         return <FormRoom />
    case 'dynamic':      return <DynamicRoom />
    case 'table':        return <TableRoom />
    case 'interactions': return <InteractionsRoom />
    case 'cdp':          return <CDPRoom />
    case 'mock-api':     return <MockApiRoom />
    case 'iframe':       return <IframeRoom />
    case 'shadow-dom':   return <ShadowDomRoom />
    case 'toast':        return <ToastRoom />
    case 'retry':        return <RetryRoom />
    case 'pagination':   return <PaginationRoom />
    case 'upload':       return <UploadRoom />
    case 'a11y':         return <A11yRoom />
  }
}

export default function App() {
  const [activeRoom, setActiveRoom] = useState<Room>('auth')

  return (
    <div data-testid="app" className="flex min-h-screen bg-gray-50">
      <Sidebar activeRoom={activeRoom} onNavigate={setActiveRoom} />
      <main data-testid="main-content" className="flex-1 overflow-auto">
        <RoomRenderer room={activeRoom} />
      </main>
    </div>
  )
}
