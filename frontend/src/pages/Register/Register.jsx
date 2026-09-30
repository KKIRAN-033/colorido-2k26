import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, AlertCircle, ArrowRight,
  Plus, Trash2, ShieldCheck, Sparkles
} from 'lucide-react'
import CharacterManager from '../../components/CharacterManager/CharacterManager'
import SpidermanWebCTA from '../../components/SpidermanCTA/SpidermanWebCTA'
import IronManSnapSuccess from '../../components/RegistrationSuccess/IronManSnapSuccess'
import { getEvents, createRegistration } from '../../services/api'
import { getCharacterBySlug, IRON_MAN_GLOBAL } from '../../characters/charactersData'
import './Register.css'

const STEPS = ['Select Arena Event', 'Champion Credentials', 'Verify & Launch']

export default function Register() {
  const [searchParams] = useSearchParams()
  const preSelectedEvent = searchParams.get('event')

  const [events, setEvents] = useState([])
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successRegistration, setSuccessRegistration] = useState(null)

  const heroManagerRef = useRef(null)

  // Form state
  const [selectedEventId, setSelectedEventId] = useState('')
  const [form, setForm] = useState({
    participant_name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
    team_name: '',
    team_members: [{ name: '', email: '', phone: '' }],
  })

  const fetchAllEvents = () => {
    setLoading(true)
    setError(null)
    getEvents()
      .then(data => {
        const evts = data.events || []
        setEvents(evts)
        if (preSelectedEvent) {
          const found = evts.find(e => e.slug === preSelectedEvent)
          if (found) {
            setSelectedEventId(found.id)
            setStep(1)
          }
        }
      })
      .catch(err => {
        console.error('Failed to load events for registration:', err)
        setError('Unable to load competition disciplines from server. Please verify the backend is running.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAllEvents()
  }, [preSelectedEvent])

  const selectedEvent = events.find(e => e.id === selectedEventId)
  const avenger = selectedEvent ? getCharacterBySlug(selectedEvent.slug) : IRON_MAN_GLOBAL
  const isTeam = selectedEvent?.participation_type === 'team'

  // Trigger Avenger event-specific action when event is picked
  const handleSelectEvent = (event) => {
    setSelectedEventId(event.id)
    setError(null)
    const hero = getCharacterBySlug(event.slug)
    setTimeout(() => {
      heroManagerRef.current?.highlight(hero.eventAction)
      heroManagerRef.current?.talk(hero.quote)
    }, 50)
  }

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const addMember = () => setForm(prev => ({
    ...prev,
    team_members: [...prev.team_members, { name: '', email: '', phone: '' }]
  }))

  const removeMember = (index) => setForm(prev => ({
    ...prev,
    team_members: prev.team_members.filter((_, i) => i !== index)
  }))

  const updateMember = (index, field, value) => setForm(prev => ({
    ...prev,
    team_members: prev.team_members.map((m, i) => i === index ? { ...m, [field]: value } : m)
  }))

  const validateStep1 = () => {
    if (!selectedEventId) {
      setError('Please choose an event to proceed.')
      return false
    }
    if (!selectedEvent?.registration_open) {
      setError('Registration is currently closed for this event.')
      return false
    }
    setError(null)
    return true
  }

  const validateStep2 = () => {
    if (!form.participant_name.trim()) { setError('Full Name is required.'); return false }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { setError('A valid email address is required.'); return false }
    if (!form.phone.trim() || form.phone.length < 10) { setError('A valid 10-digit mobile number is required.'); return false }
    if (!form.college.trim()) { setError('College or University name is required.'); return false }
    if (isTeam && !form.team_name.trim()) { setError('Team name is required for squad competitions.'); return false }
    setError(null)
    return true
  }

  const handleNext = () => {
    if (step === 0 && validateStep1()) {
      setStep(1)
      heroManagerRef.current?.react()
    } else if (step === 1 && validateStep2()) {
      setStep(2)
      heroManagerRef.current?.point()
    }
  }

  const handleSubmit = async () => {
    setSubmitLoading(true)
    setError(null)

    const payload = {
      event_id: selectedEventId,
      participant_name: form.participant_name,
      email: form.email,
      phone: form.phone,
      college: form.college,
      department: form.department || undefined,
      year: form.year || undefined,
    }

    if (isTeam) {
      payload.team_name = form.team_name
      payload.team_members = form.team_members.filter(m => m.name.trim())
    }

    try {
      // POST to FastAPI backend -> MongoDB insertion -> returns { registration: { registration_id: "CLR26-..." } }
      const result = await createRegistration(payload)
      if (result && result.registration) {
        setSuccessRegistration(result.registration)
      } else {
        throw new Error('Invalid registration response')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check network connection and try again.')
    } finally {
      setSubmitLoading(false)
    }
  }

  // CINEMATIC IRON MAN SNAP SUCCESS SEQUENCE
  if (successRegistration) {
    return (
      <div style={{ paddingTop: '5.5rem' }}>
        <IronManSnapSuccess
          registration={successRegistration}
          onReset={() => {
            setSuccessRegistration(null)
            setStep(0)
            setSelectedEventId('')
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container-sm register-container">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} /> 100% Free Entry • Official Pass
            </div>
            <h1 className="section-title">Avengers Arena Registration</h1>
            <p className="section-subtitle">
              Choose your event, assemble your squad, and secure your place in COLORIDO 2K26.
            </p>
          </motion.div>

          {/* Dynamic Avenger Briefing Box */}
          <div className="avenger-briefing-box">
            <CharacterManager ref={heroManagerRef} character={avenger} size={64} />
            <div className="avenger-briefing-content">
              <div className="avenger-briefing-tag" style={{ color: avenger.themeColor }}>
                {avenger.name} — {avenger.heroTitle}
              </div>
              <p className="avenger-briefing-quote">
                "{avenger.quote}"
              </p>
            </div>
          </div>

          {/* 3-Step Wizard Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 800,
                  background: i <= step ? 'linear-gradient(135deg, #e11d48, #3b82f6)' : 'rgba(30, 41, 59, 0.6)',
                  color: i <= step ? 'white' : '#64748b',
                  border: i <= step ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.85rem', color: i <= step ? '#ffffff' : '#64748b', fontWeight: i === step ? 700 : 500 }}>
                  {s}
                </span>
                {i < 2 && <div style={{ width: '25px', height: '2px', background: 'rgba(255, 255, 255, 0.1)' }} />}
              </div>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem',
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '0.75rem', marginBottom: '1.5rem', color: '#f87171', fontSize: '0.9rem', fontWeight: 600
              }}
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 0: SELECT EVENT */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#ffffff' }}>
                    Select Your Competition Discipline
                  </h2>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                      <div className="spinner" style={{ margin: '0 auto' }} />
                      <p style={{ color: '#94a3b8', marginTop: '1rem', fontSize: '0.9rem' }}>Loading official competition disciplines...</p>
                    </div>
                  ) : events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                      <p style={{ color: '#f87171', fontWeight: 600, marginBottom: '1rem' }}>Unable to load disciplines from server.</p>
                      <button
                        onClick={fetchAllEvents}
                        style={{
                          background: 'linear-gradient(135deg, #e11d48, #3b82f6)',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.55rem 1.5rem',
                          borderRadius: '999px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : (
                    <div className="event-selection-grid">
                      {events.filter(e => e.registration_open).map(event => {
                        const eventHero = getCharacterBySlug(event.slug)
                        const isSelected = selectedEventId === event.id

                        return (
                          <label
                            key={event.id}
                            className={`event-radio-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleSelectEvent(event)}
                          >
                            <input
                              type="radio"
                              name="event"
                              value={event.id}
                              checked={isSelected}
                              onChange={() => {}}
                              style={{ accentColor: '#e11d48' }}
                            />
                            <CharacterManager character={eventHero} size={40} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff' }}>
                                {event.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: eventHero.themeColor, fontWeight: 700 }}>
                                {eventHero.name} • {event.category?.toUpperCase()}
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 1: PARTICIPANT CREDENTIALS */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.85rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                        {isTeam ? 'Squad Captain & Team Dossier' : 'Participant Credentials'}
                      </h2>
                      <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                        Arena Event: {selectedEvent?.name} • Guided by {avenger.name}
                      </div>
                    </div>
                    <CharacterManager character={avenger} size={48} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{isTeam ? "Squad Captain Name *" : "Full Name *"}</label>
                    <input
                      className="form-input"
                      value={form.participant_name}
                      onChange={e => updateForm('participant_name', e.target.value)}
                      placeholder="e.g. Tony Stark"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        className="form-input"
                        type="email"
                        value={form.email}
                        onChange={e => updateForm('email', e.target.value)}
                        placeholder="stark@avengers.edu"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <input
                        className="form-input"
                        type="tel"
                        value={form.phone}
                        onChange={e => updateForm('phone', e.target.value)}
                        placeholder="10-digit mobile"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">College / University Name *</label>
                    <input
                      className="form-input"
                      value={form.college}
                      onChange={e => updateForm('college', e.target.value)}
                      placeholder="e.g. Stark Institute of Technology"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Department / Branch</label>
                      <input
                        className="form-input"
                        value={form.department}
                        onChange={e => updateForm('department', e.target.value)}
                        placeholder="e.g. Mechanical Engineering"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Academic Year</label>
                      <select
                        className="form-select"
                        value={form.year}
                        onChange={e => updateForm('year', e.target.value)}
                      >
                        <option value="">Select year</option>
                        <option>1st Year</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th Year</option>
                        <option>Postgraduate</option>
                      </select>
                    </div>
                  </div>

                  {/* Team fields */}
                  {isTeam && (
                    <div style={{ marginTop: '1.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Squad / Band Name *</label>
                        <input
                          className="form-input"
                          value={form.team_name}
                          onChange={e => updateForm('team_name', e.target.value)}
                          placeholder="e.g. The Avengers"
                        />
                      </div>

                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                        Squad Teammates (Allowed: {selectedEvent?.min_team_size || 3}–{selectedEvent?.max_team_size || 10})
                      </h3>

                      {form.team_members.map((member, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <input
                            className="form-input"
                            placeholder={`Member ${i + 1} Name`}
                            value={member.name}
                            onChange={e => updateMember(i, 'name', e.target.value)}
                          />
                          <input
                            className="form-input"
                            placeholder="Phone Number"
                            value={member.phone}
                            onChange={e => updateMember(i, 'phone', e.target.value)}
                          />
                          {form.team_members.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => removeMember(i)}
                              style={{ color: '#f87171' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={addMember}
                        style={{ marginTop: '0.5rem' }}
                      >
                        <Plus size={14} /> Add Teammate
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: VERIFY & LAUNCH */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="card" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#ffffff' }}>
                    Review Dossier Before Launch
                  </h2>

                  <div style={{ display: 'grid', gap: '0.85rem' }}>
                    {[
                      ['Target Event', selectedEvent?.name],
                      ['Assigned Avenger', avenger.name],
                      ['Arena Category', `${selectedEvent?.category?.toUpperCase()} ${selectedEvent?.division ? `(${selectedEvent.division})` : ''}`],
                      ['Squad / Solo', selectedEvent?.participation_type],
                      ['Champion Name', form.participant_name],
                      ['Email', form.email],
                      ['Phone', form.phone],
                      ['Institution', form.college],
                      ...(form.department ? [['Department', form.department]] : []),
                      ...(form.year ? [['Academic Year', form.year]] : []),
                      ...(isTeam ? [['Squad Name', form.team_name]] : []),
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '160px 1fr',
                          fontSize: '0.92rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                          paddingBottom: '0.5rem',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#94a3b8' }}>{label}</span>
                        <span style={{ color: '#ffffff', fontWeight: 600 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <ShieldCheck size={18} color="#34d399" />
                    <span style={{ color: '#34d399', fontSize: '0.85rem', fontWeight: 700 }}>
                      100% Free Entry. The Iron Man Snap sequence will confirm your pass upon database verification.
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', gap: '1rem' }}>
            {step > 0 ? (
              <SpidermanWebCTA
                theme="secondary"
                size="md"
                onClick={() => { setStep(step - 1); setError(null) }}
              >
                ← Back
              </SpidermanWebCTA>
            ) : <div />}

            {step < 2 ? (
              <SpidermanWebCTA
                theme="primary"
                size="md"
                onClick={handleNext}
              >
                Continue →
              </SpidermanWebCTA>
            ) : (
              <SpidermanWebCTA
                theme="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={submitLoading}
              >
                {submitLoading ? 'Verifying Coordinates...' : 'Confirm & Snap Launch'}
              </SpidermanWebCTA>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
