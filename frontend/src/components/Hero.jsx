import React, { useState } from 'react';
import { ShieldCheck, Award, Users, ChevronDown } from 'lucide-react';

export const Hero = ({ onScrollToSection }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <header style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
      background: 'radial-gradient(circle at center, #0d2035 0%, #070a13 100%)',
      padding: '140px 2rem 2.5rem 2rem', // 140px top padding ensures the fixed navbar NEVER overlaps with the content
    }}>
      {/* 1. Full-Bleed Cinematic Swimming Video Wrapper */}
      <video
        autoPlay
        loop
        muted
        playsInline
        onPlay={() => setVideoLoaded(true)}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          opacity: videoLoaded ? 0.35 : 0,
          transition: 'opacity 1.5s ease-in-out',
        }}
      >
        <source 
          src="/Aqua Forge.mp4" 
          type="video/mp4" 
        />
        {/* Secondary online fallbacks */}
        <source 
          src="https://assets.mixkit.co/videos/preview/mixkit-swimming-in-a-clear-pool-42512-large.mp4" 
          type="video/mp4" 
        />
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-man-swimming-underwater-in-pool-40092-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Modern Gradient & Vignette Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        background: 'linear-gradient(to bottom, rgba(7, 10, 19, 0.4) 0%, rgba(7, 10, 19, 0.8) 80%, #070a13 100%)',
        pointerEvents: 'none',
      }} />

      {/* Floating Canvas/Wave Fallback (Active when video is offline/loading) */}
      {!videoLoaded && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          opacity: 0.15,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200vw',
            height: '200vw',
            background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 60%)',
            animation: 'wave 25s infinite linear',
            borderRadius: '43%',
          }} />
        </div>
      )}

      {/* 2. Hero Headline Content in vertical centering flex space */}
      <div className="animate-fade-in" style={{
        position: 'relative',
        zIndex: 3,
        textAlign: 'center',
        maxWidth: '1000px',
        width: '100%',
        margin: 'auto 0', // Vertical centering
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem 0',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          padding: '0.4rem 1.2rem',
          borderRadius: '50px',
          color: '#00f2fe',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '1.5rem',
          boxShadow: '0 0 15px rgba(0, 242, 254, 0.1)',
        }}>
          <ShieldCheck size={14} />
          PREMIUM SWIMMING ACADEMY
        </div>

        <h1 style={{
          marginBottom: '1.5rem',
          lineHeight: '1.0',
        }}>
          <span className="hero-title-top" style={{
            fontSize: 'clamp(1.1rem, 3.2vw, 2.5rem)',
          }}>
            FORGE YOUR
          </span>
          <span className="hero-title-bottom gradient-text cinematic-glow" style={{
            fontSize: 'clamp(2.5rem, 6.2vw, 5.5rem)',
            marginTop: '0.25rem',
          }}>
            AQUATIC LEGACY
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(0.95rem, 1.8vw, 1.2rem)',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 2.5rem auto',
          fontWeight: 400,
          lineHeight: '1.6',
        }}>
          Precision private coaching by A-Squad swimmer and Stingrays Academy instructor Dilshan Tennakoon. Customized high-performance stroke dynamics engineered exclusively to build your hydrodynamic edge.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <button 
            className="btn-neon" 
            onClick={() => onScrollToSection('booking')}
          >
            Secure Session Space
          </button>
          <button 
            className="btn-outline" 
            onClick={() => onScrollToSection('coaches')}
          >
            Meet Head Coach
          </button>
        </div>
      </div>

      {/* 3. Floating Glassmorphism Cards Showcase in natural flow below the content */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        padding: '0',
        zIndex: 4,
        flexWrap: 'wrap',
        marginTop: '2rem',
        marginBottom: '2rem',
      }}>
        {/* Card 1 */}
        <div className="glass-panel floating-stat-card" style={{
          flex: '1 1 280px',
          maxWidth: '340px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          border: '1px solid rgba(0, 242, 254, 0.12)',
          background: 'rgba(12, 16, 32, 0.55)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2))',
            padding: '0.75rem',
            borderRadius: '12px',
            color: '#00f2fe',
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>6 LANES</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Olympic Standard Pool</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel floating-stat-card" style={{
          flex: '1 1 280px',
          maxWidth: '340px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          border: '1px solid rgba(0, 242, 254, 0.12)',
          background: 'rgba(12, 16, 32, 0.55)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 210, 0.2), rgba(79, 172, 254, 0.2))',
            padding: '0.75rem',
            borderRadius: '12px',
            color: '#00ffd2',
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>5.0 ★</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Elite Swimmer Rating</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel floating-stat-card" style={{
          flex: '1 1 280px',
          maxWidth: '340px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          border: '1px solid rgba(0, 242, 254, 0.12)',
          background: 'rgba(12, 16, 32, 0.55)',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 255, 210, 0.2))',
            padding: '0.75rem',
            borderRadius: '12px',
            color: '#00f2fe',
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}>100% SECURE</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anti-Double Booking Check</div>
          </div>
        </div>
      </div>

      {/* Down indicator in natural flex order */}
      <div 
        onClick={() => onScrollToSection('coaches')}
        style={{
          position: 'relative',
          zIndex: 4,
          color: 'var(--text-muted)',
          cursor: 'pointer',
          animation: 'float 3s infinite',
          marginTop: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ChevronDown size={28} />
      </div>
    </header>
  );
};

export default Hero;
