import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function PageLayout() {
  return (
    <div className="min-h-screen bg-dark-900 dark:bg-dark-900 light:bg-white">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
