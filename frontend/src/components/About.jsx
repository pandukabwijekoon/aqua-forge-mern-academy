import React from 'react';
import { Award, ShieldCheck, MapPin, Target } from 'lucide-react';

export const About = () => {
  return (
    <section id="about" style={{
      padding: '6rem 2rem',
      backgroundColor: '#070a13', // Deep luxury dark
      borderTop: '1px solid rgba(0, 242, 254, 0.04)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative radial glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '300px',
        height: '300px',
        background: 'rgba(0, 242, 254, 0.03)',
        filter: 'blur(80px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-10%',
        width: '350px',
        height: '350px',
        background: 'rgba(0, 255, 210, 0.03)',
        filter: 'blur(90px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#00ffd2',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            AQUATIC PRECISION & STEWARDSHIP
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '0.02em',
            lineHeight: 1.2
          }}>
            FORGING THE FUTURE OF <span className="gradient-text">HIGH-PERFORMANCE</span>
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            maxWidth: '650px',
            margin: '1.25rem auto 0 auto',
            fontSize: '0.95rem',
            lineHeight: 1.6
          }}>
            Aqua Forge is not just a school—it is a specialized laboratory for technical refinement, private lane focus, and collegiate speed conditioning.
          </p>
        </div>

        {/* Pillars Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* Card 1: Collegiate Pedigree */}
          <div 
            className="glass-panel"
            style={{
              padding: '2.5rem 2rem',
              background: 'rgba(12, 16, 32, 0.35)',
              border: '1px solid rgba(0, 242, 254, 0.1)',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.4)';
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 242, 254, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.1)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(0, 242, 254, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 242, 254, 0.2)',
              color: '#00f2fe'
            }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Collegiate Pedigree
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Guided exclusively by collegiate A-Squad champions and Stingrays Swimming Academy certified coaches. We bring elite competition racing strategies and athletic drills directly to your lane.
            </p>
          </div>

          {/* Card 2: Regency Pool Facilities */}
          <div 
            className="glass-panel"
            style={{
              padding: '2.5rem 2rem',
              background: 'rgba(12, 16, 32, 0.35)',
              border: '1px solid rgba(0, 255, 210, 0.1)',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 255, 210, 0.4)';
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 255, 210, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 255, 210, 0.1)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(0, 255, 210, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 255, 210, 0.2)',
              color: '#00ffd2'
            }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Regency Pool Facilities
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Enjoy uninterrupted, crystal-clear lanes. All private sessions are hosted inside the premium, highly regulated heated pool at the luxury **Capital Regency Hotel, Kandy**, securing premium focus.
            </p>
          </div>

          {/* Card 3: Advanced Hydrodynamics */}
          <div 
            className="glass-panel"
            style={{
              padding: '2.5rem 2rem',
              background: 'rgba(12, 16, 32, 0.35)',
              border: '1px solid rgba(0, 242, 254, 0.1)',
              borderRadius: '20px',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.4)';
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 242, 254, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.1)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(0, 242, 254, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 242, 254, 0.2)',
              color: '#00f2fe'
            }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Advanced Hydrodynamics
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Specialized coaching focusing on streamline alignment, technical stroke refinement, rotation check, hand entry optimization, and power conditioning to build your ultimate speed edge.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
