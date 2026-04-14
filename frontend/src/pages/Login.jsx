import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

const Login = ({ onClose }) => {
  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="login-modal"
      >
        <button className="close-button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "clerk-root",
              card: "clerk-card",
              headerTitle: "clerk-title",
              headerSubtitle: "clerk-subtitle",
              socialButtonsBlockButton: "clerk-social-button",
              formButtonPrimary: "clerk-primary-button",
              footerActionLink: "clerk-link"
            }
          }}
          routing="hash"
        />
      </motion.div>

      <style>{`
        .login-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .login-modal {
          position: relative;
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%;
          max-width: 420px;
          margin: auto;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 100;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
          border: 1px solid #e2e8f0;
        }

        .close-button:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: rotate(90deg);
        }

        /* Clerk Overrides */
        .clerk-root {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
        }
        
        .clerk-card {
          box-shadow: none !important;
          border: none !important;
          padding: 3rem 2rem 2rem !important;
          width: 100% !important;
          margin: 0 !important;
        }

        .clerk-title {
          font-family: 'Inter', sans-serif !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          font-size: 1.5rem !important;
        }

        .clerk-subtitle {
          color: #64748b !important;
          font-size: 0.95rem !important;
        }

        .clerk-social-button {
          border: 1px solid #e2e8f0 !important;
          transition: all 0.2s !important;
          height: 44px !important;
        }

        .clerk-social-button:hover {
          background: #f8fafc !important;
        }

        .clerk-primary-button {
          background: var(--primary) !important;
          height: 44px !important;
          font-weight: 600 !important;
          transition: all 0.2s !important;
        }

        .clerk-primary-button:hover {
          background: var(--primary-dark) !important;
        }

        .clerk-link {
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};

export default Login;


