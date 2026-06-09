import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { Activity, Clock, Navigation, AlertCircle, RefreshCw, XCircle, FileText, Heart, CheckCircle, Image as ImageIcon, Send } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  
  // Bookings list state
  const [bookings, setBookings] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Inline uploader states
  const [uploadingId, setUploadingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [failMsg, setFailMsg] = useState(null);

  // Parent / Guardian edit states
  const [isEditingParent, setIsEditingParent] = useState(false);
  const [editGuardianName, setEditGuardianName] = useState('');
  const [editGuardianContact, setEditGuardianContact] = useState('');
  const [updatingParent, setUpdatingParent] = useState(false);

  // Dynamic Chart Tab Selector state
  const [activeChartTab, setActiveChartTab] = useState('meters');

  const fetchBookings = async () => {
    try {
      const res = await api.bookings.getMyBookings();
      if (res.success) {
        setBookings(res.bookings);
      } else {
        setError('Failed to load reservation telemetry.');
      }
    } catch (err) {
      console.error('Error fetching dashboard bookings:', err);
      setError(err.message || 'Server error fetching bookings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const res = await api.profiles.getAll();
      if (res.success) {
        setProfiles(res.profiles || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard profiles:', err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchProfiles();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    setSuccessMsg(null);
    setFailMsg(null);
    
    if (!window.confirm("⚠️ CANCEL PRIVATE SESSION\nAre you sure you want to cancel this training session? This will release the lane and coach timeslot back to the public academy.")) {
      return;
    }

    try {
      const res = await api.bookings.cancel(bookingId);
      if (res.success) {
        setSuccessMsg('🚫 Private session cancelled successfully. Slot released.');
        // Refresh bookings and metrics in real-time
        fetchBookings();
      } else {
        throw new Error(res.message || 'Cancellation failed.');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      setFailMsg(err.message || 'Failed to cancel the booking slot.');
    }
  };

  const handleInlineUpload = async (e, bookingId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(bookingId);
    setSuccessMsg(null);
    setFailMsg(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await api.bookings.uploadSlip(bookingId, { slipImage: reader.result });
        if (res.success) {
          setSuccessMsg('📤 Bank receipt slip uploaded successfully! Review pending.');
          fetchBookings();
        } else {
          throw new Error(res.message || 'Upload failed.');
        }
      } catch (err) {
        console.error(err);
        setFailMsg(err.message || 'Failed to save transaction slip.');
      } finally {
        setUploadingId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveParentDetails = async (e) => {
    e.preventDefault();
    if (!activeProfile) return;
    
    setUpdatingParent(true);
    setSuccessMsg(null);
    setFailMsg(null);

    try {
      const res = await api.profiles.update(activeProfile._id, {
        guardianName: editGuardianName,
        guardianContact: editGuardianContact,
      });

      if (res.success) {
        setSuccessMsg('🛡️ Parent and Guardian emergency details updated successfully!');
        setIsEditingParent(false);
        await fetchProfiles();
      } else {
        throw new Error(res.message || 'Update failed.');
      }
    } catch (err) {
      console.error('Error updating parent details:', err);
      setFailMsg(err.message || 'Failed to update parent emergency coordinates.');
    } finally {
      setUpdatingParent(false);
    }
  };

  // 1. DYNAMIC TELEMETRY CALCULATIONS (Filtered by Selected Swimmer Profile)
  const filteredBookings = bookings.filter(b => {
    if (selectedProfileId === 'all') return true;
    return b.swimmerProfileId === selectedProfileId;
  });

  const confirmedBookings = filteredBookings.filter(b => b.status === 'Confirmed');
  
  // Active selected swimmer profile metadata
  const activeProfile = profiles.find(p => p._id === selectedProfileId);
  
  // Logged Lane-Hours: Each session is exactly 1.5 hours (90 minutes)
  const totalLaneHours = confirmedBookings.length * 1.5;
  
  // Dynamic calculation of Distance and Heart Rate based on Swimmer Type
  let totalDistanceMeters = 0;
  let totalHeartRatePoints = 0;
  let heartRateCount = 0;

  confirmedBookings.forEach(b => {
    if (b.swimmerType === 'Child') {
      totalDistanceMeters += 1200; // 1,200 meters volume for children
      totalHeartRatePoints += 155; // 155 BPM target for children
      heartRateCount++;
    } else {
      totalDistanceMeters += 2250; // 2,250 meters volume for adults
      totalHeartRatePoints += 142; // 142 BPM target for adults
      heartRateCount++;
    }
  });

  const heartRateAerobic = heartRateCount > 0 ? Math.round(totalHeartRatePoints / heartRateCount) : 0;

  // Dynamic Weekly Kinetics Chart calculations based on confirmed sessions (Module 5)
  const confirmedCount = confirmedBookings.length;
  const targetDistance = activeProfile && activeProfile.swimmerType === 'Child' ? 1200 : 2250;
  const targetBpm = activeProfile && activeProfile.swimmerType === 'Child' ? 155 : 142;

  const weeklyData = [
    { label: 'Session 1', val: confirmedCount >= 1 ? targetDistance : 0, bpm: confirmedCount >= 1 ? targetBpm : 0 },
    { label: 'Session 2', val: confirmedCount >= 2 ? targetDistance * 2 : 0, bpm: confirmedCount >= 2 ? Math.round(targetBpm * 1.05) : 0 },
    { label: 'Session 3', val: confirmedCount >= 3 ? targetDistance * 3 : 0, bpm: confirmedCount >= 3 ? Math.round(targetBpm * 0.98) : 0 },
    { label: 'Session 4', val: confirmedCount >= 4 ? targetDistance * 4 : 0, bpm: confirmedCount >= 4 ? Math.round(targetBpm * 1.02) : 0 }
  ];

  // Active trainer feedback notes derived from booked coaches
  const getTrainerFeedback = () => {
    if (confirmedBookings.length === 0) {
      return [
        {
          trainer: "Aqua Forge Registry",
          note: "Welcome to Aqua Forge! Secure your first private session slot to receive customized hydrodynamic training adjustments and speed telemetry."
        }
      ];
    }

    // Generate specific feedback notes for Dilshan
    return [
      {
        trainer: "Coach Dilshan Tennakoon",
        note: "Streamline rotation check—Focus on keeping your hips high in the water during your freestyle kick cycle. Work on driving force from your hips, and lock your core rotation during hand exit."
      }
    ];
  };

  // Status styling helpers
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Confirmed':
        return { background: 'rgba(0, 255, 210, 0.08)', border: '1px solid #00ffd2', color: '#00ffd2' };
      case 'Pending_Approval':
        return { background: 'rgba(0, 242, 254, 0.08)', border: '1px solid #00f2fe', color: '#00f2fe' };
      case 'Rejected':
        return { background: 'rgba(255, 107, 107, 0.08)', border: '1px solid #ff6b6b', color: '#ff6b6b' };
      default:
        return { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' };
    }
  };

  return (
    <section style={{
      padding: '8rem 2rem 6rem 2rem',
      backgroundColor: '#070a13',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '3rem',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#00ffd2', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              PERFORMANCE ANALYTICS
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              WELCOME BACK, <span className="gradient-text">{user?.name.toUpperCase()}</span>
            </h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Swimmer Profile Selector Dropdown */}
            {profiles.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Swimmer:</span>
                <select
                  value={selectedProfileId}
                  onChange={(e) => {
                    setSelectedProfileId(e.target.value);
                    setIsEditingParent(false);
                  }}
                  style={{
                    background: 'rgba(12, 16, 32, 0.75)',
                    border: '1px solid rgba(0, 242, 254, 0.25)',
                    borderRadius: '20px',
                    padding: '0.5rem 1.25rem',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(0, 242, 254, 0.1)',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.25)'; }}
                >
                  <option value="all">All Members (Family Overview)</option>
                  {profiles.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.fullName} ({p.swimmerType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button 
              onClick={() => { setLoading(true); fetchBookings(); }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50px',
                padding: '0.6rem 1.25rem',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#00f2fe'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              <RefreshCw size={14} /> Sync Telemetry
            </button>
          </div>
        </div>

        {/* Global Feedback messages */}
        {successMsg && (
          <div style={{
            background: 'rgba(0, 255, 210, 0.08)',
            border: '1px solid rgba(0, 255, 210, 0.25)',
            color: '#00ffd2',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        
        {failMsg && (
          <div style={{
            background: 'rgba(255, 107, 107, 0.08)',
            border: '1px solid rgba(255, 107, 107, 0.25)',
            color: '#ff6b6b',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{failMsg}</span>
          </div>
        )}

        {/* 1. SWIMMER TELEMETRY HUB */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          {/* Meter 1: Total Swim Distance */}
          <div className="glass-panel" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(12, 16, 32, 0.8) 0%, rgba(7, 10, 19, 0.6) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              opacity: 0.05,
              color: '#00f2fe',
            }}>
              <Navigation size={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00f2fe', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              <Navigation size={14} /> Target Volume
            </div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
              {totalDistanceMeters.toLocaleString()} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 500 }}>METERS</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Completed distance track derived from confirmed private workouts.
            </p>
          </div>

          {/* Meter 2: Logged Lane-Hours */}
          <div className="glass-panel" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(12, 16, 32, 0.8) 0%, rgba(7, 10, 19, 0.6) 100%)',
            border: '1px solid rgba(0, 255, 210, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              opacity: 0.05,
              color: '#00ffd2',
            }}>
              <Clock size={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00ffd2', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              <Clock size={14} /> Logged Space
            </div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
              {totalLaneHours.toFixed(1)} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 500 }}>HOURS</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cumulative private lane occupancy hours at Aqua Forge.
            </p>
          </div>

          {/* Meter 3: Heart Rate Target */}
          <div className="glass-panel" style={{
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(12, 16, 32, 0.8) 0%, rgba(7, 10, 19, 0.6) 100%)',
            border: '1px solid rgba(79, 172, 254, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              opacity: 0.05,
              color: '#4facfe',
            }}>
              <Heart size={120} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4facfe', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              <Heart size={14} /> Aerobic Pace
            </div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.25rem', fontFamily: "'Outfit', sans-serif" }}>
              {heartRateAerobic} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 500 }}>BPM</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Estimated steady heart rate conditioning target.
            </p>
          </div>
        </div>

        {/* Child Safety Emergency Guardian Tracking Bevel */}
        {selectedProfileId !== 'all' && activeProfile && activeProfile.swimmerType === 'Child' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(7, 10, 19, 0.8) 100%)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            boxShadow: '0 8px 32px 0 rgba(236, 72, 153, 0.15), 0 0 15px rgba(236, 72, 153, 0.05)',
            padding: '1.5rem 2rem',
            borderRadius: '16px',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeIn 0.4s ease-out forwards',
          }}>
            {/* Highlight decorative background glow */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '180px',
              height: '180px',
              background: 'rgba(236, 72, 153, 0.12)',
              filter: 'blur(40px)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(236, 72, 153, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                color: '#f472b6',
                fontSize: '1.5rem'
              }}>
                🛡️
              </div>
              <div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#f472b6',
                }}>
                  🔒 ACTIVE CHILD SAFETY TRACKING
                </span>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0.1rem 0 0.25rem 0'
                }}>
                  Emergency Parent & Guardian Details
                </h4>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  margin: 0,
                  maxWidth: '500px',
                  lineHeight: 1.4
                }}>
                  This athlete profile requires mandatory guardian contact telemetry in compliance with poolside safety enforcements.
                </p>
              </div>
            </div>

            {isEditingParent ? (
              <form 
                onSubmit={handleSaveParentDetails}
                style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end', zIndex: 1, width: '100%', marginTop: '1rem' }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: '#f472b6', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    Parent / Guardian Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editGuardianName}
                    onChange={(e) => setEditGuardianName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(7, 10, 19, 0.6)',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.8rem',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: '#f472b6', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    Emergency Safety Contact
                  </label>
                  <input
                    type="text"
                    required
                    value={editGuardianContact}
                    onChange={(e) => setEditGuardianContact(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(7, 10, 19, 0.6)',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.8rem',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingParent(false)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-muted)',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingParent}
                    style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)',
                    }}
                  >
                    {updatingParent ? 'Saving...' : 'Save Coordinates'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', zIndex: 1, alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Parent / Guardian Name:
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
                      {activeProfile.guardianName || 'Dilshan Tennakoon Senior'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Emergency Safety Contact:
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00ffd2', fontFamily: "'Outfit', sans-serif", marginTop: '0.15rem' }}>
                      {activeProfile.guardianContact || '+94 77 101 4046'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditGuardianName(activeProfile.guardianName || '');
                    setEditGuardianContact(activeProfile.guardianContact || '');
                    setIsEditingParent(true);
                  }}
                  style={{
                    background: 'rgba(236, 72, 153, 0.1)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    color: '#f472b6',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'; }}
                >
                  ✏️ Edit parent details
                </button>
              </div>
            )}
          </div>
        )}

        {/* Adult Swimmer Emergency Details Optional Bevel */}
        {selectedProfileId !== 'all' && activeProfile && activeProfile.swimmerType === 'Adult' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.04) 0%, rgba(7, 10, 19, 0.8) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.18)',
            boxShadow: '0 8px 32px 0 rgba(0, 242, 254, 0.08), 0 0 15px rgba(0, 242, 254, 0.02)',
            padding: '1.5rem 2rem',
            borderRadius: '16px',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeIn 0.4s ease-out forwards',
          }}>
            {/* Highlight decorative background glow */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '180px',
              height: '180px',
              background: 'rgba(0, 242, 254, 0.08)',
              filter: 'blur(40px)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(0, 242, 254, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 242, 254, 0.2)',
                color: '#00f2fe',
                fontSize: '1.5rem'
              }}>
                🛡️
              </div>
              <div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#00f2fe',
                }}>
                  🔒 EMERGENCY CONTACT DETAILS (OPTIONAL)
                </span>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#fff',
                  margin: '0.1rem 0 0.25rem 0'
                }}>
                  Emergency Contact & Guardian Coordinates
                </h4>
                <p style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  margin: 0,
                  maxWidth: '500px',
                  lineHeight: 1.4
                }}>
                  Keep emergency contacts updated on your swimmer profile for poolside safety compliance.
                </p>
              </div>
            </div>

            {isEditingParent ? (
              <form 
                onSubmit={handleSaveParentDetails}
                style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end', zIndex: 1, width: '100%', marginTop: '1rem' }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: '#00f2fe', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    Emergency Guardian Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editGuardianName}
                    onChange={(e) => setEditGuardianName(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(7, 10, 19, 0.6)',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.8rem',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: '#00f2fe', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.3rem' }}>
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editGuardianContact}
                    onChange={(e) => setEditGuardianContact(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(7, 10, 19, 0.6)',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                      borderRadius: '8px',
                      padding: '0.5rem 0.8rem',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingParent(false)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-muted)',
                      padding: '0.5rem 1.25rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingParent}
                    style={{
                      background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(0, 242, 254, 0.3)',
                    }}
                  >
                    {updatingParent ? 'Saving...' : 'Save Coordinates'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', zIndex: 1, alignItems: 'center', width: '100%', justifyContent: 'space-between', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Emergency Contact Name:
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
                      {activeProfile.guardianName || 'None Registered'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Emergency Number:
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00f2fe', fontFamily: "'Outfit', sans-serif", marginTop: '0.15rem' }}>
                      {activeProfile.guardianContact || 'None Registered'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditGuardianName(activeProfile.guardianName || '');
                    setEditGuardianContact(activeProfile.guardianContact || '');
                    setIsEditingParent(true);
                  }}
                  style={{
                    background: 'rgba(0, 242, 254, 0.1)',
                    border: '1px solid rgba(0, 242, 254, 0.3)',
                    color: '#00f2fe',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 242, 254, 0.1)'; }}
                >
                  ✏️ Edit parent details
                </button>
              </div>
            )}
          </div>
        )}

        {/* Module 5: Kinetics & Aerobic Conditioning Charts (Native React/SVG Implementation) */}
        {selectedProfileId !== 'all' && (
          <div className="glass-panel" style={{
            padding: '2.25rem',
            background: 'linear-gradient(135deg, rgba(12, 16, 32, 0.75) 0%, rgba(7, 10, 19, 0.8) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.15)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
            borderRadius: '20px',
            marginBottom: '3.5rem',
            animation: 'fadeIn 0.5s ease-out forwards',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#00f2fe', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  📈 AEROBIC KINETICS & VOLUME TELEMETRY
                </span>
                <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#fff', marginTop: '0.2rem' }}>
                  Workouts Performance Trends
                </h3>
              </div>
              
              {/* Selector Tabs */}
              <div style={{
                display: 'flex',
                background: 'rgba(7, 10, 19, 0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '50px',
                padding: '0.3rem'
              }}>
                <button
                  onClick={() => setActiveChartTab('meters')}
                  style={{
                    background: activeChartTab === 'meters' ? 'linear-gradient(135deg, #00f2fe 0%, #00ffd2 100%)' : 'transparent',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.4rem 1.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: activeChartTab === 'meters' ? '#070a13' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Meters Swam
                </button>
                <button
                  onClick={() => setActiveChartTab('bpm')}
                  style={{
                    background: activeChartTab === 'bpm' ? 'linear-gradient(135deg, #00f2fe 0%, #00ffd2 100%)' : 'transparent',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '0.4rem 1.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: activeChartTab === 'bpm' ? '#070a13' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Aerobic BPM
                </button>
              </div>
            </div>

            {/* Custom SVG line chart plotting */}
            <div style={{ position: 'relative', width: '100%', height: '240px', background: 'rgba(7,10,19,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', padding: '1rem' }}>
              
              {/* Dynamic empty/null state if no workouts are booked */}
              {confirmedCount === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <AlertCircle size={28} style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>NO CONFIRMED WORKOUT DATA YET</span>
                  <span style={{ fontSize: '0.72rem' }}>Stats will automatically plot once your receipt is verified by the coach.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  {/* Visual SVG plot area */}
                  <svg style={{ width: '100%', height: '180px', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00ffd2" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Gridlines */}
                    <line x1="0%" y1="0" x2="100%" y2="0" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <line x1="0%" y1="45" x2="100%" y2="45" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <line x1="0%" y1="90" x2="100%" y2="90" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <line x1="0%" y1="135" x2="100%" y2="135" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    <line x1="0%" y1="180" x2="100%" y2="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

                    {/* Area fill */}
                    <path
                      d={
                        activeChartTab === 'meters'
                          ? `M 0,180 L 0,${180 - (weeklyData[0].val / (targetDistance * 4)) * 160} L 33%,${180 - (weeklyData[1].val / (targetDistance * 4)) * 160} L 66%,${180 - (weeklyData[2].val / (targetDistance * 4)) * 160} L 100%,${180 - (weeklyData[3].val / (targetDistance * 4)) * 160} L 100%,180 Z`
                          : `M 0,180 L 0,${180 - (weeklyData[0].bpm / (targetBpm * 1.2)) * 160} L 33%,${180 - (weeklyData[1].bpm / (targetBpm * 1.2)) * 160} L 66%,${180 - (weeklyData[2].bpm / (targetBpm * 1.2)) * 160} L 100%,${180 - (weeklyData[3].bpm / (targetBpm * 1.2)) * 160} L 100%,180 Z`
                      }
                      fill="url(#chartGlow)"
                    />

                    {/* Glowing Polyline */}
                    <polyline
                      fill="none"
                      stroke="url(#lineGrad)"
                      strokeWidth="3.5"
                      points={
                        activeChartTab === 'meters'
                          ? `0,${180 - (weeklyData[0].val / (targetDistance * 4)) * 160} 33%,${180 - (weeklyData[1].val / (targetDistance * 4)) * 160} 66%,${180 - (weeklyData[2].val / (targetDistance * 4)) * 160} 100%,${180 - (weeklyData[3].val / (targetDistance * 4)) * 160}`
                          : `0,${180 - (weeklyData[0].bpm / (targetBpm * 1.2)) * 160} 33%,${180 - (weeklyData[1].bpm / (targetBpm * 1.2)) * 160} 66%,${180 - (weeklyData[2].bpm / (targetBpm * 1.2)) * 160} 100%,${180 - (weeklyData[3].bpm / (targetBpm * 1.2)) * 160}`
                      }
                      strokeLinecap="round"
                    />
                    
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#00f2fe" />
                      <stop offset="100%" stopColor="#00ffd2" />
                    </linearGradient>

                    {/* Glowing dots & tooltips on vertices */}
                    {[0, 33, 66, 100].map((cx, idx) => {
                      const value = activeChartTab === 'meters' ? weeklyData[idx].val : weeklyData[idx].bpm;
                      const label = activeChartTab === 'meters' ? `${value.toLocaleString()}m` : `${value} BPM`;
                      const cy = activeChartTab === 'meters'
                        ? 180 - (weeklyData[idx].val / (targetDistance * 4)) * 160
                        : 180 - (weeklyData[idx].bpm / (targetBpm * 1.2)) * 160;
                      
                      return (
                        <g key={idx} className="chart-node">
                          <circle
                            cx={`${cx}%`}
                            cy={cy}
                            r="6"
                            fill="#070a13"
                            stroke={activeChartTab === 'meters' ? '#00f2fe' : '#00ffd2'}
                            strokeWidth="2.5"
                            style={{ filter: 'drop-shadow(0 0 5px rgba(0, 242, 254, 0.6))', cursor: 'pointer' }}
                          />
                          <text
                            x={`${cx}%`}
                            y={cy - 12}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize="9"
                            fontWeight="800"
                            fontFamily="'Outfit', sans-serif"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}
                          >
                            {label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                  
                  {/* X Axis Labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    <span>{weeklyData[0].label}</span>
                    <span>{weeklyData[1].label}</span>
                    <span>{weeklyData[2].label}</span>
                    <span>{weeklyData[3].label}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
        }}>
          {/* COLUMN 1: ACTIVE BOOKING MANAGEMENT */}
          <div style={{ flex: 2 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
              Upcoming Sessions & Lane Space
            </h3>

            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading active sessions...</div>
            ) : error ? (
              <div style={{ color: '#ff6b6b', fontSize: '0.9rem' }}>{error}</div>
            ) : filteredBookings.length === 0 ? (
              <div className="glass-panel" style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                background: 'rgba(12, 16, 32, 0.3)',
                borderColor: 'rgba(255,255,255,0.04)',
              }}>
                <AlertCircle size={36} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>NO ACTIVE BOOKINGS FOUND</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '350px', margin: '0 auto' }}>
                  Secure a private lane with Coach Dilshan in the Booking section.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className="glass-panel" style={{
                    padding: '1.75rem',
                    background: booking.status === 'Rejected' ? 'rgba(7, 10, 19, 0.2)' : 'rgba(12, 16, 32, 0.65)',
                    border: '1px solid',
                    borderColor: booking.status === 'Rejected' ? 'rgba(255,107,107,0.06)' : 'rgba(0, 242, 254, 0.08)',
                    opacity: booking.status === 'Rejected' ? 0.55 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                    {/* Upper Row: Status and Details */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            ...getStatusBadgeStyle(booking.status)
                          }}>
                            {booking.status === 'Pending_Approval' ? 'PENDING APPROVAL' : booking.status.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff' }}>
                          Coach: {booking.coach?.name || 'Coach Dilshan Tennakoon'}
                        </h4>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          <span>🕒 {booking.timeSlot}</span>
                          <span>🏊 Lane {booking.lane}</span>
                          <span style={{ color: '#00ffd2', fontWeight: 700 }}>Rs. {booking.priceLKR?.toLocaleString()} LKR</span>
                        </div>
                      </div>

                      {/* Cancel Action */}
                      {booking.status === 'Confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 107, 107, 0.3)',
                            color: '#ff6b6b',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'var(--transition-smooth)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)'; e.currentTarget.style.borderColor = '#ff6b6b'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)'; }}
                        >
                          <XCircle size={14} /> Clear Slot
                        </button>
                      )}
                    </div>

                    {/* Lower Row: Bank Slip Uploader Actions (Swimmer friendly deposit verification) */}
                    {booking.status === 'Pending_Approval' && (
                      <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        paddingTop: '1rem',
                        marginTop: '0.25rem',
                      }}>
                        {booking.slipImageUrl ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8rem',
                            color: '#00ffd2',
                            background: 'rgba(0, 255, 210, 0.04)',
                            border: '1px solid rgba(0, 255, 210, 0.15)',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            width: 'fit-content'
                          }}>
                            <ImageIcon size={14} />
                            <span>Deposit Slip Uploaded Successfully — Waiting for Coach Verification</span>
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}>
                            <div style={{ fontSize: '0.78rem', color: '#ff6b6b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <AlertCircle size={14} /> Bank slip verification receipt required to secure lane reservation.
                            </div>
                            
                            {/* Inline file input trigger */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{
                                position: 'relative',
                                background: 'rgba(0, 242, 254, 0.05)',
                                border: '1px solid rgba(0, 242, 254, 0.25)',
                                color: '#00f2fe',
                                padding: '0.4rem 1.25rem',
                                borderRadius: '50px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                overflow: 'hidden',
                                transition: 'var(--transition-smooth)'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,242,254,0.1)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,242,254,0.05)'; }}
                              >
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  disabled={uploadingId === booking._id}
                                  onChange={(e) => handleInlineUpload(e, booking._id)}
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    opacity: 0,
                                    cursor: 'pointer'
                                  }}
                                />
                                <ImageIcon size={14} /> 
                                {uploadingId === booking._id ? 'Uploading...' : 'Upload Deposit Slip'}
                              </div>

                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Seylan Bank A/C: 0120-13840291-001
                              </div>
                            </div>
                          </div>
                        )}
                        </div>
                      )}

                    {/* Lower Row: Confirmed Booking QR Check-In Utility (Module 5) */}
                    {booking.status === 'Confirmed' && (
                      <div style={{
                        borderTop: '1px solid rgba(0, 255, 210, 0.1)',
                        paddingTop: '1rem',
                        marginTop: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        background: 'rgba(0, 255, 210, 0.02)',
                        border: '1px dashed rgba(0, 255, 210, 0.2)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '1.25rem' }}>🎫</span>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#00ffd2', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              PHYSICAL QR-GATE PASS SECURED
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              Present code pass below to registry desk at the pool facility check-in coordinates.
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", marginTop: '0.2rem' }}>
                              Pass ID: <span style={{ color: '#00f2fe' }}>{booking.qrCodeString || `QR-PASS-${booking._id}-SECURE`}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{
                          background: '#fff',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 10px rgba(0, 255, 210, 0.15)',
                          width: '64px',
                          height: '64px'
                        }}>
                          {/* Mini Custom QR simulation graphic */}
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: '#000',
                            border: '1px solid #000',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gridTemplateRows: 'repeat(4, 1fr)',
                            gap: '2px'
                          }}>
                            {/* Visual square matrix representation */}
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#000' }} />
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#000' }} />
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#000' }} />
                            <div style={{ background: '#000' }} />
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#000' }} />
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#000' }} />
                            <div style={{ background: '#fff' }} />
                            <div style={{ background: '#000' }} />
                            <div style={{ background: '#fff' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2: ACTIVE COACHING TIPS */}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
              Coaching Telemetry Feedback
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {getTrainerFeedback().map((feedback, idx) => (
                <div key={idx} className="glass-panel" style={{
                  padding: '1.5rem',
                  background: 'rgba(19, 25, 48, 0.4)',
                  borderColor: 'rgba(0, 242, 254, 0.1)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00f2fe', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
                    <FileText size={14} /> FROM {feedback.trainer.toUpperCase()}
                  </div>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}>
                    "{feedback.note}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
