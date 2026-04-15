import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Activity from './pages/Activity';
import Login from './pages/Login';
import Onboarding from './components/Onboarding';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Mail, CheckCircle2, Loader2, ShieldCheck, Plus, X } from 'lucide-react';

const GmailScanModal = ({ userId, onClose }) => {
  const [step, setStep] = useState('intro'); // intro, scanning, results, success
  const [detected, setDetected] = useState([]);

  useEffect(() => {
    // Check if we just returned from Google Auth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scan') === 'true') {
      window.history.replaceState({}, document.title, "/"); // Clean URL
      runRealScan();
    }
  }, []);

  const startScan = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google/url');
      const { url } = await response.json();
      window.location.href = url; // Redirect to Google
    } catch (err) {
      console.error("Failed to get auth URL", err);
    }
  };

  const runRealScan = async () => {
    setStep('scanning');
    try {
      const response = await fetch('http://localhost:5000/api/gmail/scan');
      const data = await response.json();
      if (data.success) {
        setDetected(data.detected);
        setStep('results');
      } else {
        setStep('intro');
      }
    } catch (err) {
      console.error("Gmail scan failed", err);
      setStep('intro');
    }
  };

  const addService = async (service) => {
    try {
      await fetch('http://localhost:5000/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...service, userId })
      });
      setStep('success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scan-modal card fade-in">
        <button className="close-btn top-right" onClick={onClose}><X size={20} /></button>
        
        {step === 'intro' && (
          <div className="scan-intro text-center">
            <div className="icon-pulse mb-4">
              <Mail size={48} className="text-primary" />
            </div>
            <h2>Gmail Auto-Detection</h2>
            <p className="text-muted mb-6">
              Connect your Gmail to automatically detect subscriptions from receipt emails like "Paid ₹499 to Netflix".
            </p>
            <div className="info-box mb-6">
              <ShieldCheck size={16} />
              <span>We only scan for billing keywords. Your privacy is encrypted.</span>
            </div>
            <button className="primary-btn w-full" onClick={startScan}>
              Connect & Scan Gmail
            </button>
          </div>
        )}

        {step === 'scanning' && (
          <div className="scan-progress text-center py-8">
            <Loader2 size={48} className="animate-spin text-primary mb-4 mx-auto" />
            <h3>Analyzing Inbox...</h3>
            <p className="text-muted">Searching for transaction receipts and billing cycles.</p>
            <div className="scanning-lines mt-6">
              <div className="scan-line-pill">Checking "netflix-billing@netflix.com"...</div>
              <div className="scan-line-pill">Parsing "apple-receipts@apple.com"...</div>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="scan-results">
            <h2 className="mb-2">Scan Results</h2>
            <p className="text-muted mb-6">We found {detected.length} services in your last 30 days of emails.</p>
            
            <div className="detected-list mb-6">
              {detected.map((item, idx) => (
                <div key={idx} className="detected-item">
                  <div className="item-info">
                    <img src={item.logo} alt="" />
                    <div>
                      <strong>{item.name}</strong>
                      <span>₹{item.price} • {item.plan}</span>
                    </div>
                  </div>
                  <button className="add-pill-btn" onClick={() => addService(item)}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              ))}
            </div>
            <button className="secondary-btn w-full" onClick={onClose}>Finish</button>
          </div>
        )}

        {step === 'success' && (
          <div className="scan-success text-center py-8">
            <CheckCircle2 size={64} className="text-success mb-4 mx-auto" />
            <h2>Syncing Successful</h2>
            <p className="text-muted">Your subscription portfolio has been updated.</p>
          </div>
        )}
      </div>

      <style>{`
        .scan-modal { max-width: 440px !important; padding: 2.5rem !important; }
        .text-center { text-align: center; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
        .w-full { width: 100%; }
        
        .icon-pulse {
          width: 80px;
          height: 80px;
          background: #eef2ff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          animation: pulse-blue 2s infinite;
        }

        @keyframes pulse-blue {
          0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
          100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
        }

        .info-box {
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .scanning-lines { display: flex; flex-direction: column; gap: 0.5rem; }
        .scan-line-pill {
          background: #f1f5f9;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          color: #475569;
          font-family: monospace;
          animation: fadeInOut 2s infinite;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        .detected-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .detected-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
        }

        .item-info { display: flex; align-items: center; gap: 1rem; }
        .item-info img { width: 40px; height: 40px; border-radius: 8px; background: white; padding: 4px; }
        .item-info div { display: flex; flex-direction: column; }
        .item-info strong { font-size: 0.95rem; }
        .item-info span { font-size: 0.75rem; color: #64748b; }

        .add-pill-btn {
          background: var(--primary);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .text-success { color: #10b981; }
        .close-btn.top-right { position: absolute; top: 1.25rem; right: 1.25rem; }
      `}</style>
    </div>
  );
};

function AppContent() {
  const { user, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [onboarded, setOnboarded] = useState(true); // Default true to avoid flash

  useEffect(() => {
    // Open modal automatically if we just came back from auth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scan') === 'true') {
      setIsScanning(true);
    }
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (isSignedIn && user) {
        try {
          const response = await fetch(`http://localhost:5000/api/users/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              fullName: user.fullName,
              imageUrl: user.imageUrl,
            })
          });
          const data = await response.json();
          if (data.success && data.user && data.user.preferences) {
            setOnboarded(data.user.preferences.onboarded);
          }
        } catch (err) {
          console.error("Onboarding check failed", err);
        }
      }
    };
    checkOnboarding();
  }, [isSignedIn, user]);

  const renderContent = () => {
    const userId = user?.id;
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard userId={userId} />;
      case 'subscriptions':
        return <Subscriptions userId={userId} />;
      case 'insights':
        return <Activity userId={userId} />;
      default:
        return <Dashboard userId={userId} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLoginClick={() => setShowLogin(true)} 
        onScanClick={() => setIsScanning(true)}
      />
      <main className="main-content">
        <Header activeTab={activeTab} onLoginClick={() => setShowLogin(true)} />
        <div className="content-area">
          {renderContent()}
        </div>
      </main>

      {isScanning && (
        <GmailScanModal userId={user?.id} onClose={() => setIsScanning(false)} />
      )}

      {isSignedIn && !onboarded && (
        <Onboarding user={user} onComplete={() => setOnboarded(true)} />
      )}

      <SignedOut>
        {showLogin && <Login onClose={() => setShowLogin(false)} />}
      </SignedOut>

      <style>{`
        .content-area {
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 1200px) {
          .main-content {
            margin-left: 0;
            padding: 1.5rem;
          }
          
          :global(.sidebar) {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;


