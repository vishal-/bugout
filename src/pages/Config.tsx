import React, { useState } from 'react';
import { FiServer, FiKey, FiSave, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

interface ConfigProps {
  onSaveConfig: (url: string, key: string) => void;
  onNotify: (message: string) => void;
}

export default function Config({ onSaveConfig, onNotify }: ConfigProps) {
  // Load values from localStorage
  const [baseUrl, setBaseUrl] = useState(() => {
    return localStorage.getItem('backend_base_url') || '';
  });
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('backend_api_key') || '';
  });

  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(baseUrl.trim(), apiKey.trim());
    onNotify('Connection parameters synced to LocalStorage!');
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    if (window.confirm('Reset API Configuration?')) {
      setBaseUrl('');
      setApiKey('');
      onSaveConfig('', '');
      onNotify('API Configuration reset.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div 
        className="glass-panel animate-fade-in" 
        style={{ 
          maxWidth: '460px', 
          width: '100%', 
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 50px rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px'
        }}
      >
        {/* Title / Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#fff',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
          }}>
            <FiServer />
          </div>
          <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-light)' }}>
            Backend API Configuration
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Setup connection parameters to test your host
          </p>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Base URL Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="baseUrl" style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 500 }}>
              Host Base URL
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiServer style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', fontSize: '16px' }} />
              <input
                id="baseUrl"
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.yourproject.com"
                required
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 14px 12px 42px',
                  color: 'var(--text-light)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* API Key Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="apiKey" style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 500 }}>
              API Key / Token
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FiKey style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)', fontSize: '16px' }} />
              <input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter connection secret key"
                required
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 45px 12px 42px',
                  color: 'var(--text-light)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                {showKey ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: 'var(--text-light)',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background-color 0.2s, transform 0.1s',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <FiSave size={16} />
              Save Configuration
            </button>

            <button
              type="button"
              onClick={handleClear}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: 'transparent',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
                fontWeight: 500,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--danger-glow)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Reset
            </button>
          </div>
        </form>

        {/* Success Alert */}
        {saved && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'var(--success-glow)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--success)',
              fontSize: '13.5px',
              marginTop: '20px',
              animation: 'fadeIn 0.2s ease forwards'
            }}
          >
            <FiCheckCircle size={16} />
            <span>Connection parameters synced!</span>
          </div>
        )}

      </div>
    </div>
  );
}
