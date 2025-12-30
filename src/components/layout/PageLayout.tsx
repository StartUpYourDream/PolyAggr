import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function PageLayout() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
