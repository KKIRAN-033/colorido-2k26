import { Link } from 'react-router-dom'
import { Sparkles, Mail, MapPin } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer no-print">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <Sparkles size={18} />
              <span>COLORIDO</span>
              <span className="footer-logo-year">2K26</span>
            </Link>
            <p className="footer-tagline">
              National-Level Cultural & Sports Event.
              Culture × Sports × Creativity.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-links-col">
              <h4>Explore</h4>
              <Link to="/cultural">Cultural Events</Link>
              <Link to="/sports">Sports Events</Link>
              <Link to="/schedule">Schedule</Link>
              <Link to="/gallery">Gallery</Link>
            </div>

            <div className="footer-links-col">
              <h4>Quick Links</h4>
              <Link to="/register">Register</Link>
              <Link to="/announcements">Announcements</Link>
              <Link to="/results">Results</Link>
              <Link to="/sponsors">Sponsors</Link>
            </div>

            <div className="footer-links-col">
              <h4>Connect</h4>
              <Link to="/contact">Contact Us</Link>
              <Link to="/about">About</Link>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p className="footer-copyright">© 2026 COLORIDO 2K26. All rights reserved.</p>
          <p className="footer-made-with">
            Built with passion for Culture, Sports & Creativity
          </p>
        </div>
      </div>
    </footer>
  )
}
