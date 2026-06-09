import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Calendar, User, Clock, ToggleLeft, ShieldAlert, Check, Image as ImageIcon, Send, ArrowRight } from 'lucide-react';

const TIME_SLOTS = [
  { id: '1', time: '06:30 AM - 08:00 AM', label: 'Sunrise Streamline' },
  { id: '2', time: '08:00 AM - 09:30 AM', label: 'Olympic Precision' },
  { id: '3', time: '10:00 AM - 11:30 AM', label: 'Endurance Intervals' },
  { id: '4', time: '03:30 PM - 05:00 PM', label: 'Twilight Power Drills' },
  { id: '5', time: '05:00 PM - 06:30 PM', label: 'Night Hydrodynamics' }
];

export const BookingSection = ({ onOpenAuth }) => {
  const { user } = useAuth();
  
  // Swimmer Relational Profiles & Wizard States
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [allowedSlots, setAllowedSlots] = useState(TIME_SLOTS.map(s => s.time));
  const [allowedLanes, setAllowedLanes] = useState([1, 2, 3, 4, 5, 6]);
  const [hasClickedStartBooking, setHasClickedStartBooking] = useState(false);

  // Profile Registration Form States
  const [swimmerType, setSwimmerType] = useState('Adult');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [medicalDeclarations, setMedicalDeclarations] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [profileError, setProfileError] = useState(null);
  
  // Selection States
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[1].time); // Default to 8:00 AM
  const [selectedLane, setSelectedLane] = useState(1);

  // Booking Matrix States
  const [activeBooking, setActiveBooking] = useState(null); // Initiated booking locked
  const [whatsappUrl, setWhatsappUrl] = useState('');
  
  // Upload States
  const [slipBase64, setSlipBase64] = useState('');
  const [slipName, setSlipName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Booking Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Dynamic Sri Lankan Rupee Pricing Tier Calculation
  const getCalculatedPrice = () => {
    if (!selectedProfile) return 4800; // standard default
    return selectedProfile.swimmerType === 'Child' ? 2800 : 4800;
  };

  const fetchProfiles = async () => {
    try {
      const res = await api.profiles.getAll();
      if (res.success) {
        setProfiles(res.profiles || []);
      }
    } catch (err) {
      console.error("Error loading profiles:", err);
    }
  };

  const handleSelectProfile = async (profile) => {
    try {
      setSelectedProfile(profile);
      // Fetch availability mapping and constraints from backend
      const res = await api.bookings.getSchedulerView(profile._id);
      if (res.success) {
        setAllowedSlots(res.allowedSlots || []);
        setAllowedLanes(res.allowedLanes || [1, 2, 3, 4, 5, 6]);
        
        // Auto-select first allowed slot if current slot is blocked
        if (res.allowedSlots && res.allowedSlots.length > 0 && !res.allowedSlots.includes(selectedTimeSlot)) {
          setSelectedTimeSlot(res.allowedSlots[0]);
        }
        
        // Auto-select lane 1 if current lane is blocked
        if (res.allowedLanes && res.allowedLanes.length > 0 && !res.allowedLanes.includes(Number(selectedLane))) {
          setSelectedLane(res.allowedLanes[0]);
        }
      }
    } catch (err) {
      console.error("Error loading scheduler parameters:", err);
      // Fallback defaults
      setAllowedSlots(TIME_SLOTS.map(s => s.time));
      setAllowedLanes([1, 2, 3, 4, 5, 6]);
    }
  };

  const handleRegisterProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    try {
      const payload = {
        swimmerType,
        fullName,
        age: Number(age),
        skillLevel,
        medicalDeclarations,
        guardianName: swimmerType === 'Child' ? guardianName : undefined,
        guardianContact: swimmerType === 'Child' ? guardianContact : undefined
      };
      
      const res = await api.profiles.register(payload);
      if (res.success) {
        await fetchProfiles();
        setShowRegisterForm(false);
        // Reset form
        setFullName('');
        setAge('');
        setMedicalDeclarations('');
        setGuardianName('');
        setGuardianContact('');
        
        handleSelectProfile(res.profile);
      }
    } catch (err) {
      setProfileError(err.message || "Failed to register swimmer profile.");
    }
  };

  // rolling days helper
  const getRollingDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        iso: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return days;
  };

  useEffect(() => {
    if (user) {
      fetchProfiles();
    } else {
      handleReset();
    }
  }, [user]);

  const handleBookingInitiate = async (e) => {
    e.preventDefault();
    setBookingMessage(null);
    setBookingError(null);

    // 1. Strict Authentication Block Check
    if (!user) {
      alert("⚠️ ACCESS DENIED\nYou must be a registered member of Aqua Forge to book a private swim session. We are redirecting you to our secure Swimmer Entry registry.");
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      // Find the sole seeder Coach (Coach Dilshan)
      const coachesRes = await api.coaches.getAll();
      if (!coachesRes.success || coachesRes.coaches.length === 0) {
        throw new Error("Coach Dilshan's profile is not populated. Please seed the database.");
      }
      
      const coachId = coachesRes.coaches[0]._id;

      const payload = {
        coachId,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        lane: Number(selectedLane),
        swimmerProfileId: selectedProfile?._id,
        priceLKR: getCalculatedPrice()
      };

      // Call API to lock the slot in Pending_Approval state
      const res = await api.bookings.initiate(payload);
      if (res.success) {
        setActiveBooking(res.booking);
        setWhatsappUrl(res.whatsappUrl);
        setBookingMessage('🔒 Lane & Timeslot reserved under Pending Approval! Account details loaded.');
      } else {
        throw new Error(res.message || 'Initiation failed.');
      }
    } catch (err) {
      console.error(err);
      setBookingError(err.message || 'Failed to initiate booking reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSlipChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSlipName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setSlipBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSlipUploadSubmit = async (e) => {
    e.preventDefault();
    if (!slipBase64) return;

    setIsUploading(true);
    setBookingMessage(null);
    setBookingError(null);

    try {
      const res = await api.bookings.uploadSlip(activeBooking._id, { slipImage: slipBase64 });
      if (res.success) {
        setUploadSuccess(true);
        setBookingMessage('📤 Bank deposit slip uploaded successfully! Redirect to WhatsApp to notify Coach Dilshan.');
      } else {
        throw new Error(res.message || 'Upload failed.');
      }
    } catch (err) {
      console.error(err);
      setBookingError(err.message || 'Failed to save transaction slip.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setActiveBooking(null);
    setWhatsappUrl('');
    setSlipBase64('');
    setSlipName('');
    setUploadSuccess(false);
    setBookingMessage(null);
    setBookingError(null);
    setSelectedProfile(null);
    setShowRegisterForm(false);
    setHasClickedStartBooking(false);
  };

  if (!user) {
    return (
      <section id="booking" style={{
        padding: '6rem 2rem 8rem 2rem',
        backgroundColor: '#0c1020',
        borderTop: '1px solid rgba(0, 242, 254, 0.05)',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.02,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(var(--accent-cyan) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />

        <div className="glass-panel" style={{
          maxWidth: '750px',
          width: '100%',
          padding: '4rem 3rem',
          textAlign: 'center',
          border: '1px solid rgba(0, 242, 254, 0.15)',
          background: 'rgba(7, 10, 19, 0.75)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 242, 254, 0.08)',
          borderRadius: '24px',
          position: 'relative',
          zIndex: 1,
          animation: 'fadeIn 0.6s ease-out forwards',
        }}>
          {/* Exclusivity Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(0, 242, 254, 0.08)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            padding: '0.3rem 1rem',
            borderRadius: '50px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#00f2fe',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '1.5rem'
          }}>
            🔒 EXCLUSIVE MEMBER ACCESS
          </div>

          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            textTransform: 'uppercase',
            lineHeight: 1.2,
            marginBottom: '1rem',
            color: '#fff'
          }}>
            PRIVATE <span className="gradient-text">TRAINING SCHEDULER</span>
          </h2>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.6,
            maxWidth: '580px',
            margin: '0 auto 2.5rem auto'
          }}>
            Aqua Forge lane allocations, personal trainer time-slots, and real-time scheduling telemetry are locked behind swimmer registration. Sign up or log in to secure your private session with Coach Dilshan.
          </p>

          <button 
            onClick={onOpenAuth}
            className="btn-neon"
            style={{
              fontSize: '0.9rem',
              padding: '0.9rem 2.5rem',
              boxShadow: '0 6px 20px rgba(0, 242, 254, 0.3)',
            }}
          >
            Sign Up for Session
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" style={{
      padding: '4rem 2rem 8rem 2rem',
      backgroundColor: '#0c1020', // Slate blue background
      borderTop: '1px solid rgba(0, 242, 254, 0.05)',
      position: 'relative',
    }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        pointerEvents: 'none',
        backgroundImage: 'radial-gradient(var(--accent-cyan) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {!selectedProfile ? (
          /* ==========================================================================
             PROGRESSIVE ENTRY GATEWAY: WELCOME CARD BEFORE PROFILE WIZARD
             ========================================================================== */
          !hasClickedStartBooking ? (
            <div style={{
              animation: 'fadeIn 0.6s ease-out forwards',
              maxWidth: '750px',
              width: '100%',
              padding: '4rem 3rem',
              textAlign: 'center',
              border: '1px solid rgba(0, 242, 254, 0.15)',
              background: 'rgba(7, 10, 19, 0.75)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 242, 254, 0.08)',
              borderRadius: '24px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 1,
            }}>
              {/* Exclusivity Tag */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                padding: '0.3rem 1rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: '#00f2fe',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1.5rem'
              }}>
                🔑 MEMBER ZONE ACCESS
              </div>

              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                fontWeight: 800,
                textTransform: 'uppercase',
                lineHeight: 1.2,
                marginBottom: '1rem',
                color: '#fff'
              }}>
                PRIVATE <span className="gradient-text">TRAINING SCHEDULER</span>
              </h2>

              <p style={{
                color: 'var(--text-muted)',
                fontSize: '1rem',
                lineHeight: 1.6,
                maxWidth: '580px',
                margin: '0 auto 2.5rem auto'
              }}>
                Welcome back, {user?.name || 'Swimmer Member'}! You are fully authorized to schedule sessions. Choose or register a swimmer profile to allocate private pool lanes and synchronize timeslots with Coach Dilshan.
              </p>

              <button 
                onClick={() => setHasClickedStartBooking(true)}
                className="btn-neon"
                style={{
                  fontSize: '0.9rem',
                  padding: '0.9rem 2.5rem',
                  boxShadow: '0 6px 20px rgba(0, 242, 254, 0.3)',
                }}
              >
                {profiles.length > 0 ? 'Select Swimmer & Book' : 'Register Swimmer & Book'}
              </button>
            </div>
          ) : (
            <div style={{ animation: 'fadeIn 0.6s ease-out forwards', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  AQUA FORGE ENTRY GATEWAY
                </div>
                <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
                  {showRegisterForm ? 'REGISTER NEW' : 'SELECT ACTIVE'} <span className="gradient-text">SWIMMER PROFILE</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
                  {showRegisterForm 
                    ? 'Input athlete telemetry and required details. Guardian tracking parameters will automatically activate for dependent children.' 
                    : 'Choose which athlete profile will be occupying the private training lanes for the Kandy Seylan booking matrix.'}
                </p>
              </div>

            {showRegisterForm ? (
              /* REGISTRATION WIZARD FORM */
              <form onSubmit={handleRegisterProfile} className="glass-panel" style={{
                padding: '2.5rem',
                background: 'rgba(7, 10, 19, 0.7)',
                border: '1px solid rgba(0, 242, 254, 0.15)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                borderRadius: '24px',
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textTransform: 'uppercase', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                  📝 Athlete Registration Details
                </h3>

                {profileError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    ⚠️ {profileError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Swimmer Full Name</label>
                    <input type="text" required className="input-neon" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Leo Tennakoon" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Swimmer Age</label>
                    <input 
                      type="number" 
                      required 
                      min="1" 
                      max="120" 
                      className="input-neon" 
                      value={age} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setAge(val);
                        if (val !== '') {
                          const parsedAge = Number(val);
                          if (parsedAge < 18) {
                            setSwimmerType('Child');
                          } else {
                            setSwimmerType('Adult');
                          }
                        }
                      }} 
                      placeholder="e.g. 12" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Swimmer Type</label>
                    <select 
                      className="input-neon" 
                      style={{ backgroundColor: '#070a13' }} 
                      value={swimmerType} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSwimmerType(val);
                        // If they select Child but entered age is 18+, clear age or adjust for child safety compliance
                        if (val === 'Child' && age && Number(age) >= 18) {
                          setAge(''); // force re-entry or sync
                        }
                        // If they select Adult but entered age is < 18, reset age
                        if (val === 'Adult' && age && Number(age) < 18) {
                          setAge('');
                        }
                      }}
                    >
                      <option value="Adult">Adult Swimmer (Package: Rs. 4,800/= LKR)</option>
                      <option value="Child">Child Swimmer (Package: Rs. 2,800/= LKR)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Skill Level</label>
                    <select className="input-neon" style={{ backgroundColor: '#070a13' }} value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
                      <option value="Beginner">Beginner (Custom Stroke Refinement)</option>
                      <option value="Intermediate">Intermediate (Speed & Endurance Prep)</option>
                      <option value="Elite">Elite (Kingswood A-Squad / Stingrays Prep)</option>
                    </select>
                  </div>
                </div>

                {/* DYNAMIC LIVE PACKAGE RECOGNITION CARD */}
                <div style={{
                  background: swimmerType === 'Child' 
                    ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(7, 10, 19, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(7, 10, 19, 0.8) 100%)',
                  border: swimmerType === 'Child'
                    ? '1px solid rgba(236, 72, 153, 0.3)'
                    : '1px solid rgba(0, 242, 254, 0.3)',
                  boxShadow: swimmerType === 'Child'
                    ? '0 8px 32px 0 rgba(236, 72, 153, 0.15), 0 0 15px rgba(236, 72, 153, 0.05)'
                    : '0 8px 32px 0 rgba(0, 242, 254, 0.15), 0 0 15px rgba(0, 242, 254, 0.05)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Highlight decorative background glow */}
                  <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '180px',
                    height: '180px',
                    background: swimmerType === 'Child' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0, 242, 254, 0.15)',
                    filter: 'blur(40px)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                  }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: swimmerType === 'Child' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0, 242, 254, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: swimmerType === 'Child' ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid rgba(0, 242, 254, 0.3)',
                      color: swimmerType === 'Child' ? '#f472b6' : '#00f2fe',
                      fontSize: '1.5rem'
                    }}>
                      {swimmerType === 'Child' ? '👶' : '🏊'}
                    </div>
                    <div>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: swimmerType === 'Child' ? '#f472b6' : '#00f2fe',
                      }}>
                        ✨ Recognized Package Tier
                      </span>
                      <h4 style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#fff',
                        margin: '0.1rem 0 0.25rem 0'
                      }}>
                        {swimmerType === 'Child' ? 'Junior Private Swim Training' : 'Adult Private Swim Training'}
                      </h4>
                      <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        margin: 0,
                        maxWidth: '380px',
                        lineHeight: 1.4
                      }}>
                        {swimmerType === 'Child' 
                          ? 'Flat rate for child sessions. Restricted to shallow lanes and daylight hours for advanced safety monitoring.'
                          : 'Standard rate for adult sessions. Grants access to all lanes and night training schedules.'
                        }
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', zIndex: 1 }}>
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      letterSpacing: '0.05em'
                    }}>
                      Package Price:
                    </span>
                    <div style={{
                      fontSize: '1.75rem',
                      fontWeight: 900,
                      color: swimmerType === 'Child' ? '#f472b6' : '#00ffd2',
                      fontFamily: "'Outfit', sans-serif",
                      lineHeight: 1.1
                    }}>
                      Rs. {swimmerType === 'Child' ? '2,800/=' : '4,800/='}
                    </div>
                    <span style={{
                      fontSize: '0.65rem',
                      color: 'var(--text-muted)',
                      fontWeight: 600
                    }}>
                      Sri Lankan Rupees (LKR)
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Medical Declarations & Allergies (Optional)</label>
                  <textarea className="input-neon" rows="2" value={medicalDeclarations} onChange={(e) => setMedicalDeclarations(e.target.value)} placeholder="e.g. Mild asthma, no cardiovascular risks" />
                </div>

                {/* ADAPTIVE GUARDIAN INPUT MATRIX */}
                {(swimmerType === 'Child' || (age && Number(age) < 18)) && (
                  <div style={{
                    background: 'rgba(0, 242, 254, 0.03)',
                    border: '1px solid rgba(0, 242, 254, 0.18)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '2rem',
                    animation: 'fadeIn 0.4s ease-out forwards',
                  }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                      🔒 MANDATORY CHILD SAFETY TELEMETRY
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Parent/Guardian Full Name</label>
                        <input type="text" required className="input-neon" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="e.g. Dilshan Tennakoon Senior" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Guardian Emergency Contact</label>
                        <input type="text" required className="input-neon" value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)} placeholder="e.g. +94 77 101 4046" />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setShowRegisterForm(false)} className="btn-outline" style={{ fontSize: '0.85rem', padding: '0.7rem 1.5rem' }}>Cancel</button>
                  <button type="submit" className="btn-neon" style={{ fontSize: '0.85rem', padding: '0.7rem 2rem' }}>Register Swimmer Profile</button>
                </div>
              </form>
            ) : (
              /* CARD DECK SELECTOR VIEW */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {/* Default/Existing Profiles Loop */}
                  {profiles.map((prof) => (
                    <div 
                      key={prof._id} 
                      className="glass-panel" 
                      onClick={() => handleSelectProfile(prof)}
                      style={{
                        padding: '1.75rem',
                        cursor: 'pointer',
                        background: 'rgba(7, 10, 19, 0.45)',
                        border: '1px solid rgba(0, 242, 254, 0.1)',
                        borderRadius: '16px',
                        transition: 'var(--transition-smooth)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '240px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.4)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 242, 254, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.1)';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        {/* Profile Header info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: prof.swimmerType === 'Child' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(0, 242, 254, 0.1)',
                            color: prof.swimmerType === 'Child' ? '#f472b6' : '#00f2fe',
                            border: prof.swimmerType === 'Child' ? '1px solid rgba(236, 72, 153, 0.2)' : '1px solid rgba(0, 242, 254, 0.2)',
                          }}>
                            {prof.swimmerType}
                          </span>
                          
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            background: prof.skillLevel === 'Elite' ? 'rgba(245, 158, 11, 0.1)' : prof.skillLevel === 'Intermediate' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: prof.skillLevel === 'Elite' ? '#f59e0b' : prof.skillLevel === 'Intermediate' ? '#60a5fa' : '#34d399',
                          }}>
                            {prof.skillLevel}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>{prof.fullName}</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Age: <strong style={{ color: '#fff' }}>{prof.age}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Package: <strong style={{ color: '#00ffd2' }}>{prof.swimmerType === 'Child' ? 'Rs. 2,800/=' : 'Rs. 4,800/='} LKR</strong>
                        </div>
                        {prof.medicalDeclarations && (
                          <div style={{ fontSize: '0.7rem', color: '#fca5a5', marginTop: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            ⚕️ Medical Alert: {prof.medicalDeclarations}
                          </div>
                        )}
                      </div>

                      <button className="btn-outline" style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center', padding: '0.5rem' }}>
                        Activate Profile →
                      </button>
                    </div>
                  ))}

                  {/* Add New Profile Glass Card */}
                  <div 
                    onClick={() => setShowRegisterForm(true)}
                    className="glass-panel"
                    style={{
                      padding: '1.75rem',
                      cursor: 'pointer',
                      background: 'rgba(0, 242, 254, 0.02)',
                      border: '2px dashed rgba(0, 242, 254, 0.2)',
                      borderRadius: '16px',
                      transition: 'var(--transition-smooth)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '240px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                      e.currentTarget.style.background = 'rgba(0, 242, 254, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.2)';
                      e.currentTarget.style.background = 'rgba(0, 242, 254, 0.02)';
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', color: '#00f2fe', marginBottom: '1rem', opacity: 0.8 }}>＋</div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Swimmer</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'center', padding: '0 1rem' }}>
                      Register a dependent adult or child swimmer profile.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
         )
        ) : (
          /* ==========================================================================
             SCHEDULER INTERFACE VIEW (RENDERS WHEN SWIMMER PROFILE IS SELECTED)
             ========================================================================== */
          <>
            {/* Swimmer Profile Metadata Banner */}
            <div className="glass-panel" style={{
              padding: '1rem 2rem',
              background: 'rgba(7, 10, 19, 0.65)',
              border: '1px solid rgba(0, 242, 254, 0.18)',
              borderRadius: '50px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '3rem',
              boxShadow: '0 0 25px rgba(0, 242, 254, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🏊</span>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Active Swimmer Profile:</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                    {selectedProfile.fullName}
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      marginLeft: '0.5rem',
                      background: selectedProfile.swimmerType === 'Child' ? 'rgba(236, 72, 153, 0.12)' : 'rgba(0, 242, 254, 0.12)',
                      color: selectedProfile.swimmerType === 'Child' ? '#f472b6' : '#00f2fe',
                    }}>{selectedProfile.swimmerType}</span>

                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      marginLeft: '0.4rem',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-muted)',
                    }}>{selectedProfile.skillLevel}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleReset} 
                className="btn-outline" 
                style={{ fontSize: '0.75rem', padding: '0.4rem 1.2rem' }}
              >
                Change Member
              </button>
            </div>
            
            {/* Scheduler Board */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
            }}>
              {/* LEFT COLUMN: PARAMETER SELECTION */}
              <div className="glass-panel" style={{
                padding: '2.5rem',
                background: 'rgba(7, 10, 19, 0.45)',
                border: '1px solid rgba(0, 242, 254, 0.08)',
                opacity: activeBooking ? 0.6 : 1,
                pointerEvents: activeBooking ? 'none' : 'auto',
                transition: 'var(--transition-smooth)'
              }}>
                <form onSubmit={handleBookingInitiate}>
                  {/* 1. Date Selector */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.85rem', 
                      color: 'var(--text-muted)', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '1rem'
                    }}>
                      <Calendar size={16} color="#00f2fe" /> 1. Select Training Date
                    </label>
                    
                    {/* 7-day Rolling picker */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      overflowX: 'auto', 
                      paddingBottom: '0.75rem',
                      marginBottom: '1rem',
                    }}>
                      {getRollingDays().map((day) => (
                        <div 
                          key={day.iso}
                          onClick={() => setSelectedDate(day.iso)}
                          style={{
                            flex: '0 0 65px',
                            padding: '0.75rem 0.5rem',
                            borderRadius: '10px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: selectedDate === day.iso ? 'linear-gradient(135deg, rgba(79,172,254,0.15), rgba(0,242,254,0.15))' : 'rgba(7,10,19,0.5)',
                            border: selectedDate === day.iso ? '1.5px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.06)',
                            boxShadow: selectedDate === day.iso ? '0 0 10px rgba(0,242,254,0.15)' : 'none',
                            transition: 'var(--transition-smooth)',
                          }}
                        >
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{day.dayName}</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.1rem 0', color: selectedDate === day.iso ? '#00f2fe' : '#fff' }}>{day.dayNum}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.month}</div>
                        </div>
                      ))}
                    </div>

                    {/* Calendar fallback */}
                    <input 
                      type="date" 
                      className="input-neon"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  {/* 2. Assigned Head Coach Badge (Locked for Dilshan) */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.85rem', 
                      color: 'var(--text-muted)', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.75rem'
                    }}>
                      <User size={16} color="#00f2fe" /> 2. Assigned Head Coach
                    </label>
                    
                    <div style={{
                      background: 'rgba(0, 242, 254, 0.04)',
                      border: '1px solid rgba(0, 242, 254, 0.22)',
                      color: '#fff',
                      padding: '0.9rem 1.2rem',
                      borderRadius: '10px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 0 12px rgba(0, 242, 254, 0.05)',
                    }}>
                      <span>Coach Dilshan Tennakoon</span>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        color: '#00ffd2', 
                        background: 'rgba(0, 255, 210, 0.1)', 
                        padding: '0.15rem 0.5rem', 
                        borderRadius: '4px',
                        fontWeight: 800,
                        letterSpacing: '0.05em'
                      }}>
                        ELITE 5.0 ★
                      </span>
                    </div>
                  </div>

                  {/* 3. Time Slot Selector */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.85rem', 
                      color: 'var(--text-muted)', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.75rem'
                    }}>
                      <Clock size={16} color="#00f2fe" /> 3. Select Time Block
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                      {TIME_SLOTS.map((slot) => {
                        const isSlotBlocked = !allowedSlots.includes(slot.time);
                        return (
                          <div
                            key={slot.id}
                            onClick={() => !isSlotBlocked && setSelectedTimeSlot(slot.time)}
                            style={{
                              padding: '0.75rem 1.2rem',
                              borderRadius: '10px',
                              cursor: isSlotBlocked ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              opacity: isSlotBlocked ? 0.35 : 1,
                              pointerEvents: isSlotBlocked ? 'none' : 'auto',
                              background: selectedTimeSlot === slot.time ? 'rgba(0, 242, 254, 0.08)' : 'rgba(7, 10, 19, 0.4)',
                              border: '1px solid',
                              borderColor: selectedTimeSlot === slot.time ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.06)',
                              transition: 'var(--transition-smooth)',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: selectedTimeSlot === slot.time ? '#00f2fe' : '#fff' }}>
                                {slot.time} {isSlotBlocked && <span style={{ fontSize: '0.65rem', color: '#f472b6', fontWeight: 800 }}>[🔒 RESTRICTED]</span>}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {isSlotBlocked ? 'Adult Swimmers-Only Block' : slot.label}
                              </div>
                            </div>
                            {selectedTimeSlot === slot.time && <Check size={16} color="#00f2fe" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: PAYMENT PROCESSOR / GRAPHICAL LANES */}
              <div className="glass-panel" style={{
                padding: '2.5rem',
                background: 'rgba(7, 10, 19, 0.45)',
                border: '1px solid rgba(0, 242, 254, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'var(--transition-smooth)'
              }}>
                {!activeBooking ? (
                  /* DYNAMIC STATE A: SCHEDULER PREPARATION (Default lanes selector) */
                  <>
                    <div>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        fontSize: '0.85rem', 
                        color: 'var(--text-muted)', 
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '1.25rem'
                      }}>
                        <ToggleLeft size={16} color="#00f2fe" /> 4. Allocate Pool Lane
                      </label>

                      {/* Pool Grid Visualizer */}
                      <div style={{
                        background: 'linear-gradient(180deg, #091223 0%, #040810 100%)',
                        border: '2px solid rgba(0, 242, 254, 0.2)',
                        borderRadius: '12px',
                        padding: '1rem',
                        boxShadow: 'inset 0 0 20px rgba(0,242,254,0.1)',
                        marginBottom: '2rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                          <span>STARTING BLOCK</span>
                          <span>6-LANE RACING GRID</span>
                          <span>FINISH TOUCHPAD</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {[1, 2, 3, 4, 5, 6].map((laneNum) => {
                            const isLaneBlocked = !allowedLanes.includes(laneNum);
                            return (
                              <div 
                                key={laneNum}
                                onClick={() => !isLaneBlocked && setSelectedLane(laneNum)}
                                style={{
                                  padding: '0.6rem 1rem',
                                  borderRadius: '6px',
                                  cursor: isLaneBlocked ? 'not-allowed' : 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  position: 'relative',
                                  opacity: isLaneBlocked ? 0.35 : 1,
                                  pointerEvents: isLaneBlocked ? 'none' : 'auto',
                                  background: selectedLane === laneNum ? 'linear-gradient(90deg, rgba(0, 242, 254, 0.15), rgba(0, 255, 210, 0.05))' : 'rgba(7, 10, 19, 0.35)',
                                  border: '1px solid',
                                  borderColor: selectedLane === laneNum ? 'var(--accent-teal)' : 'rgba(0, 242, 254, 0.08)',
                                  color: selectedLane === laneNum ? '#00ffd2' : 'var(--text-muted)',
                                  fontWeight: selectedLane === laneNum ? 700 : 500,
                                  fontSize: '0.8rem',
                                  transition: 'var(--transition-smooth)',
                                }}
                              >
                                {selectedLane === laneNum && (
                                  <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    width: '3px',
                                    height: '60%',
                                    background: '#00ffd2',
                                    borderRadius: '10px'
                                  }} />
                                )}
                                <span>LANE {laneNum} {isLaneBlocked && <span style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 800 }}>[🔒 DEEP WATER LOCK]</span>}</span>
                                <span style={{ fontSize: '0.7rem', opacity: selectedLane === laneNum ? 1 : 0.6 }}>
                                  {isLaneBlocked ? 'RESTRICTED' : selectedLane === laneNum ? '🎯 ALLOCATED' : 'AVAILABLE'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Reservation Summary */}
                    <div style={{
                      background: 'rgba(7, 10, 19, 0.8)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginTop: 'auto',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Swimmer Profile:</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{selectedProfile.fullName} ({selectedProfile.swimmerType})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        <span>Selected Slot:</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>{selectedDate} ({selectedTimeSlot.split(' ')[0]})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                        <span>Assigned Space:</span>
                        <span style={{ color: '#fff', fontWeight: 600 }}>Lane {selectedLane}</span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.9rem', color: '#00f2fe', fontWeight: 700 }}>SESSION PRICING</span>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', color: '#00ffd2', fontWeight: 900 }}>
                          Rs. {getCalculatedPrice().toLocaleString()}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        Exclusively recorded in Sri Lankan Rupees (LKR)
                      </div>
                    </div>

                    {/* Initiate action trigger */}
                    <button 
                      type="button"
                      className="btn-neon" 
                      onClick={handleBookingInitiate}
                      disabled={isSubmitting}
                      style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem' }}
                    >
                      {isSubmitting ? 'Securing Lane Space...' : 'Lock Session & Reserve Lane'}
                    </button>
                  </>
                ) : (
                  /* DYNAMIC STATE B: BANK PAYMENT & SLIP UPLOADER (Locked state) */
                  <div style={{
                    animation: 'fadeIn 0.5s ease-out forwards',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', color: '#00ffd2', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        🔒 RESERVATION LOCKED
                      </h3>
                      
                      {/* Bank Account Matrix */}
                      <div className="glass-panel" style={{
                        padding: '1.25rem',
                        background: 'rgba(7, 10, 19, 0.65)',
                        border: '1px solid rgba(0, 242, 254, 0.2)',
                        borderRadius: '12px',
                        fontSize: '0.82rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seylan Bank Deposit Slip Details:</div>
                        <div>Bank: <strong style={{ color: '#fff' }}>Seylan Bank PLC</strong></div>
                        <div>Branch: <strong style={{ color: '#fff' }}>Kandy Branch</strong></div>
                        <div>Account Name: <strong style={{ color: '#fff' }}>Dilshan Tennakoon Private Swim</strong></div>
                        <div>Account Number: <strong style={{ color: '#00f2fe', fontFamily: 'monospace', fontSize: '0.9rem' }}>0120-13840291-001</strong></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                          <span>Transfer Amount:</span>
                          <strong style={{ color: '#00ffd2', fontSize: '0.95rem' }}>Rs. {getCalculatedPrice().toLocaleString()} LKR</strong>
                        </div>
                      </div>

                      {/* Manual Slip Uploader Form */}
                      {!uploadSuccess ? (
                        <form onSubmit={handleSlipUploadSubmit}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                            Upload Bank Transfer Receipt (JPEG/PNG)
                          </label>
                          
                          <div style={{
                            border: '2px dashed rgba(0, 242, 254, 0.25)',
                            borderRadius: '12px',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            background: 'rgba(7,10,19,0.3)',
                            cursor: 'pointer',
                            position: 'relative',
                            marginBottom: '1rem',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-teal)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.25)'}
                          >
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleSlipChange}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                opacity: 0,
                                cursor: 'pointer'
                              }}
                            />
                            <ImageIcon size={32} color="#00f2fe" style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                              {slipName ? slipName : 'Drag or Click to Choose Slip'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Max file size 5MB</div>
                          </div>

                          {slipBase64 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                              <img 
                                src={slipBase64} 
                                alt="Receipt Preview" 
                                style={{ height: '70px', borderRadius: '6px', border: '1px solid rgba(0,255,210,0.3)' }} 
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={!slipBase64 || isUploading}
                            className="btn-neon"
                            style={{
                              width: '100%',
                              justifyContent: 'center',
                              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                              boxShadow: '0 4px 10px rgba(0, 242, 254, 0.25)',
                            }}
                          >
                            {isUploading ? 'Uploading Slip...' : 'Submit Transaction Receipt'}
                          </button>
                        </form>
                      ) : (
                        /* UPLOAD SUCCESS STATE - WHATSAPP LINK ACTIVATION */
                        <div style={{
                          textAlign: 'center',
                          background: 'rgba(0, 255, 210, 0.04)',
                          border: '1px solid rgba(0, 255, 210, 0.15)',
                          padding: '1.5rem',
                          borderRadius: '12px',
                          animation: 'fadeIn 0.4s ease-out forwards',
                          marginBottom: '1.5rem'
                        }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
                          <h4 style={{ color: '#00ffd2', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Receipt Received!</h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Coach Dilshan has been notified in your Swimmer Dashboard. Use WhatsApp routing below for instant lane activation!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer action buttons for locked panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                      {uploadSuccess && (
                        <a 
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-neon"
                          style={{
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)',
                            boxShadow: '0 4px 15px rgba(0, 230, 118, 0.3)',
                            textDecoration: 'none',
                            color: '#040814',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 800
                          }}
                        >
                          <Send size={16} /> Notify Coach Dilshan on WhatsApp
                        </a>
                      )}

                      <button
                        onClick={handleReset}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--text-muted)',
                          padding: '0.75rem',
                          borderRadius: '50px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'var(--transition-smooth)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      >
                        Reset & Schedule Another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Panels */}
            {bookingMessage && (
              <div style={{
                background: 'rgba(0, 255, 210, 0.08)',
                border: '1px solid rgba(0, 255, 210, 0.25)',
                color: '#00ffd2',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginTop: '1rem',
              }}>
                {bookingMessage}
              </div>
            )}
            
            {bookingError && (
              <div style={{
                background: 'rgba(255, 107, 107, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.25)',
                color: '#ff6b6b',
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <ShieldAlert size={16} />
                <span>{bookingError}</span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BookingSection;
