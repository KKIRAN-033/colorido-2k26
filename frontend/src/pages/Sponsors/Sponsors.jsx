import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import { getSponsors } from '../../services/api'

export default function Sponsors() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSponsors()
      .then(data => setSponsors(data.sponsors || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const tierLabels = { title: 'Title Sponsor', platinum: 'Platinum Sponsors', gold: 'Gold Sponsors', silver: 'Silver Sponsors', partner: 'Partners' }
  const tierStyles = {
    title: { fontSize: '1.5rem', borderColor: 'var(--clr-gold)' },
    platinum: { fontSize: '1.2rem', borderColor: 'var(--clr-text-secondary)' },
    gold: { fontSize: '1.1rem', borderColor: 'var(--clr-gold)' },
    silver: { fontSize: '1rem', borderColor: '#c0c0c0' },
    partner: { fontSize: '0.95rem', borderColor: 'var(--clr-border)' },
  }

  // Group by tier
  const grouped = sponsors.reduce((acc, s) => {
    const tier = s.tier || 'partner'
    if (!acc[tier]) acc[tier] = []
    acc[tier].push(s)
    return acc
  }, {})

  const tierOrder = ['title', 'platinum', 'gold', 'silver', 'partner']

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title">Our Sponsors</h1>
            <p className="section-subtitle">COLORIDO 2K26 is made possible by our generous sponsors</p>
          </motion.div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : sponsors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--clr-text-secondary)' }}>
              <p>Sponsor information will be updated soon.</p>
            </div>
          ) : (
            tierOrder.filter(t => grouped[t]?.length > 0).map(tier => (
              <div key={tier} style={{ marginBottom: '3rem' }}>
                <motion.h2
                  style={{ textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem', fontFamily: 'var(--ff-heading)' }}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                >
                  <span className="text-gradient-gold">{tierLabels[tier]}</span>
                </motion.h2>
                <div className="grid-sponsors" style={{ justifyItems: 'center' }}>
                  {grouped[tier].map((sponsor, i) => (
                    <motion.div key={sponsor.id || i} className="card"
                      style={{
                        padding: '2rem', textAlign: 'center', width: '100%',
                        borderTop: `3px solid ${tierStyles[tier]?.borderColor || 'var(--clr-border)'}`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {sponsor.logo_url ? (
                        <img src={sponsor.logo_url} alt={sponsor.name} style={{ maxHeight: '80px', margin: '0 auto 1rem', objectFit: 'contain' }} />
                      ) : (
                        <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', borderRadius: 'var(--radius-md)', background: 'var(--clr-bg-alt)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                          🏢
                        </div>
                      )}
                      <h3 style={{ fontSize: tierStyles[tier]?.fontSize || '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{sponsor.name}</h3>
                      {sponsor.website && (
                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.8rem', color: 'var(--clr-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          Visit Website <ExternalLink size={12} />
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/contact" theme="primary" size="lg">
              Partner With COLORIDO 2K26
            </SignatureCTA>
          </div>
        </div>
      </section>
    </div>
  )
}
