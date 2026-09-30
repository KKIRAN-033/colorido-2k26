import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { submitContact } from '../../services/api'
import SpidermanWebCTA from '../../components/SpidermanCTA/SpidermanWebCTA'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true); setError(null)
    try {
      await submitContact(form)
      setSuccess(true)
      setForm({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title">Contact Us</h1>
            <p className="section-subtitle">Have questions about COLORIDO 2K26? Reach out to us!</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="card" style={{ padding: '2rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--ff-heading)' }}>Get in Touch</h2>
                {[
                  { icon: <Mail size={18} />, label: 'Email', value: 'contact@colorido.in [Placeholder]' },
                  { icon: <Phone size={18} />, label: 'Phone', value: '+91 XXXXX XXXXX [Placeholder]' },
                  { icon: <MapPin size={18} />, label: 'Venue', value: 'College Campus [Placeholder — update via admin]' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ color: 'var(--clr-primary)', marginTop: '0.1rem' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clr-text-muted)', marginBottom: '0.15rem' }}>{item.label}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {success ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <CheckCircle size={48} style={{ color: 'var(--clr-emerald)', margin: '0 auto 1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Message Sent!</h3>
                  <p style={{ color: 'var(--clr-text-secondary)', marginBottom: '1.5rem' }}>We'll get back to you soon.</p>
                  <SpidermanWebCTA theme="secondary" size="md" onClick={() => setSuccess(false)}>
                    Send Another Message
                  </SpidermanWebCTA>
                </div>
              ) : (
                <form className="card" style={{ padding: '2rem' }} onSubmit={handleSubmit}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--ff-heading)' }}>Send a Message</h2>

                  {error && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(233,69,96,0.1)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', color: 'var(--clr-primary)', fontSize: '0.85rem' }}>
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input className="form-input" value={form.name} onChange={e => updateForm('name', e.target.value)} placeholder="Your name" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-input" type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" type="tel" value={form.phone} onChange={e => updateForm('phone', e.target.value)} placeholder="Optional" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input className="form-input" value={form.subject} onChange={e => updateForm('subject', e.target.value)} placeholder="What's this about?" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-textarea" value={form.message} onChange={e => updateForm('message', e.target.value)} placeholder="Your message..." />
                  </div>
                  <SpidermanWebCTA
                    type="submit"
                    theme="primary"
                    size="lg"
                    fullWidth
                    disabled={loading}
                    icon={Send}
                  >
                    {loading ? 'Transmitting...' : 'Send Message'}
                  </SpidermanWebCTA>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
