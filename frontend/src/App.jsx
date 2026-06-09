import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Coaches from './components/Coaches.jsx';
import BookingSection from './components/BookingSection.jsx';
import AuthModal from './components/AuthModal.jsx';
import Dashboard from './components/Dashboard.jsx';
import CoachWorkspace from './components/CoachWorkspace.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';

function AppContent() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('main'); // 'main', 'dashboard', or 'coachWorkspace'
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Auto-redirect user to designated workspace on auth status update
  useEffect(() => {
    if (user) {
      if (user.role === 'coach' || user.role === 'admin') {
        setActiveView('coachWorkspace');
      } else {
        setActiveView('dashboard');
      }
    } else {
      setActiveView('main');
    }
  }, [user]);

  // Smooth scroll handler to scroll inside sections
  const handleScrollToSection = (sectionId) => {
    setActiveView('main'); // Make sure we are on home first
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Header navbar */}
      <Navbar 
        onOpenAuth={() => setIsAuthOpen(true)} 
        onScrollToSection={handleScrollToSection}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Single Page Router content */}
      <main style={{ flex: 1 }}>
        {activeView === 'main' ? (
          <>
            {/* Cinematic Hero */}
            <Hero onScrollToSection={handleScrollToSection} />

            {/* Meet the Elite Coach Roster */}
            <Coaches />

            {/* Premium About Us Section */}
            <About />

            {/* Private Visual scheduler calendar */}
            <BookingSection onOpenAuth={() => setIsAuthOpen(true)} />

            {/* Luxury Contact Us Section */}
            <Contact />
          </>
        ) : activeView === 'dashboard' ? (
          /* Post-Login Swimmer Member Portal */
          <>
            <Dashboard />
            <BookingSection onOpenAuth={() => setIsAuthOpen(true)} />
          </>
        ) : (
          /* Secure Coach Control Board Workspace */
          <CoachWorkspace />
        )}
      </main>

      {/* Premium Unified Login / Registration modal overlay */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Luxury Footer */}
      <footer className="liquid-glass-footer" style={{ textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', color: '#fff', marginBottom: '0.4rem', textTransform: 'uppercase' }}>AQUA FORGE ACADEMY</h4>
            <p>Forging high-performance aquatic excellence. All sessions priced exclusively in LKR.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <img src="/panduka_studios.png" alt="Panduka.W Studios" style={{ height: '32px', filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.25))' }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '600', letterSpacing: '0.05em', color: '#fff' }}>PANDUKA.W STUDIOS</span>
            </div>
            <p>© {new Date().getFullYear()} Aqua Forge. Engineered by Panduka.W Studios. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
