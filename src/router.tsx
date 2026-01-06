import { createBrowserRouter } from 'react-router-dom'
import { PageLayout } from './components/layout/PageLayout'
import { Trending } from './pages/Trending'
import { EventDetail } from './pages/EventDetail'
import { UserDetail } from './pages/UserDetail'
import { Search } from './pages/Search'
import { Leaderboard } from './pages/Leaderboard'
import { Dashboard } from './pages/Dashboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout />,
    children: [
      {
        index: true,
        element: <Trending />,
      },
      {
        path: 'trending',
        element: <Trending />,
      },
      {
        path: 'event/:eventId',
        element: <EventDetail />,
      },
      {
        path: 'user/:address',
        element: <UserDetail />,
      },
      {
        path: 'search',
        element: <Search />,
      },
      {
        path: 'leaderboard',
        element: <Leaderboard />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'portfolio',
        element: <UserDetail />,
      },
      {
        path: 'portfolio/:address',
        element: <UserDetail />,
      },
    ],
  },
])
