import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Build optimized, luxury formatted WhatsApp chat message
    const formattedMsg = `Hi Coach Dilshan Tennakoon,\n\nI have a guest inquiry regarding Aqua Forge Swim Academy!\n\n📋 GUEST INQUIRER DETAILS:\n- Name: ${name}\n- Email: ${email}\n\n✉️ MESSAGE / INQUIRY:\n${message}`;
    const waUrl = `https://wa.me/94771014046?text=${encodeURIComponent(formattedMsg)}`;

    // Simulate premium transmission delay before opening WhatsApp
    setTimeout(() => {
      setStatus('success');
      
      // Open WhatsApp direct routing in a new secure tab
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      setName('');
      setEmail('');
      setMessage('');
      
      // Reset back to idle after a few seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" style={{
      padding: '6rem 2rem 8rem 2rem',
      backgroundColor: '#0c1020', // Matches Slate blue BookingSection background for smooth visual flow
      borderTop: '1px solid rgba(0, 242, 254, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background grid overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.02,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(var(--accent-cyan) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#00f2fe',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '1rem'
          }}>
            COMMUNICATION PORTAL
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3.5rem)',
            fontWeight: 800,
            textTransform: 'uppercase',
            fontFamily: "'Orbitron', sans-serif",
            letterSpacing: '0.02em',
            lineHeight: 1.2
          }}>
            CONNECT WITH <span className="gradient-text">OUR TEAM</span>
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            maxWidth: '650px',
            margin: '1.25rem auto 0 auto',
            fontSize: '0.95rem',
            lineHeight: 1.6
          }}>
            Have inquiries regarding premium swimmer packages, corporate bookings, or technical swimming dynamics? Reach out to our registry desk directly.
          </p>
        </div>

        {/* Split Screen Columns */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          gap: '4rem',
          flexWrap: 'wrap'
        }}>
          
          {/* COLUMN 1: DIRECT TELEMETRY COORDINATES */}
          <div style={{
            flex: '1 1 400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '2.5rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
              Registry Desk Coordinates
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Facility Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(0, 242, 254, 0.06)',
                  border: '1px solid rgba(0, 242, 254, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00f2fe',
                  flexShrink: 0
                }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Pool Location</h4>
                  <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, margin: 0 }}>
                    Capital Regency Hotel Heated Pool,<br />
                    Kandy, Sri Lanka.
                  </p>
                </div>
              </div>

              {/* Direct Telephone */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(0, 255, 210, 0.06)',
                  border: '1px solid rgba(0, 255, 210, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00ffd2',
                  flexShrink: 0
                }}>
                  <Phone size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Direct Line</h4>
                  <a 
                    href="tel:+94771014046"
                    style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, textDecoration: 'none', transition: 'var(--transition-smooth)' }}
                    onMouseEnter={(e) => e.target.style.color = '#00ffd2'}
                    onMouseLeave={(e) => e.target.style.color = '#fff'}
                  >
                    +94 77 101 4046
                  </a>
                </div>
              </div>

              {/* Email Address */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.25rem' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(0, 242, 254, 0.06)',
                  border: '1px solid rgba(0, 242, 254, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00f2fe',
                  flexShrink: 0
                }}>
                  <Mail size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Official Registry Email</h4>
                  <a 
                    href="mailto:info@aquaforge.com"
                    style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, textDecoration: 'none', transition: 'var(--transition-smooth)' }}
                    onMouseEnter={(e) => e.target.style.color = '#00f2fe'}
                    onMouseLeave={(e) => e.target.style.color = '#fff'}
                  >
                    info@aquaforge.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: PREMIUM INQUIRY FORM */}
          <div style={{
            flex: '1.2 1 450px'
          }}>
            <form onSubmit={handleSubmit} className="glass-panel" style={{
              padding: '2.5rem',
              background: 'rgba(7, 10, 19, 0.5)',
              border: '1px solid rgba(0, 242, 254, 0.15)',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              position: 'relative'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                ✉️ Send Guest Inquiry
              </h3>

              {status === 'success' && (
                <div style={{
                  background: 'rgba(0, 255, 210, 0.08)',
                  border: '1px solid rgba(0, 255, 210, 0.25)',
                  color: '#00ffd2',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  animation: 'fadeIn 0.4s ease-out forwards'
                }}>
                  <CheckCircle2 size={16} />
                  <span>🎉 Redirecting to secure WhatsApp channel to establish direct contact...</span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Full Swimmer / Parent Name</label>
                <input 
                  type="text" 
                  required 
                  disabled={status !== 'idle'}
                  className="input-neon" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Leo Tennakoon" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Address</label>
                <input 
                  type="email" 
                  required 
                  disabled={status !== 'idle'}
                  className="input-neon" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="swimmer@domain.com" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Your Message / Inquiries</label>
                <textarea 
                  required 
                  rows="4" 
                  disabled={status !== 'idle'}
                  className="input-neon" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Inquire about custom stroke mechanics package drills, private lane schedules, or group training bookings..." 
                />
              </div>

              <button
                type="submit"
                disabled={status !== 'idle'}
                className="btn-neon"
                style={{
                  marginTop: '0.5rem',
                  justifyContent: 'center',
                  background: status === 'success' 
                    ? 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)'
                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  boxShadow: status === 'success'
                    ? '0 4px 15px rgba(0, 230, 118, 0.3)'
                    : '0 4px 12px rgba(0, 242, 254, 0.25)',
                  transition: 'all 0.4s ease',
                  color: status === 'success' ? '#040814' : '#fff'
                }}
              >
                {status === 'idle' && (
                  <>
                    <Send size={14} /> Send Message
                  </>
                )}
                {status === 'submitting' && 'Transmitting Inquiry...'}
                {status === 'success' && (
                  <>
                    <CheckCircle2 size={14} /> Transmission Completed
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
