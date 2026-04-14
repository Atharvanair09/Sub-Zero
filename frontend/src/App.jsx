import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Activity from './pages/Activity';
import Login from './pages/Login';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'subscriptions':
        return <Subscriptions />;
      case 'insights':
        return <Activity />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLoginClick={() => setShowLogin(true)} 
      />
      <main className="main-content">
        <Header activeTab={activeTab} onLoginClick={() => setShowLogin(true)} />
        <div className="content-area">
          {renderContent()}
        </div>
      </main>

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


