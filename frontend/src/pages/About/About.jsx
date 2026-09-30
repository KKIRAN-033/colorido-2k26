import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'

export default function About() {
  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container-sm">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="section-title">About COLORIDO</h1>
            <p className="section-subtitle">
              A national-level celebration where culture meets sport, and creativity has no bounds.
            </p>
          </motion.div>

          <motion.div
            className="card"
            style={{ padding: '2.5rem', marginBottom: '2rem' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--ff-heading)' }}>
              <span className="text-gradient">What is COLORIDO?</span>
            </h2>
            <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              COLORIDO 2K26 is a national-level cultural and sports event that brings together
              students from across the country to compete, create, and celebrate. From Fine Arts
              to Basketball, from Dance to Literary events — COLORIDO is where talent meets opportunity.
            </p>
            <p style={{ color: 'var(--clr-text-secondary)', lineHeight: 1.8 }}>
              The event features a comprehensive lineup of cultural events including Fine Arts,
              Music & Band, Dance, Choreoday, Dramatics, Fashion Show, Tekraft Events, and Literary,
              alongside exciting sports like Basketball, Volleyball, Table Tennis, Throwball, and TenniKoit.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Cultural Events', desc: 'Fine Arts, Music, Dance, Dramatics, Fashion Show & more', icon: '🎭' },
              { title: 'Sports Events', desc: 'Basketball, Volleyball, Table Tennis, Throwball & TenniKoit', icon: '🏆' },
              { title: 'Open to All', desc: 'Students from colleges across the nation are welcome to participate', icon: '🌟' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="card"
                style={{ textAlign: 'center', padding: '2rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--clr-text-secondary)', fontSize: '0.9rem' }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
              Register Free For COLORIDO 2K26
            </SignatureCTA>
          </div>
        </div>
      </section>
    </div>
  )
}
