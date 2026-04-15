import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex-center min-h-screen bg-gradient-to-br from-primary to-primary-900">
      <div className="text-center text-white px-4">
        <h1 className="text-9xl font-bold mb-4">404</h1>
        <p className="text-3xl font-semibold mb-2">Page Not Found</p>
        <p className="text-lg text-white/70 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-ghost flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}
