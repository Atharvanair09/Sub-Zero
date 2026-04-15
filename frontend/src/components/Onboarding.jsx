import React, { useState } from 'react';
import { Shield, Bell, DollarSign, ArrowRight, Check } from 'lucide-react';

const Onboarding = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    monthlyBudget: 1500,
    notificationsEnabled: true
  });

  const handleComplete = async () => {
    try {
      await fetch('http://localhost:5000/api/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          preferences: { ...preferences, onboarded: true }
        })
      });
      onComplete();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card card fade-in">
        <div className="onboarding-progress">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`} />
          <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`} />
        </div>

        {step === 1 && (
          <div className="step-content">
            <div className="icon-circle bg-blue">
              <DollarSign size={32} color="#3b82f6" />
            </div>
            <h1>Set your budget</h1>
            <p>Tell us your target monthly subscription budget. We'll help you stay under it.</p>
            <div className="budget-slider">
              <span className="budget-value">₹{preferences.monthlyBudget}</span>
              <input 
                type="range" 
                min="0" 
                max="10000" 
                step="100" 
                value={preferences.monthlyBudget}
                onChange={(e) => setPreferences({...preferences, monthlyBudget: parseInt(e.target.value)})}
              />
              <div className="slider-labels">
                <span>₹0</span>
                <span>₹10,000</span>
              </div>
            </div>
            <button className="primary-btn w-full mt-8" onClick={() => setStep(2)}>
              Next <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div className="icon-circle bg-purple">
              <Bell size={32} color="#a855f7" />
            </div>
            <h1>Stay Notified</h1>
            <p>We'll alert you before renewals or when we find unused services.</p>
            <div className="toggle-option" onClick={() => setPreferences({...preferences, notificationsEnabled: !preferences.notificationsEnabled})}>
              <div className="toggle-text">
                <h3>Renewal Reminders</h3>
                <p>Get alerted 2 days before any bill.</p>
              </div>
              <div className={`custom-toggle ${preferences.notificationsEnabled ? 'active' : ''}`}>
                <div className="toggle-knob" />
              </div>
            </div>
            <button className="primary-btn w-full mt-8" onClick={handleComplete}>
              Complete Setup <Check size={18} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .onboarding-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1.5rem;
        }
        .onboarding-card {
          width: 100%;
          max-width: 480px;
          padding: 3rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .onboarding-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .step-dot { width: 10px; height: 10px; border-radius: 50%; background: #e2e8f0; }
        .step-dot.active { background: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2); }
        .step-line { width: 40px; height: 2px; background: #e2e8f0; }
        .step-line.active { background: #3b82f6; }
        
        .icon-circle {
          width: 80px; height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .bg-blue { background: #eff6ff; }
        .bg-purple { background: #f5f3ff; }
        
        h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
        p { color: #64748b; line-height: 1.6; }
        
        .budget-slider { margin-top: 2rem; }
        .budget-value { font-size: 2.5rem; font-weight: 800; color: #3b82f6; display: block; margin-bottom: 1rem; }
        input[type="range"] { 
          width: 100%; height: 6px; background: #e2e8f0; border-radius: 3px; 
          appearance: none; cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none; width: 24px; height: 24px; background: #3b82f6;
          border: 4px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .slider-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #94a3b8; font-weight: 600; margin-top: 0.5rem; }
        
        .toggle-option {
          display: flex; justify-content: space-between; align-items: center;
          text-align: left; padding: 1.5rem; background: #f8fafc;
          border-radius: 1.25rem; cursor: pointer; border: 1px solid #e2e8f0;
          transition: all 0.2s; margin-top: 1.5rem;
        }
        .toggle-option:hover { border-color: #3b82f6; background: white; }
        .toggle-text h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
        .toggle-text p { font-size: 0.85rem; }
        
        .custom-toggle {
          width: 48px; height: 26px; background: #e2e8f0;
          border-radius: 13px; position: relative; transition: all 0.3s;
        }
        .custom-toggle.active { background: #10b981; }
        .toggle-knob {
          width: 20px; height: 20px; background: white; border-radius: 50%;
          position: absolute; top: 3px; left: 3px; transition: all 0.3s;
        }
        .custom-toggle.active .toggle-knob { transform: translateX(22px); }
        
        .mt-8 { margin-top: 2rem; }
        .w-full { width: 100%; }
        .primary-btn {
          height: 60px; font-size: 1.1rem; border-radius: 18px;
          display: flex; align-items: center; justify-content: center; gap: 0.75rem;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
