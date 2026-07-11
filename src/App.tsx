import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Config from './pages/Config';
import Collections from './pages/Collections';
import Images from './pages/Images';
import { 
  FiZap, 
  FiSliders, 
  FiGrid, 
  FiImage, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo, 
  FiX 
} from 'react-icons/fi';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [config, setConfig] = useState(() => ({
    baseUrl: localStorage.getItem('backend_base_url') || '',
    apiKey: localStorage.getItem('backend_api_key') || '',
  }));

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Callback to sync config changes in real-time
  const handleSaveConfig = (url: string, key: string) => {
    localStorage.setItem('backend_base_url', url);
    localStorage.setItem('backend_api_key', key);
    setConfig({ baseUrl: url, apiKey: key });
  };

  // Toast dispatch helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Redirection guard component
  function LandingRedirect() {
    const isConfigured = !!config.baseUrl && !!config.apiKey;
    if (isConfigured) {
      return <Navigate to="/collections" replace />;
    } else {
      return <Navigate to="/config" replace />;
    }
  }

  // Get active domain label
  const getEndpointLabel = () => {
    if (!config.baseUrl) return 'Setup Required';
    try {
      const url = new URL(config.baseUrl);
      return url.host;
    } catch (e) {
      return 'Custom Endpoint';
    }
  };

  const isConfigured = !!config.baseUrl && !!config.apiKey;

  return (
    <>
      {/* Navigation Header */}
      <header 
        className="glass-panel" 
        style={{ 
          margin: '20px 20px 0', 
          padding: '14px 28px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            color: '#fff',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
          }}>
            <FiZap />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-light)' }}>
              PixelVault
            </h1>
            <p style={{ fontSize: '10px', margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
              Backend Console
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          <NavLink 
            to="/collections" 
            style={({ isActive }) => ({
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? 'var(--text-light)' : 'var(--text)',
              background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            })}
          >
            <FiGrid />
            Collections
          </NavLink>

          <NavLink 
            to="/images" 
            style={({ isActive }) => ({
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? 'var(--text-light)' : 'var(--text)',
              background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            })}
          >
            <FiImage />
            Images
          </NavLink>

          <NavLink 
            to="/config" 
            style={({ isActive }) => ({
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? 'var(--text-light)' : 'var(--text)',
              background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            })}
          >
            <FiSliders />
            Config
          </NavLink>
        </nav>

        {/* Active connection endpoint status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: isConfigured ? 'var(--success)' : 'var(--danger)',
              boxShadow: `0 0 10px ${isConfigured ? 'var(--success)' : 'var(--danger)'}`,
              display: 'inline-block',
              animation: isConfigured ? 'pulse-glow 2s infinite' : 'none'
            }} 
          />
          <span 
            style={{ 
              fontSize: '11px', 
              fontWeight: 600, 
              color: 'var(--text-light)', 
              background: isConfigured ? 'var(--success-glow)' : 'var(--danger-glow)', 
              padding: '4px 10px', 
              borderRadius: '6px',
              border: `1px solid rgba(255, 255, 255, 0.03)`
            }}
          >
            {getEndpointLabel()}
          </span>
        </div>
      </header>

      {/* Main Multi-Page router container */}
      <main style={{ flexGrow: 1, paddingBottom: '40px' }}>
        <Routes>
          <Route path="/" element={<LandingRedirect />} />
          <Route 
            path="/config" 
            element={
              <Config 
                onSaveConfig={handleSaveConfig} 
                onNotify={(msg) => addToast(msg, 'success')} 
              />
            } 
          />
          <Route path="/collections" element={<Collections />} />
          <Route path="/images" element={<Images />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Dynamic Toast Notifications */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '350px',
          width: '100%'
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          
          return (
            <div 
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: 'var(--text-light)',
                fontSize: '13.5px',
                animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isSuccess ? (
                  <FiCheckCircle style={{ color: 'var(--success)', flexShrink: 0 }} size={16} />
                ) : isError ? (
                  <FiAlertCircle style={{ color: 'var(--danger)', flexShrink: 0 }} size={16} />
                ) : (
                  <FiInfo style={{ color: '#3b82f6', flexShrink: 0 }} size={16} />
                )}
                <span>{toast.message}</span>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <FiX size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
