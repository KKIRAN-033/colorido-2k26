import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, ArrowRight } from 'lucide-react'
import SignatureCTA from '../../components/SignatureCTA/SignatureCTA'
import { getGallery } from '../../services/api'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = filter ? { category: filter } : {}
    getGallery(params)
      .then(data => setImages(data.images || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const openLightbox = (index) => setLightbox(index)
  const closeLightbox = () => setLightbox(null)

  const navigate = useCallback((dir) => {
    if (lightbox === null) return
    setLightbox(prev => {
      const next = prev + dir
      if (next < 0) return images.length - 1
      if (next >= images.length) return 0
      return next
    })
  }, [lightbox, images.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (lightbox === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox, navigate])

  // Lock scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [lightbox])

  const categories = ['', 'cultural', 'sports', 'general', 'behind-the-scenes']

  return (
    <div style={{ paddingTop: '6rem' }}>
      <section className="section">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="section-title">Gallery</h1>
            <p className="section-subtitle">Moments captured at COLORIDO 2K26</p>
          </motion.div>

          {/* Category Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(cat)} style={{ textTransform: 'capitalize' }}>
                {cat || 'All'}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : images.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--clr-text-secondary)' }}>
              <ImageIcon size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No gallery images yet. Photos will be uploaded soon!</p>
            </div>
          ) : (
            <div className="grid-gallery">
              {images.map((img, i) => (
                <motion.div key={img.id || i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', cursor: 'pointer', aspectRatio: '4/3', position: 'relative' }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => openLightbox(i)}
                >
                  <img
                    src={img.thumbnail_url || img.image_url}
                    alt={img.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    padding: '2rem 1rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'end',
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{img.title}</span>
                    {img.category && <span className={`badge badge-${img.category === 'sports' ? 'sports' : 'cultural'}`} style={{ fontSize: '0.65rem' }}>{img.category}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <SignatureCTA to="/register" theme="primary" size="lg" icon={ArrowRight}>
              Be Part of COLORIDO 2K26 Moments
            </SignatureCTA>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && images[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
              zIndex: 'var(--z-modal)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={closeLightbox}
          >
            <button onClick={(e) => { e.stopPropagation(); closeLightbox() }}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'white', zIndex: 10 }}>
              <X size={28} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); navigate(-1) }}
              style={{ position: 'absolute', left: '1.5rem', color: 'white', zIndex: 10 }}>
              <ChevronLeft size={36} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); navigate(1) }}
              style={{ position: 'absolute', right: '1.5rem', color: 'white', zIndex: 10 }}>
              <ChevronRight size={36} />
            </button>
            <motion.img
              key={lightbox}
              src={images[lightbox].image_url}
              alt={images[lightbox].title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
              onClick={e => e.stopPropagation()}
            />
            <div style={{ position: 'absolute', bottom: '2rem', textAlign: 'center', color: 'white' }}>
              <p style={{ fontWeight: 600 }}>{images[lightbox].title}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{lightbox + 1} / {images.length}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
