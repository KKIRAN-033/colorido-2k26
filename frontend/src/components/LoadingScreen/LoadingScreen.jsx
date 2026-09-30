import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ textAlign: 'center' }}
      >
        <motion.h1
          style={{
            fontFamily: 'var(--ff-heading)',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #e94560, #6f42c1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1.5rem',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          COLORIDO
        </motion.h1>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </motion.div>
    </div>
  )
}
