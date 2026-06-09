import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Waves, LogIn, LogOut, User as UserIcon, LayoutDashboard, Menu, X } from 'lucide-react';

const SwimmerIcon = ({ size = 26, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: 'drop-shadow(0 0 6px rgba(0, 242, 254, 0.7))',
      marginRight: '0.25rem',
      ...props.style
    }}
    {...props}
  >
    <defs>
      <linearGradient id="swimLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f2fe" />
        <stop offset="100%" stopColor="#00ffd2" />
      </linearGradient>
    </defs>
    {/* Hydrodynamic Streamlined Body (Crawl stroke) */}
    <path
      d="M2 14.5C4.5 13.5 7 13.5 9.5 12C11.5 10.8 13.5 9.2 16.5 8.8C18 8.6 19.2 9.2 20 10.2"
      stroke="url(#swimLogoGrad)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Recovery Arm arch stroke */}
    <path
      d="M8.5 11C10 8 12.5 5.5 15.5 5C17.5 4.7 18.5 5.8 19 7"
      stroke="url(#swimLogoGrad)"
      strokeWidth="2.0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Streamlined head */}
    <circle cx="17.5" cy="7.2" r="1.8" fill="url(#swimLogoGrad)" />
    {/* Wave crest 1 */}
    <path
      d="M1 18.5C3.5 19 6 18 8.5 17.5C11 17 13.5 18 16 18C18.5 18 21 17 23 16.5"
      stroke="#00ffd2"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Deep Wave crest 2 */}
    <path
      d="M3 21C5.5 21.3 8 20.5 10.5 20C13 19.5 15.5 20.2 18 20.2C20.5 20.2 22.5 19.5 23.5 19"
      stroke="#4facfe"
      strokeWidth="1.2"
      opacity="0.65"
      strokeLinecap="round"
    />
  </svg>
);

