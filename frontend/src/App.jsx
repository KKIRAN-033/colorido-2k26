import { Routes, Route, useLocation } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import PageTransition from './components/PageTransition/PageTransition'
import OpeningCinematic from './components/OpeningCinematic/OpeningCinematic'
import CharacterUniverseGuide from './components/CharacterUniverse/CharacterUniverseGuide'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home/Home'))
const About = lazy(() => import('./pages/About/About'))
const Cultural = lazy(() => import('./pages/Cultural/Cultural'))
const Sports = lazy(() => import('./pages/Sports/Sports'))
const EventDetails = lazy(() => import('./pages/EventDetails/EventDetails'))
const Schedule = lazy(() => import('./pages/Schedule/Schedule'))
const Register = lazy(() => import('./pages/Register/Register'))
const Announcements = lazy(() => import('./pages/Announcements/Announcements'))
const Results = lazy(() => import('./pages/Results/Results'))
const Gallery = lazy(() => import('./pages/Gallery/Gallery'))
const Sponsors = lazy(() => import('./pages/Sponsors/Sponsors'))
const Contact = lazy(() => import('./pages/Contact/Contact'))

// Admin pages
const AdminLogin = lazy(() => import('./admin/Login/AdminLogin'))
const AdminDashboard = lazy(() => import('./admin/Dashboard/AdminDashboard'))
const AdminEvents = lazy(() => import('./admin/Events/AdminEvents'))
const AdminRegistrations = lazy(() => import('./admin/Registrations/AdminRegistrations'))
const AdminSchedule = lazy(() => import('./admin/Schedule/AdminSchedule'))
const AdminAnnouncements = lazy(() => import('./admin/Announcements/AdminAnnouncements'))
const AdminResults = lazy(() => import('./admin/Results/AdminResults'))
const AdminGallery = lazy(() => import('./admin/Gallery/AdminGallery'))
const AdminSponsors = lazy(() => import('./admin/Sponsors/AdminSponsors'))

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  const [showIntro, setShowIntro] = useState(() => {
    // Show intro on first visit unless skipped or completed
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('intro') === 'false') return false
    } catch (_) {}
    return sessionStorage.getItem('colorido_intro_shown') !== 'true'
  })

  // Global helper for user to replay intro
  useEffect(() => {
    window.replayColoridoIntro = () => {
      sessionStorage.removeItem('colorido_intro_shown')
      setShowIntro(true)
    }
  }, [])

  return (
    <>
      {/* 1. CINEMATIC IRON MAN OPENING EXPERIENCE (HOME PAGE ONLY) */}
      {!isAdmin && showIntro && location.pathname === '/' && (
        <OpeningCinematic onComplete={() => setShowIntro(false)} />
      )}

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><PageTransition><Home /></PageTransition><Footer /></>} />
          <Route path="/about" element={<><Navbar /><PageTransition><About /></PageTransition><Footer /></>} />
          <Route path="/cultural" element={<><Navbar /><PageTransition><Cultural /></PageTransition><Footer /></>} />
          <Route path="/sports" element={<><Navbar /><PageTransition><Sports /></PageTransition><Footer /></>} />
          <Route path="/events/:slug" element={<><Navbar /><PageTransition><EventDetails /></PageTransition><Footer /></>} />
          <Route path="/schedule" element={<><Navbar /><PageTransition><Schedule /></PageTransition><Footer /></>} />
          <Route path="/register" element={<><Navbar /><PageTransition><Register /></PageTransition><Footer /></>} />
          <Route path="/announcements" element={<><Navbar /><PageTransition><Announcements /></PageTransition><Footer /></>} />
          <Route path="/results" element={<><Navbar /><PageTransition><Results /></PageTransition><Footer /></>} />
          <Route path="/gallery" element={<><Navbar /><PageTransition><Gallery /></PageTransition><Footer /></>} />
          <Route path="/sponsors" element={<><Navbar /><PageTransition><Sponsors /></PageTransition><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><PageTransition><Contact /></PageTransition><Footer /></>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/registrations" element={<AdminRegistrations />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/results" element={<AdminResults />} />
          <Route path="/admin/gallery" element={<AdminGallery />} />
          <Route path="/admin/sponsors" element={<AdminSponsors />} />
        </Routes>
      </Suspense>

      {/* 2. GLOBAL SUPERHERO ASSISTANT (J.A.R.V.I.S. / TACTICAL AI) */}
      {!isAdmin && <CharacterUniverseGuide />}
    </>
  )
}

export default App

