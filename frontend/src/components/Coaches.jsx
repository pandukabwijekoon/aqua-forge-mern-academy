import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { Star, Award, BadgeCheck, GraduationCap, Flame, MapPin, User } from 'lucide-react';

export const Coaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Image Index for Dilshan's Media Deck
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await api.coaches.getAll();
        if (res.success) {
          setCoaches(res.coaches);
        } else {
          setError('Failed to fetch coach roster.');
        }
      } catch (err) {
        console.error('Error loading coaches:', err);
        setError(err.message || 'Server error loading coach staff.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<Star key={i} size={18} fill="#00ffd2" color="#00ffd2" style={{ marginRight: '3px' }} />);
    }
    return stars;
  };

  const coach = coaches[0]; // Dilshan is the sole head instructor

  // Labeled media assets matching your files in frontend/public/coaches/
  const coachMedia = [
    { url: "/coaches/professional.png", label: "Elite Head Coach", desc: "Founder & Head Instructor" },
    { url: "/coaches/hi.jpeg", label: "A-Squad Swimmer", desc: "High-performance competitive swimming" },
    { url: "/coaches/hi 2.jpeg", label: "Stingrays Instructor", desc: "Academy & Capital Regency coaching" }
  ];

  // Helper to dynamically render a matching icon next to the media label
  const renderMediaIcon = (idx) => {
    switch (idx) {
      case 0:
        return <User size={14} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 242, 254, 0.4))' }} />;
      case 1:
        return <Flame size={14} color="#00ffd2" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 255, 210, 0.4))' }} />;
      case 2:
        return <Award size={14} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 3px rgba(0, 242, 254, 0.4))' }} />;
      default:
        return <User size={14} />;
    }
  };

  return (
    <section id="coaches" style={{
      padding: '8rem 2rem 4rem 2rem',
      backgroundColor: '#070a13',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: '#00ffd2',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          ELITE FOUNDER & HEAD INSTRUCTOR
        </div>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800,
          textTransform: 'uppercase',
        }}>
          MEET YOUR <span className="gradient-text">ELITE INSTRUCTOR</span>
        </h2>
        <p style={{
          color: 'var(--text-muted)',
          maxWidth: '550px',
          margin: '1.25rem auto 0 auto',
          fontSize: '1rem',
        }}>
          Aqua Forge is led exclusively by Coach Dilshan Tennakoon, bringing elite collegiate competition and professional coaching experience directly to your lane.
        </p>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '350px',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 242, 254, 0.1)',
            borderTopColor: '#00f2fe',
            borderRadius: '50%',
            animation: 'wave 1s infinite linear',
          }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>Synchronizing Coach Telemetry...</span>
        </div>
      ) : error || !coach ? (
        <div className="glass-panel" style={{
          padding: '2.5rem',
          textAlign: 'center',
          borderColor: 'rgba(255, 107, 107, 0.2)',
          color: '#ff6b6b'
        }}>
          <p>{error || 'No coach profiles loaded.'}</p>
        </div>
      ) : (
        /* PREMIUM SPLIT SCREEN PORTRAIT DISPLAY */
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: '4rem',
          flexWrap: 'wrap',
        }}>
          {/* LEFT SIDE: GLOWING COACH PORTRAIT CARD & MEDIA THUMBNAILS */}
          <div style={{
            flex: '1 1 420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {/* MAIN IMAGE VIEWPORT */}
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              height: '460px',
              boxShadow: '0 15px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,242,254,0.08)',
              border: '2px solid rgba(0, 242, 254, 0.2)',
              transition: 'var(--transition-smooth)',
              background: '#070a13',
            }}
            className="glass-panel"
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 255, 210, 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.2)'}
            >
              <img 
                src={coachMedia[activeImgIdx].url} 
                alt={coachMedia[activeImgIdx].label} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
              {/* Visual gradient filter overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(7, 10, 19, 0.95) 0%, rgba(7, 10, 19, 0.3) 50%, transparent 100%)',
                pointerEvents: 'none',
              }} />
              
              {/* Floating Experience Badge */}
              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                background: 'rgba(7, 10, 19, 0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(0, 255, 210, 0.3)',
                borderRadius: '50px',
                padding: '0.4rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#00ffd2',
                fontWeight: 700,
                fontSize: '0.8rem',
                boxShadow: '0 4px 15px rgba(0,255,210,0.2)',
              }}>
                {renderMediaIcon(activeImgIdx)}
                <span>{coachMedia[activeImgIdx].label.toUpperCase()}</span>
              </div>
            </div>

            {/* INTERACTIVE THUMBNAILS GRID */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
            }}>
              {coachMedia.map((media, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className="glass-panel"
                  style={{
                    borderRadius: '12px',
                    padding: '0.4rem',
                    cursor: 'pointer',
                    background: activeImgIdx === idx ? 'rgba(0, 242, 254, 0.08)' : 'rgba(12, 16, 32, 0.3)',
                    border: '1px solid',
                    borderColor: activeImgIdx === idx ? 'var(--accent-teal)' : 'rgba(255, 255, 255, 0.06)',
                    boxShadow: activeImgIdx === idx ? '0 0 15px rgba(0, 255, 210, 0.2)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseEnter={(e) => { if (activeImgIdx !== idx) e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.3)'; }}
                  onMouseLeave={(e) => { if (activeImgIdx !== idx) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)'; }}
                >
                  <div style={{ width: '100%', height: '50px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img 
                      src={media.url} 
                      alt={media.label} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div style={{ 
                    fontSize: '0.65rem', 
                    fontWeight: 700, 
                    color: activeImgIdx === idx ? '#00ffd2' : 'var(--text-muted)', 
                    textAlign: 'center', 
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    width: '100%'
                  }}>
                    {media.label.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: PROFILE INFO METADATA */}
          <div style={{
            flex: '1.2 1 450px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {/* Coach Title */}
            <h3 style={{
              fontSize: '2.5rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}>
              DILSHAN <span className="gradient-text">TENNAKOON</span>
            </h3>
            
            {/* Coach Badges / Ratings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {renderStars(coach.rating)}
                <span style={{ fontSize: '0.95rem', color: '#00ffd2', fontWeight: 800, marginLeft: '0.5rem' }}>
                  {coach.rating.toFixed(1)} OUT OF 5.0
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <MapPin size={16} color="#00f2fe" />
                <span>Kandy, Sri Lanka</span>
              </div>
            </div>

            {/* Coach Detailed Bio */}
            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted)',
              lineHeight: '1.65',
              marginBottom: '2rem',
            }}>
              {coach.description}
            </p>

            {/* Specialization list */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: '#00f2fe', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <BadgeCheck size={16} /> Elite Specializations
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {coach.expertise.map((exp, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(0, 242, 254, 0.06)',
                    border: '1px solid rgba(0, 242, 254, 0.18)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.85rem',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0, 242, 254, 0.05)',
                  }}>
                    {exp}
                  </span>
                ))}
              </div>
            </div>

            {/* Credentials / Certificates */}
            <div>
              <h4 style={{ 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: '#00ffd2', 
                letterSpacing: '0.1em', 
                textTransform: 'uppercase',
                marginBottom: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <GraduationCap size={16} /> Verified Credentials & Roles
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {coach.certificates.map((cert, idx) => (
                  <div key={idx} style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                  }}>
                    <Award size={16} color="#00ffd2" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Coaches;
