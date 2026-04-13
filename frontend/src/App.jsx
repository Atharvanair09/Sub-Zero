import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Activity from './pages/Activity';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Header activeTab={activeTab} />
        <div className="content-area">
          {renderContent()}
        </div>
      </main>

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

export default App;
