import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import RouteFallback from '@/shared/ui/RouteFallback'

const Home = lazy(() => import('@/pages/home'))
const Visualizer = lazy(() => import('@/pages/visualizer'))
const NotFound = lazy(() => import('@/pages/not-found'))

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/visualizer" element={<Visualizer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
