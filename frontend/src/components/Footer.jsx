import React from 'react';
import { Instagram, Youtube, Linkedin, ShieldCheck, CheckCircle2, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer({ onScrollToSection }) {
  return (
    <footer className="liquid-glass-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: '#090d16' }}>
      <div className="footer-grid-container">
        
        {/* Column 1: Brand & Socials */}
        <div className="footer-column">
          <h4 style={{ fontFamily: "'Syncopate', sans-serif", fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.12em', color: '#fff', textTransform: 'uppercase' }}>
            AQUA FORGE ACADEMY
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            Forging high-performance aquatic excellence. Empowering swimmers to achieve championship-level results.
          </p>
          <div className="footer-social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="YouTube">
              <Youtube size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Navigation */}
        <div className="footer-column">
          <span className="footer-col-title">QUICK PORTALS</span>
          <ul className="footer-links-list">
            <li>
              <button onClick={() => onScrollToSection('about')} className="footer-link-item">
                About Academy
              </button>
            </li>
            <li>
              <button onClick={() => onScrollToSection('booking')} className="footer-link-item">
                Training Programs
              </button>
            </li>
            <li>
              <button onClick={() => onScrollToSection('coaches')} className="footer-link-item">
                Meet Our Coaches
              </button>
            </li>
            <li>
              <button onClick={() => onScrollToSection('booking')} className="footer-link-item">
                Private Scheduler
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: System Integrity */}
        <div className="footer-column">
          <span className="footer-col-title">SYSTEM INTEGRITY</span>
          <ul className="footer-links-list" style={{ gap: '0.9rem' }}>
            <li className="footer-text-item">
              <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
              <span>100% Anti-Double Booking Guard</span>
            </li>
            <li className="footer-text-item">
              <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
              <span>Manual Transfer Verification Engine</span>
            </li>
            <li className="footer-text-item">
              <ShieldCheck size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
              <span>Secure Member Gateway Routing</span>
            </li>
            <li className="footer-text-item">
              <CheckCircle2 size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
              <span>Certified Training Standards</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Support */}
        <div className="footer-column">
          <span className="footer-col-title">REGISTRY COUNTER</span>
          <ul className="footer-links-list" style={{ gap: '0.9rem' }}>
            <li className="footer-text-item">
              <MapPin size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
              <span>Capital Regency Hotel Heated Pool, Kandy.</span>
            </li>
            <li className="footer-text-item">
              <Phone size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
              <span>+94 77 101 4046</span>
            </li>
            <li className="footer-text-item">
              <Mail size={16} style={{ color: 'var(--accent-cyan)', flexShrink: 0, marginTop: '0.15rem' }} />
              <a href="mailto:info@aquaforge.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                info@aquaforge.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Accent Bar & Branding */}
      <div className="footer-divider-line"></div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div>
          <p>© {new Date().getFullYear()} Aqua Forge. All rights reserved.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img 
            src="/panduka_studios.png" 
            alt="Panduka.W Studios" 
            style={{ 
              height: '24px', 
              mixBlendMode: 'screen',
              opacity: 0.7,
              filter: 'drop-shadow(0 0 6px rgba(0, 242, 254, 0.2))',
              objectFit: 'contain'
            }} 
          />
          <span>Developed by Panduka.W Studios</span>
        </div>
      </div>
    </footer>
  );
}
