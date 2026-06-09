import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { ShieldCheck, Calendar, Clock, Navigation, CheckCircle, XCircle, FileText, Image as ImageIcon, Eye, RefreshCw, AlertCircle, Award } from 'lucide-react';

export const CoachWorkspace = () => {
  const { user } = useAuth();
  
  // Tab states
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'

  // Pending bookings queue state
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // History bookings queue state
  const [historyBookings, setHistoryBookings] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Review states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Feedback states
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchPendingQueue = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.bookings.getPending();
      if (data.success) {
        setPendingBookings(data.bookings);
      } else {
        setError(data.message || 'Failed to sync verification queue.');
      }
    } catch (err) {
      console.error('Error fetching pending queue:', err);
      setError('Connection failure synchronization with Atlas cluster.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryQueue = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      
      const data = await api.bookings.getHistory();
      if (data.success) {
        setHistoryBookings(data.bookings);
      } else {
        setHistoryError(data.message || 'Failed to sync history ledger.');
      }
    } catch (err) {
      console.error('Error fetching history queue:', err);
      setHistoryError('Connection failure retrieving verified history log.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const syncAllQueues = () => {
    fetchPendingQueue();
    fetchHistoryQueue();
  };

  useEffect(() => {
    if (user && (user.role === 'coach' || user.role === 'admin')) {
      syncAllQueues();
    }
  }, [user]);

  const handleVerify = async (bookingId, approve) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsVerifying(true);

    try {
      const data = await api.bookings.verify(bookingId, approve);

      if (data.success) {
        setSuccessMessage(data.message);
        setIsModalOpen(false);
        setSelectedBooking(null);
        // Refresh both queues
        syncAllQueues();
      } else {
        throw new Error(data.message || 'Verification execution failed.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMessage(err.message || 'An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // 1. STRICT FRONTEND ACCESS CONTROL ENFORCEMENT
  if (!user || (user.role !== 'coach' && user.role !== 'admin')) {
    return (
      <section style={{
        padding: '8rem 2rem 6rem 2rem',
        backgroundColor: '#070a13',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '500px',
          padding: '3rem',
          textAlign: 'center',
          border: '1.5px solid rgba(255, 107, 107, 0.2)',
          background: 'rgba(12, 16, 32, 0.85)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 107, 107, 0.08)',
          borderRadius: '24px',
          animation: 'fadeIn 0.5s ease-out forwards',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255, 107, 107, 0.06)',
            border: '1.5px solid #ff6b6b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 0 25px rgba(255, 107, 107, 0.15)',
          }}>
            <XCircle size={36} color="#ff6b6b" />
          </div>
          
          <h3 style={{ 
            fontSize: '1.6rem', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            color: '#ff6b6b', 
            marginBottom: '1rem', 
            letterSpacing: '0.05em' 
          }}>
            Access Denied
          </h3>
          
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.92rem', 
            lineHeight: 1.6, 
            marginBottom: '2rem' 
          }}>
            You have entered a restricted zone. The Aqua Forge Verification Desk and cloud ledger is strictly reserved for verified coaches and enterprise administrators.
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            className="btn-neon"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              width: '100%',
              justifyContent: 'center'
            }}
          >
            Re-Authenticate Entry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      padding: '8rem 2rem 6rem 2rem',
      backgroundColor: '#070a13',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Portal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '3rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#00f2fe', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              <ShieldCheck size={14} /> COACH ENTERPRISE PORTAL
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              VERIFICATION <span className="gradient-text">DESK</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Review bank transaction slip submissions and confirm lane space allocations. Logged in as **{user.name}** ({user.role.toUpperCase()}).
            </p>
          </div>
          
          <button 
            onClick={syncAllQueues}
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
            <RefreshCw size={14} /> Refresh Queue
          </button>
        </div>

        {/* Global Feedback Banners */}
        {successMessage && (
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
            gap: '0.5rem',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}>
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
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
            gap: '0.5rem',
            animation: 'fadeIn 0.3s ease-out forwards'
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB NAVIGATION CONTROLS */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: '1rem',
        }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{
              background: activeTab === 'pending' ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.08), rgba(0, 255, 210, 0.04))' : 'transparent',
              border: '1px solid',
              borderColor: activeTab === 'pending' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'pending' ? '#00f2fe' : 'var(--text-muted)',
              borderRadius: '50px',
              padding: '0.6rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'var(--transition-smooth)',
              boxShadow: activeTab === 'pending' ? '0 0 15px rgba(0, 242, 254, 0.1)' : 'none',
            }}
          >
            <Clock size={14} /> Pending Approvals ({pendingBookings.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              background: activeTab === 'history' ? 'linear-gradient(135deg, rgba(0, 255, 210, 0.08), rgba(0, 242, 254, 0.04))' : 'transparent',
              border: '1px solid',
              borderColor: activeTab === 'history' ? 'var(--accent-teal)' : 'transparent',
              color: activeTab === 'history' ? '#00ffd2' : 'var(--text-muted)',
              borderRadius: '50px',
              padding: '0.6rem 1.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'var(--transition-smooth)',
              boxShadow: activeTab === 'history' ? '0 0 15px rgba(0, 255, 210, 0.1)' : 'none',
            }}
          >
            <CheckCircle size={14} /> Verified History ({historyBookings.length})
          </button>
        </div>

        {/* MAIN PANEL VIEW BOARD */}
        <div className="glass-panel" style={{
          padding: '2.5rem',
          background: 'rgba(12, 16, 32, 0.45)',
          border: '1px solid rgba(0, 242, 254, 0.1)',
          borderRadius: '20px',
        }}>
          
          {activeTab === 'pending' ? (
            /* ==========================================================
               TAB 1: PENDING BANK SLIP SUBMISSIONS QUEUE
               ========================================================== */
            <>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                Pending Swimmer Deposit Slips Queue
              </h3>

              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '1rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '30px', height: '30px', border: '2px solid rgba(0, 242, 254, 0.1)', borderTopColor: '#00f2fe', borderRadius: '50%', animation: 'wave 1s infinite linear' }} />
                  <span>Loading pending queue ledger...</span>
                </div>
              ) : error ? (
                <div style={{ color: '#ff6b6b', padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              ) : pendingBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <CheckCircle size={48} color="#00ffd2" style={{ marginBottom: '1rem', opacity: 0.6 }} />
                  <h4 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>QUEUE FULLY CLEARED</h4>
                  <p style={{ fontSize: '0.85rem' }}>There are no pending swimmer deposit slip submissions to verify.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingBookings.map((booking) => (
                    <div 
                      key={booking._id} 
                      className="glass-panel" 
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(7, 10, 19, 0.35)',
                        border: '1px solid rgba(0, 242, 254, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        borderRadius: '12px',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.08)'}
                    >
                      {/* Swimmer & Session Info */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{
                            background: 'rgba(0, 242, 254, 0.08)',
                            border: '1px solid rgba(0, 242, 254, 0.3)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#00f2fe',
                            letterSpacing: '0.05em'
                          }}>
                            PENDING VERIFICATION
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Slot Locked: {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                          
                          {/* Admin Tag showing Coach Allocation */}
                          {user.role === 'admin' && (
                            <span style={{
                              background: 'rgba(0, 255, 210, 0.06)',
                              border: '1px solid rgba(0, 255, 210, 0.2)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              color: '#00ffd2',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}>
                              <Award size={10} /> Coach: {booking.coach?.name?.split(' ')[1] || 'Dilshan'}
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginBottom: '0.2rem' }}>
                          Swimmer: {booking.user?.name || 'Anonymous Swimmer'}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                          Email: {booking.user?.email || 'N/A'}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: '#fff' }}>
                          <span>📅 {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>🕒 {booking.timeSlot}</span>
                          <span>🏊 Lane {booking.lane}</span>
                          <span style={{ color: '#00ffd2', fontWeight: 700 }}>Rs. {booking.priceLKR?.toLocaleString()} LKR</span>
                        </div>
                      </div>

                      {/* Review Action */}
                      <div>
                        {booking.slipImageUrl ? (
                          <button
                            onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                            className="btn-neon"
                            style={{
                              padding: '0.5rem 1.25rem',
                              fontSize: '0.8rem',
                              boxShadow: '0 4px 10px rgba(0, 242, 254, 0.25)',
                            }}
                          >
                            <ImageIcon size={14} /> Review Slip Receipt
                          </button>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.8rem',
                            color: '#ff6b6b',
                            background: 'rgba(255,107,107,0.06)',
                            border: '1px solid rgba(255,107,107,0.2)',
                            padding: '0.5rem 1rem',
                            borderRadius: '50px'
                          }}>
                            <FileText size={14} /> Swimmer Slip Not Uploaded
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ==========================================================
               TAB 2: VERIFIED HISTORY LOG
               ========================================================== */
            <>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
                Verified Lanes & Transaction History Log
              </h3>

              {historyLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '1rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '30px', height: '30px', border: '2px solid rgba(0, 255, 210, 0.1)', borderTopColor: '#00ffd2', borderRadius: '50%', animation: 'wave 1s infinite linear' }} />
                  <span>Loading verified history log...</span>
                </div>
              ) : historyError ? (
                <div style={{ color: '#ff6b6b', padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{historyError}</span>
                </div>
              ) : historyBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                  <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.4 }} />
                  <h4 style={{ color: '#fff', fontSize: '1.15rem', marginBottom: '0.25rem' }}>LOG BOOK EMPTY</h4>
                  <p style={{ fontSize: '0.85rem' }}>No bookings have been verified (Confirmed or Rejected) yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {historyBookings.map((booking) => (
                    <div 
                      key={booking._id} 
                      className="glass-panel" 
                      style={{
                        padding: '1.5rem',
                        background: 'rgba(7, 10, 19, 0.2)',
                        border: '1px solid',
                        borderColor: booking.status === 'Confirmed' ? 'rgba(0, 255, 210, 0.08)' : 'rgba(255, 107, 107, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        borderRadius: '12px',
                        opacity: 0.85
                      }}
                    >
                      {/* Swimmer & Session details */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span style={{
                            background: booking.status === 'Confirmed' ? 'rgba(0, 255, 210, 0.08)' : 'rgba(255, 107, 107, 0.08)',
                            border: '1px solid',
                            borderColor: booking.status === 'Confirmed' ? '#00ffd2' : '#ff6b6b',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: booking.status === 'Confirmed' ? '#00ffd2' : '#ff6b6b',
                            letterSpacing: '0.05em'
                          }}>
                            {booking.status.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Verified on: {booking.uploadedAt ? new Date(booking.uploadedAt).toLocaleDateString() : new Date(booking.date).toLocaleDateString()}
                          </span>
                          
                          {/* Coach Tag for Admins */}
                          {user.role === 'admin' && (
                            <span style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              color: 'var(--text-muted)'
                            }}>
                              Instructor: {booking.coach?.name || 'Dilshan'}
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', marginBottom: '0.2rem' }}>
                          Swimmer: {booking.user?.name || 'Anonymous Swimmer'}
                        </h4>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span>📅 {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>🕒 {booking.timeSlot}</span>
                          <span>🏊 Lane {booking.lane}</span>
                          <strong style={{ color: booking.status === 'Confirmed' ? '#00ffd2' : '#ff6b6b' }}>Rs. {booking.priceLKR?.toLocaleString()} LKR</strong>
                        </div>
                      </div>

                      {/* Display Small Receipt Preview Click */}
                      {booking.slipImageUrl && (
                        <button
                          onClick={() => { setSelectedBooking(booking); setIsModalOpen(true); }}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50px',
                            color: 'var(--text-primary)',
                            padding: '0.4rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        >
                          <Eye size={12} /> View Archived Slip
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* CLICK TO PREVIEW RECEIPT MODAL */}
      {isModalOpen && selectedBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'rgba(4, 7, 15, 0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <div className="glass-panel" style={{
            position: 'relative',
            width: '100%',
            maxWidth: '520px',
            padding: '2.5rem',
            background: 'rgba(12, 16, 32, 0.9)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 242, 254, 0.1)',
            animation: 'fadeIn 0.3s ease-out forwards',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}>
            {/* Close Button */}
            <button 
              onClick={() => { setIsModalOpen(false); setSelectedBooking(null); }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '50%',
                transition: 'var(--transition-smooth)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <XCircle size={22} />
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                RECEIPT VALIDATION
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Verify the swimmer's manual bank deposit slip carefully below.
              </p>
            </div>

            {/* Slip Image Viewport */}
            <div style={{
              width: '100%',
              height: '300px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(0, 242, 254, 0.15)',
              background: '#070a13',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}>
              <img 
                src={selectedBooking.slipImageUrl} 
                alt="Uploaded Bank Slip Receipt" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }} 
              />
            </div>

            {/* Summary Details */}
            <div style={{
              background: 'rgba(7,10,19,0.5)',
              border: '1px solid rgba(255,255,255,0.04)',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}>
              <div>Swimmer: <strong style={{ color: '#fff' }}>{selectedBooking.user?.name}</strong></div>
              <div>Reserved: <strong style={{ color: '#fff' }}>Lane {selectedBooking.lane} on {new Date(selectedBooking.date).toLocaleDateString()}</strong></div>
              <div>Instructor: <strong style={{ color: '#fff' }}>{selectedBooking.coach?.name || 'Coach Dilshan Tennakoon'}</strong></div>
              <div style={{ display: 'flex', justifycontent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', marginTop: '0.2rem' }}>
                <span>Transaction Value:</span>
                <strong style={{ color: '#00ffd2', fontSize: '0.95rem' }}>Rs. {selectedBooking.priceLKR?.toLocaleString()} LKR</strong>
              </div>
            </div>

            {/* Action Validation Control Buttons (Only render if booking is in Pending state) */}
            {selectedBooking.status === 'Pending_Approval' ? (
              <div style={{
                display: 'flex',
                gap: '1rem',
                width: '100%',
              }}>
                {/* Reject Button */}
                <button
                  onClick={() => handleVerify(selectedBooking._id, false)}
                  disabled={isVerifying}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid rgba(255, 107, 107, 0.4)',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 107, 107, 0.08)'; e.currentTarget.style.borderColor = '#ff6b6b'; e.currentTarget.style.boxShadow = '0 0 15px rgba(255,107,107,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.4)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <XCircle size={16} /> {isVerifying ? 'Processing...' : 'Reject Receipt'}
                </button>

                {/* Approve Button */}
                <button
                  onClick={() => handleVerify(selectedBooking._id, true)}
                  disabled={isVerifying}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #00f2fe 0%, #00ffd2 100%)',
                    border: 'none',
                    color: '#040814',
                    cursor: 'pointer',
                    padding: '0.75rem',
                    borderRadius: '50px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition-smooth)',
                    boxShadow: '0 4px 15px rgba(0, 255, 210, 0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 25px rgba(0, 255, 210, 0.55)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 255, 210, 0.3)'; }}
                >
                  <CheckCircle size={16} /> {isVerifying ? 'Processing...' : 'Confirm Lane'}
                </button>
              </div>
            ) : (
              /* If archived/reviewed, show status tag instead */
              <div style={{
                textAlign: 'center',
                background: selectedBooking.status === 'Confirmed' ? 'rgba(0, 255, 210, 0.04)' : 'rgba(255, 107, 107, 0.04)',
                border: '1px solid',
                borderColor: selectedBooking.status === 'Confirmed' ? 'rgba(0, 255, 210, 0.2)' : 'rgba(255, 107, 107, 0.2)',
                padding: '0.75rem',
                borderRadius: '8px',
                color: selectedBooking.status === 'Confirmed' ? '#00ffd2' : '#ff6b6b',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Archived Booking Status: {selectedBooking.status}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default CoachWorkspace;
