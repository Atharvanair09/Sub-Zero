import React from 'react';
import { Search, Bell, Plus, LayoutGrid } from 'lucide-react';

const Header = ({ activeTab }) => {
  const getTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'subscriptions': return 'Your Subscriptions';
      case 'insights': return 'Activity & Insights';
      default: return 'SubZero';
    }
  };

  return (
    <header className="header">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Search subscriptions..." />
      </div>

      <nav className="header-nav">
        <a href="#" className="nav-link">Premium</a>
        <a href="#" className={`nav-link ${activeTab === 'insights' ? 'active' : ''}`}>Activity</a>
        <a href="#" className="nav-link">Support</a>
      </nav>

      <div className="header-actions">
        <button className="add-button">
          <Plus size={18} />
          <span>Add New</span>
        </button>
        <button className="icon-button">
          <Bell size={20} />
          <div className="notification-dot" />
        </button>
        <button className="icon-button">
          <LayoutGrid size={20} />
        </button>
        <div className="avatar-small">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" />
        </div>
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
          margin-bottom: 2rem;
          background: transparent;
        }

        .search-bar {
          display: flex;
          align-items: center;
          background: white;
          border: 1px solid var(--border);
          padding: 0.65rem 1rem;
          border-radius: 9999px;
          flex: 0 1 400px;
          gap: 0.5rem;
          box-shadow: var(--shadow-sm);
        }

        .search-icon {
          color: var(--text-muted);
        }

        .search-bar input {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .header-nav {
          display: flex;
          gap: 2rem;
          margin: 0 2rem;
        }

        .nav-link {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .nav-link.active {
          color: var(--text-main);
          font-weight: 600;
          position: relative;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
          border-radius: 1px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .add-button {
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .add-button:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .icon-button {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-main);
          position: relative;
          background: white;
          border: 1px solid var(--border);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .avatar-small {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid white;
          box-shadow: var(--shadow-sm);
        }

        .avatar-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </header>
  );
};

export default Header;
