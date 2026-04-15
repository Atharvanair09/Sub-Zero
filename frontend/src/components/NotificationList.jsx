import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ArrowRight, AlertTriangle, Zap, Wallet } from 'lucide-react';

const NotificationList = ({ userId, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/notifications?userId=${userId}`);
        const data = await response.json();
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    if (userId) fetchNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await fetch('http://localhost:5000/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id })
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'renewal': return <Wallet className="text-blue" size={20} />;
      case 'price_increase': return <AlertTriangle className="text-red" size={20} />;
      case 'usage_alert': return <Zap className="text-purple" size={20} />;
      default: return <Bell className="text-gray" size={20} />;
    }
  };

  return (
    <div className="notifications-dropdown card fade-in">
      <div className="dropdown-header">
        <h3>Smart Alerts</h3>
        <button className="close-icon" onClick={onClose}><X size={18} /></button>
      </div>
      
      <div className="notifications-scroll">
        {loading ? (
          <div className="loading-state">Analyzing alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">No new alerts. You're all optimized!</div>
        ) : (
          notifications.map(n => (
            <div key={n._id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
              <div className="item-icon-container">
                {getIcon(n.type)}
              </div>
              <div className="item-content">
                <div className="item-title">
                  <strong>{n.title}</strong>
                  {!n.read && <span className="unread-dot" />}
                </div>
                <p>{n.message}</p>
                <div className="item-footer">
                  <span className="time">{new Date(n.createdAt).toLocaleDateString()}</span>
                  {!n.read && (
                    <button className="mark-read" onClick={() => markAsRead(n._id)}>
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .notifications-dropdown {
          position: absolute;
          top: 70px;
          right: 20px;
          width: 360px;
          max-height: 500px;
          z-index: 1000;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .dropdown-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }
        .dropdown-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
        .notifications-scroll {
          overflow-y: auto;
          max-height: 400px;
        }
        .notification-item {
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .notification-item:hover { background: #f1f5f9; }
        .notification-item.unread { background: #f0f7ff; }
        .item-icon-container {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: white; flex-shrink: 0; border: 1px solid var(--border);
        }
        .item-content { flex: 1; }
        .item-title { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
        .item-title strong { font-size: 0.9rem; font-weight: 700; }
        .unread-dot { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; }
        .item-content p { font-size: 0.8rem; color: #64748b; margin: 0 0 0.75rem; line-height: 1.4; }
        .item-footer { display: flex; justify-content: space-between; align-items: center; }
        .item-footer .time { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
        .mark-read { font-size: 0.7rem; font-weight: 700; color: var(--primary); }
        
        .text-blue { color: #3b82f6; }
        .text-red { color: #ef4444; }
        .text-purple { color: #8b5cf6; }
        
        .loading-state, .empty-state { padding: 3rem; text-align: center; color: #94a3b8; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default NotificationList;
