import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { X, Mail, Lock, User, CheckCircle, ShieldAlert } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, authError, setAuthError } = useAuth();
  
  // Tab control: 'login' or 'register'
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Real-time frontend validation states
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    // Reset inputs, error and touched states when switching tab or closing/opening modal
    setAuthError(null);
    setErrors({});
    setTouched({});
    setName('');
    setEmail('');
    setPassword('');
  }, [isLoginTab, isOpen, setAuthError]);

  if (!isOpen) return null;

  // Real-time validations
  const validateField = (fieldName, value) => {
    let errorMsg = '';
    
    if (fieldName === 'name' && !isLoginTab) {
      if (!value || value.trim() === '') {
        errorMsg = 'Swimmer name is required.';
      }
    }
    
    if (fieldName === 'email') {
      if (!value || value.trim() === '') {
        errorMsg = 'Email address is required.';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.toLowerCase())) {
          errorMsg = 'Invalid email syntax (e.g. swimmer@domain.com).';
        }
      }
    }
    
    if (fieldName === 'password') {
      if (!value) {
        errorMsg = 'Password is required.';
      } else if (value.length < 8) {
        errorMsg = 'Security password must be at least 8 characters long.';
      }
    }

    setErrors(prev => ({ ...prev, [fieldName]: errorMsg }));
  };

  const handleFieldChange = (fieldName, value, setter) => {
    setter(value);
    if (touched[fieldName]) {
      validateField(fieldName, value);
    }
  };

  const handleFieldBlur = (fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateField(fieldName, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    // Trigger validation for all fields
    const newErrors = {};
    if (!isLoginTab) {
      if (!name || name.trim() === '') newErrors.name = 'Swimmer name is required.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || email.trim() === '') {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.toLowerCase())) {
      newErrors.email = 'Invalid email syntax.';
    }
    
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true });

    if (Object.values(newErrors).some(err => err !== '')) {
      return; // Stop execution on error
    }

    // Submit request to context
    if (isLoginTab) {
      const res = await login(email, password);
      if (res.success) onClose();
    } else {
      const res = await register(name, email, password);
      if (res.success) onClose();
    }
  };

  const getInputStyle = (fieldName) => {
    const hasError = errors[fieldName];
    const isTouched = touched[fieldName];
    
    if (!isTouched) return {};
    if (hasError) return { borderColor: '#ff6b6b', boxShadow: '0 0 10px rgba(255, 107, 107, 0.2)' };
    return { borderColor: '#00ffd2', boxShadow: '0 0 10px rgba(0, 255, 210, 0.15)' };
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'rgba(4, 7, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      {/* Modal Card */}
      <div className="glass-panel" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        padding: '3rem 2.5rem',
        background: 'rgba(12, 16, 32, 0.85)',
        border: '1px solid rgba(0, 242, 254, 0.2)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 242, 254, 0.1)',
        animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
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
          <X size={20} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {isLoginTab ? 'SWIMMER ' : 'CREATE '} 
            <span className="gradient-text">{isLoginTab ? 'LOGIN' : 'ACCOUNT'}</span>
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {isLoginTab ? 'Please sign in to manage and book your swimming sessions.' : 'Create an account to track your distance metrics and book private lanes.'}
          </p>
        </div>

        {/* Action Form */}
        <form onSubmit={handleSubmit}>
          {/* Swimmer Name (Only for Registration) */}
          {!isLoginTab && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={16} />
                </span>
                <input 
                  type="text"
                  placeholder="e.g. John Doe"
                  className="input-neon"
                  style={{ paddingLeft: '2.75rem', ...getInputStyle('name') }}
                  value={name}
                  onChange={(e) => handleFieldChange('name', e.target.value, setName)}
                  onBlur={() => handleFieldBlur('name', name)}
                />
              </div>
              {touched.name && errors.name && (
                <div style={{ color: '#ff6b6b', fontSize: '0.72rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldAlert size={12} /> {errors.name}
                </div>
              )}
            </div>
          )}

          {/* Email Address */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </span>
              <input 
                type="email"
                placeholder="swimmer@aquaforge.com"
                className="input-neon"
                style={{ paddingLeft: '2.75rem', ...getInputStyle('email') }}
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                onBlur={() => handleFieldBlur('email', email)}
              />
            </div>
            {touched.email && errors.email && (
              <div style={{ color: '#ff6b6b', fontSize: '0.72rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldAlert size={12} /> {errors.email}
              </div>
            )}
          </div>

          {/* Security Password */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input 
                type="password"
                placeholder="••••••••"
                className="input-neon"
                style={{ paddingLeft: '2.75rem', ...getInputStyle('password') }}
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                onBlur={() => handleFieldBlur('password', password)}
              />
            </div>
            {touched.password && errors.password && (
              <div style={{ color: '#ff6b6b', fontSize: '0.72rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldAlert size={12} /> {errors.password}
              </div>
            )}
            {!isLoginTab && !errors.password && password.length >= 8 && (
              <div style={{ color: '#00ffd2', fontSize: '0.72rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle size={12} /> Secure password strength validated.
              </div>
            )}
          </div>

          {/* Error Message Box */}
          {authError && (
            <div style={{
              background: 'rgba(255, 107, 107, 0.08)',
              border: '1px solid rgba(255, 107, 107, 0.25)',
              color: '#ff6b6b',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.78rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <ShieldAlert size={16} />
              <span>{authError}</span>
            </div>
          )}

          {/* Submission Button */}
          <button 
            type="submit" 
            className="btn-neon" 
            style={{ width: '100%', justifyContent: 'center', marginBottom: '1.5rem' }}
          >
            {isLoginTab ? 'Login / Sign In' : 'Register / Create Account'}
          </button>
        </form>

        {/* Tab Swapper */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: '1.25rem',
        }}>
          {isLoginTab ? (
            <span>
              New Swimmer?{' '}
              <button 
                onClick={() => setIsLoginTab(false)}
                style={{ background: 'transparent', border: 'none', color: '#00f2fe', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
              >
                Register Here
              </button>
            </span>
          ) : (
            <span>
              Already Registered?{' '}
              <button 
                onClick={() => setIsLoginTab(true)}
                style={{ background: 'transparent', border: 'none', color: '#00f2fe', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
              >
                Login Here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