export const Navbar = ({ onOpenAuth, onScrollToSection, activeView, setActiveView }) => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    // Only run scroll spy on the main homepage
    if (activeView !== 'main') return;

    const sections = ['coaches', 'about', 'booking', 'contact'];

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null, // Viewport
      rootMargin: '-30% 0px -50% 0px', // Trigger when section occupies the middle part of the screen
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveSection('');
      }
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeView]);

  return (
    <>
      <nav className="liquid-glass-navbar">
        {/* Brand Logo */}
        <div 
          onClick={() => { 
            if (!user) {
              setActiveView('main'); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: user ? 'default' : 'pointer',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '0.05em',
          }}
        >
          <SwimmerIcon size={28} />
          <span>AQUA <span className="gradient-text">FORGE</span></span>
        </div>

        {/* Navigation Links (Desktop-only) */}
        <div 
          className="nav-desktop-links"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            fontSize: '0.95rem',
            fontWeight: 600,
          }}
        >
          {!user ? (
            <>
              <span 
                onClick={() => onScrollToSection('coaches')} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'coaches' ? '#00ffd2' : 'var(--text-muted)', 
                  fontWeight: activeSection === 'coaches' ? '700' : '600',
                  textShadow: activeSection === 'coaches' ? '0 0 10px rgba(0, 255, 210, 0.4)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderBottom: '2px solid',
                  borderColor: activeSection === 'coaches' ? '#00ffd2' : 'transparent',
                  paddingBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'coaches') e.target.style.color = '#00ffd2';
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'coaches') e.target.style.color = 'var(--text-muted)';
                }}
              >
                Head Coach
              </span>
              <span 
                onClick={() => onScrollToSection('about')} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'about' ? '#00f2fe' : 'var(--text-muted)', 
                  fontWeight: activeSection === 'about' ? '700' : '600',
                  textShadow: activeSection === 'about' ? '0 0 10px rgba(0, 242, 254, 0.4)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderBottom: '2px solid',
                  borderColor: activeSection === 'about' ? '#00f2fe' : 'transparent',
                  paddingBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'about') e.target.style.color = '#00f2fe';
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'about') e.target.style.color = 'var(--text-muted)';
                }}
              >
                About Us
              </span>
              <span 
                onClick={() => onScrollToSection('booking')} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'booking' ? '#00ffd2' : 'var(--text-muted)', 
                  fontWeight: activeSection === 'booking' ? '700' : '600',
                  textShadow: activeSection === 'booking' ? '0 0 10px rgba(0, 255, 210, 0.4)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderBottom: '2px solid',
                  borderColor: activeSection === 'booking' ? '#00ffd2' : 'transparent',
                  paddingBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'booking') e.target.style.color = '#00ffd2';
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'booking') e.target.style.color = 'var(--text-muted)';
                }}
              >
                Book Session
              </span>
              <span 
                onClick={() => onScrollToSection('contact')} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'contact' ? '#00f2fe' : 'var(--text-muted)', 
                  fontWeight: activeSection === 'contact' ? '700' : '600',
                  textShadow: activeSection === 'contact' ? '0 0 10px rgba(0, 242, 254, 0.4)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderBottom: '2px solid',
                  borderColor: activeSection === 'contact' ? '#00f2fe' : 'transparent',
                  paddingBottom: '4px'
                }}
                onMouseEnter={(e) => {
                  if (activeSection !== 'contact') e.target.style.color = '#00f2fe';
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== 'contact') e.target.style.color = 'var(--text-muted)';
                }}
              >
                Contact Us
              </span>
            </>
          ) : (user.role === 'coach' || user.role === 'admin') ? (
            <span 
              style={{ 
                color: '#00f2fe', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.85rem'
              }}
            >
              <Waves size={18} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 4px rgba(0,242,254,0.4))' }} />
              Coach Control Board
            </span>
          ) : (
            <span 
              style={{ 
                color: '#00ffd2', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.4rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.85rem'
              }}
            >
              <LayoutDashboard size={18} />
              Swimmer Member Portal
            </span>
          )}
        </div>

        {/* User Actions Panel (Desktop-only) */}
        <div className="nav-desktop-links" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(0, 242, 254, 0.08)',
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                border: '1px solid rgba(0, 242, 254, 0.15)',
              }}>
                <UserIcon size={16} color="#00ffd2" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>
              
              <button 
                onClick={() => {
                  logout();
                  setActiveView('main');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)',
                }}
                onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="btn-neon" 
              onClick={onOpenAuth}
              style={{
                padding: '0.5rem 1.4rem',
                fontSize: '0.8rem',
                boxShadow: '0 4px 10px rgba(0, 242, 254, 0.25)',
              }}
            >
              <LogIn size={14} />
              Login / Register
            </button>
          )}
        </div>

        {/* Mobile Menu Toggler Button */}
        <button 
          className="nav-mobile-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Dropdown Drawer Menu */}
      <div className={`nav-mobile-menu ${isMobileOpen ? 'open' : ''}`}>
        {/* Links stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!user ? (
            <>
              <span 
                onClick={() => { onScrollToSection('coaches'); setIsMobileOpen(false); }} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'coaches' ? '#00ffd2' : 'var(--text-muted)', 
                  fontSize: '1.05rem', 
                  fontWeight: activeSection === 'coaches' ? '700' : '600', 
                  textShadow: activeSection === 'coaches' ? '0 0 10px rgba(0, 255, 210, 0.3)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderLeft: '3px solid',
                  borderColor: activeSection === 'coaches' ? '#00ffd2' : 'transparent',
                  paddingLeft: '10px'
                }}
              >
                Head Coach
              </span>
              <span 
                onClick={() => { onScrollToSection('about'); setIsMobileOpen(false); }} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'about' ? '#00f2fe' : 'var(--text-muted)', 
                  fontSize: '1.05rem', 
                  fontWeight: activeSection === 'about' ? '700' : '600', 
                  textShadow: activeSection === 'about' ? '0 0 10px rgba(0, 242, 254, 0.3)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderLeft: '3px solid',
                  borderColor: activeSection === 'about' ? '#00f2fe' : 'transparent',
                  paddingLeft: '10px'
                }}
              >
                About Us
              </span>
              <span 
                onClick={() => { onScrollToSection('booking'); setIsMobileOpen(false); }} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'booking' ? '#00ffd2' : 'var(--text-muted)', 
                  fontSize: '1.05rem', 
                  fontWeight: activeSection === 'booking' ? '700' : '600', 
                  textShadow: activeSection === 'booking' ? '0 0 10px rgba(0, 255, 210, 0.3)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderLeft: '3px solid',
                  borderColor: activeSection === 'booking' ? '#00ffd2' : 'transparent',
                  paddingLeft: '10px'
                }}
              >
                Book Session
              </span>
              <span 
                onClick={() => { onScrollToSection('contact'); setIsMobileOpen(false); }} 
                style={{ 
                  cursor: 'pointer', 
                  color: activeSection === 'contact' ? '#00f2fe' : 'var(--text-muted)', 
                  fontSize: '1.05rem', 
                  fontWeight: activeSection === 'contact' ? '700' : '600', 
                  textShadow: activeSection === 'contact' ? '0 0 10px rgba(0, 242, 254, 0.3)' : 'none',
                  transition: 'var(--transition-smooth)',
                  borderLeft: '3px solid',
                  borderColor: activeSection === 'contact' ? '#00f2fe' : 'transparent',
                  paddingLeft: '10px'
                }}
              >
                Contact Us
              </span>
            </>
          ) : (user.role === 'coach' || user.role === 'admin') ? (
            <span style={{ color: '#00f2fe', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem' }}>
              <Waves size={18} color="#00f2fe" />
              Coach Control Board
            </span>
          ) : (
            <span style={{ color: '#00ffd2', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.05rem' }}>
              <LayoutDashboard size={18} />
              Swimmer Member Portal
            </span>
          )}
        </div>

        {/* Actions panel for Mobile */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(0, 242, 254, 0.08)',
                padding: '0.5rem 1.25rem',
                borderRadius: '20px',
                border: '1px solid rgba(0, 242, 254, 0.15)',
                width: 'fit-content'
              }}>
                <UserIcon size={16} color="#00ffd2" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </span>
              </div>
              
              <button 
                onClick={() => {
                  logout();
                  setIsMobileOpen(false);
                  setActiveView('main');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  background: 'rgba(255, 107, 107, 0.05)',
                  border: '1.5px solid rgba(255, 107, 107, 0.25)',
                  borderRadius: '50px',
                  color: '#ff6b6b',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  width: '100%',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <button 
              className="btn-neon" 
              onClick={() => { onOpenAuth(); setIsMobileOpen(false); }}
              style={{
                padding: '0.8rem 2rem',
                fontSize: '0.9rem',
                width: '100%',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0, 242, 254, 0.25)',
              }}
            >
              <LogIn size={16} />
              Login / Register
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
