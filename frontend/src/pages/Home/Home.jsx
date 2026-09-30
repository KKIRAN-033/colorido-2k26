import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight, Calendar, Trophy, Palette, Zap, Sparkles,
  ShieldCheck, MapPin, Clock, ChevronDown, CheckCircle2,
  Bell, Award, Image as ImageIcon, ExternalLink, HelpCircle
} from 'lucide-react'
import Hero from '../../components/Hero/Hero'
import EventCard from '../../components/EventCard/EventCard'
import CharacterShowcase from '../../components/CharacterUniverse/CharacterShowcase'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import {
  getEvents,
  getAnnouncements,
  getSchedules,
  getResults,
  getGallery,
  getSponsors
} from '../../services/api'
import './Home.css'

export default function Home() {
  const [events, setEvents] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all' | 'cultural' | 'sports'
  const [announcements, setAnnouncements] = useState([])
  const [schedules, setSchedules] = useState([])
  const [results, setResults] = useState([])
  const [gallery, setGallery] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data.events || []))
      .catch(() => {})

    getAnnouncements()
      .then(data => setAnnouncements(data.announcements?.slice(0, 3) || []))
      .catch(() => {})

    getSchedules()
      .then(data => setSchedules(data.schedules?.slice(0, 4) || []))
      .catch(() => {})

    getResults()
      .then(data => setResults(data.results?.slice(0, 3) || []))
      .catch(() => {})

    getGallery(1, 4)
      .then(data => setGallery(data.images?.slice(0, 4) || []))
      .catch(() => {})

    getSponsors()
      .then(data => setSponsors(data.sponsors || []))
      .catch(() => {})
  }, [])

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter(e => e.category === selectedCategory)

  const faqs = [
    {
      q: "Is there any registration fee for COLORIDO 2K26?",
      a: "No! All events in COLORIDO 2K26 are 100% FREE to enter for all eligible college and university students."
    },
    {
      q: "Can I participate in multiple events?",
      a: "Yes! You can register for multiple events as long as their scheduled timings do not conflict. Check the schedule matrix before finalizing."
    },
    {
      q: "What do I need to bring on event day?",
      a: "You must bring your official College/University Student ID Card along with your digital or printed COLORIDO Registration Badge (CLR26 ID)."
    },
    {
      q: "Are team registrations allowed for solo events?",
      a: "No, events marked as Solo require individual registration. Team events allow a team leader to enter squad member details."
    },
    {
      q: "How will tournament brackets and rounds be structured?",
      a: "All sports events follow standard knockout brackets. Cultural events have preliminary and final performance rounds evaluated by external celebrity judges."
    }
  ]

  return (
    <div className="home-universe">
      {/* 1. HERO CINEMATIC UNIVERSE */}
      <Hero />

      {/* 2. THE 16 AVENGERS CHAMPIONS UNIVERSE SHOWCASE */}
      <CharacterShowcase />

      {/* 3. DUAL ARENA SPOTLIGHT: CULTURAL ARENA VS SPORTS COLOSSEUM */}
      <section className="arena-spotlight-section">
        <div className="arena-spotlight-grid">
          {/* Cultural Arena Card */}
          <div className="arena-card cultural-arena">
            <div>
              <div className="arena-badge-header" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>
                <Palette size={14} /> Cultural Multiverse
              </div>
              <h3 className="arena-card-title">The Cultural Arena</h3>
              <p className="arena-card-desc">
                Step into a theater of boundless imagination. From resonant solo vocals to electric synchronized dance groups, the grand cultural stage is where stars are born.
              </p>
              <div className="arena-tags-list">
                <span className="arena-tag-item">Fine Arts</span>
                <span className="arena-tag-item">Music (Solo & Group)</span>
                <span className="arena-tag-item">Dance (Solo & Group)</span>
                <span className="arena-tag-item">Choreoday</span>
                <span className="arena-tag-item">Dramatics</span>
                <span className="arena-tag-item">Fashion Show</span>
                <span className="arena-tag-item">Tekraft</span>
                <span className="arena-tag-item">Literary</span>
              </div>
            </div>
            <div>
              <SignatureCTA to="/cultural" theme="primary" size="md" icon={ArrowRight}>
                Explore 10 Cultural Events
              </SignatureCTA>
            </div>
          </div>

          {/* Sports Colosseum Card */}
          <div className="arena-card sports-arena">
            <div>
              <div className="arena-badge-header" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8' }}>
                <Trophy size={14} /> Athletic Colosseum
              </div>
              <h3 className="arena-card-title">The Sports Colosseum</h3>
              <p className="arena-card-desc">
                Feel the thunder on the hardwood and court. High-octane tournaments featuring the finest collegiate athletes competing for championship glory.
              </p>
              <div className="arena-tags-list">
                <span className="arena-tag-item">Basketball (Boys)</span>
                <span className="arena-tag-item">Volleyball (Boys)</span>
                <span className="arena-tag-item">Table Tennis (Boys)</span>
                <span className="arena-tag-item">Throwball (Girls)</span>
                <span className="arena-tag-item">TenniKoit (Girls)</span>
                <span className="arena-tag-item">Table Tennis (Girls)</span>
              </div>
            </div>
            <div>
              <SignatureCTA to="/sports" theme="cyan" size="md" icon={ArrowRight}>
                Explore 6 Sports Tournaments
              </SignatureCTA>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EVENT UNIVERSE MATRIX (REAL EVENT CARDS WITH LIVE FILTERING) */}
      <section className="section" id="events-matrix" style={{ background: 'rgba(10, 15, 29, 0.9)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-badge-center">
              <Sparkles size={14} /> Complete Event Matrix
            </div>
            <h2 className="section-title-gradient">
              16 Official National Events
            </h2>
            <p className="section-subtitle-clean">
              All events feature zero entry fees, official certified judging, and national-level merit trophies.
            </p>

            {/* Filter Tabs */}
            <div className="character-tabs">
              <button
                className={`character-tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Events ({events.length || 16})
              </button>
              <button
                className={`character-tab-btn ${selectedCategory === 'cultural' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('cultural')}
              >
                Cultural (10)
              </button>
              <button
                className={`character-tab-btn ${selectedCategory === 'sports' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('sports')}
              >
                Sports (6)
              </button>
            </div>
          </div>

          <div className="grid-events">
            {filteredEvents.map((event, idx) => (
              <EventCard key={event.id || event.slug} event={event} index={idx} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
              Register For Any Event Free
            </SignatureCTA>
          </div>
        </div>
      </section>

      {/* 5. SCHEDULE MATRIX PREVIEW */}
      <section className="schedule-preview-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-badge-center">
              <Calendar size={14} /> Festival Timetable
            </div>
            <h2 className="section-title-gradient">
              Live Event Schedule Preview
            </h2>
            <p className="section-subtitle-clean">
              Plan your competition slots across the main campus auditoriums and sports arenas.
            </p>
          </div>

          <div className="schedule-grid-preview">
            {schedules.map((item, idx) => (
              <div key={item.id || idx} className="schedule-card-mini">
                <div className="schedule-time-tag">
                  <Clock size={13} /> {item.start_time} - {item.end_time}
                </div>
                <h4 style={{ color: '#ffffff', fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  {item.event_name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  <MapPin size={13} color="#ec4899" />
                  <span>{item.venue}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <SignatureCTA to="/schedule" theme="secondary" size="md" icon={ArrowRight}>
              View Complete Master Schedule
            </SignatureCTA>
          </div>
        </div>
      </section>

      {/* 6. BROADCAST & LIVE ANNOUNCEMENTS TICKER */}
      {announcements.length > 0 && (
        <section className="section" style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="section-badge-center">
                <Bell size={14} /> Official Broadcast
              </div>
              <h2 className="section-title-gradient">Latest News & Bulletins</h2>
            </div>

            <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((ann, i) => (
                <div
                  key={ann.id || i}
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '1.25rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>{ann.title}</h4>
                    {ann.priority === 'high' && (
                      <span className="badge badge-urgent">Important</span>
                    )}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.55 }}>
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <SignatureCTA to="/announcements" theme="ghost" size="md" icon={ArrowRight}>
                View All Announcements
              </SignatureCTA>
            </div>
          </div>
        </section>
      )}

      {/* 7. HALL OF FAME & RECENT RESULTS */}
      {results.length > 0 && (
        <section className="results-preview-section">
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="section-badge-center">
                <Award size={14} /> Hall of Champions
              </div>
              <h2 className="section-title-gradient">Recent Podium Results</h2>
              <p className="section-subtitle-clean">
                Celebrating collegiate champions who etched their names into the Colorido records.
              </p>
            </div>

            <div className="results-grid-preview">
              {results.map((res, i) => (
                <div key={res.id || i} className="result-card-mini">
                  <div
                    className={`result-medal ${
                      res.position === '1st' ? 'medal-gold' : res.position === '2nd' ? 'medal-silver' : 'medal-bronze'
                    }`}
                  >
                    {res.position}
                  </div>
                  <div>
                    <h4 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.2rem' }}>
                      {res.participant_name || res.team_name}
                    </h4>
                    <div style={{ color: '#ec4899', fontSize: '0.85rem', fontWeight: 700 }}>
                      {res.event_name}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                      {res.college}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <SignatureCTA to="/results" theme="secondary" size="md" icon={ArrowRight}>
                View Full Results Wall
              </SignatureCTA>
            </div>
          </div>
        </section>
      )}

      {/* 8. VISUAL UNIVERSE GALLERY PREVIEW */}
      {gallery.length > 0 && (
        <section className="section" style={{ background: 'rgba(10, 15, 29, 0.95)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div className="section-badge-center">
                <ImageIcon size={14} /> Visual Archive
              </div>
              <h2 className="section-title-gradient">Electrifying Moments</h2>
              <p className="section-subtitle-clean">
                Glimpses from the stage and court that capture the raw energy of COLORIDO.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {gallery.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    position: 'relative',
                    height: '240px',
                    borderRadius: '1.25rem',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: '1.25rem',
                    }}
                  >
                    <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.95rem' }}>
                      {item.title?.replace(/\[.*?\]/g, '')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <SignatureCTA to="/gallery" theme="secondary" size="md" icon={ArrowRight}>
                Explore Full Gallery Lightbox
              </SignatureCTA>
            </div>
          </div>
        </section>
      )}

      {/* 9. ELITE PARTNERS & SPONSORS */}
      {sponsors.length > 0 && (
        <section className="section" style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="section-badge-center">
              Official Partners
            </div>
            <h2 className="section-title-gradient">Proudly Supported By</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
              {sponsors.map((sp, idx) => (
                <div
                  key={sp.id || idx}
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1.5rem 2.5rem',
                    borderRadius: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <ShieldCheck size={20} color="#fbbf24" />
                  <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.1rem' }}>
                    {sp.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 10. HOLOGRAPHIC REGISTRATION LAUNCHPAD */}
      <section className="section">
        <div className="container">
          <div className="hologram-launchpad">
            <div className="hologram-badge-guarantee">
              <CheckCircle2 size={16} /> 100% Free Entry Guaranteed
            </div>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', fontWeight: 900, color: '#ffffff', marginBottom: '1rem' }}>
              Your Arena Awaits You.
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '1.15rem', maxWidth: '650px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              Instant registration with real-time digital pass generation (`CLR26-CODE-SEQ`). Print your badge or download the official verification credentials instantly.
            </p>

            <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
              Register Online Now — Free
            </SignatureCTA>
          </div>
        </div>
      </section>

      {/* 11. CAMPUS VENUE & DIRECTIONS */}
      <section className="section" style={{ background: 'rgba(10, 15, 29, 0.9)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-badge-center">
              <MapPin size={14} /> Campus Map
            </div>
            <h2 className="section-title-gradient">Campus Venues & Zones</h2>
            <p className="section-subtitle-clean">
              All cultural and sports events take place inside our world-class campus facilities.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Grand Auditorium', use: 'Choreoday, Fashion Show, Dramatics', zone: 'Zone A - Main Block' },
              { name: 'Open-Air Amphitheatre', use: 'Music Solo & Group Bands', zone: 'Zone B - Arts Pavilion' },
              { name: 'Indoor Sports Complex', use: 'Table Tennis, Basketball Finals', zone: 'Zone C - Sports Arena' },
              { name: 'Outdoor Floodlit Courts', use: 'Volleyball, Throwball, TenniKoit', zone: 'Zone D - Athletic Fields' },
            ].map((v, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '1.25rem',
                  padding: '1.75rem',
                }}
              >
                <div style={{ color: '#06b6d4', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  {v.zone}
                </div>
                <h4 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 800, margin: '0.4rem 0' }}>
                  {v.name}
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                  {v.use}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FREQUENTLY ASKED QUESTIONS */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-badge-center">
              <HelpCircle size={14} /> Got Questions?
            </div>
            <h2 className="section-title-gradient">Frequently Asked Questions</h2>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-card ${openFaq === idx ? 'open' : ''}`}>
                <button className="faq-question-btn" onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}>
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0,
                    }}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      className="faq-answer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
