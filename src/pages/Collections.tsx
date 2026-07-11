import { FiFolder, FiPlus, FiGrid, FiEye, FiClock } from 'react-icons/fi';

export default function Collections() {
  // Mock data of collections to display premium design
  const collectionsList = [
    { id: '1', name: 'Product Marketing', count: 24, size: '84.2 MB', updated: '2 hours ago', color: '#8b5cf6' },
    { id: '2', name: 'Website Assets', count: 12, size: '14.8 MB', updated: 'Yesterday', color: '#d946ef' },
    { id: '3', name: 'Social Media Posts', count: 48, size: '156.4 MB', updated: '3 days ago', color: '#10b981' },
    { id: '4', name: 'User Avatars', count: 142, size: '28.1 MB', updated: '1 week ago', color: '#3b82f6' },
    { id: '5', name: 'App Mockups', count: 8, size: '34.5 MB', updated: '2 weeks ago', color: '#f59e0b' },
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 800, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiGrid style={{ color: 'var(--primary)' }} /> Media Collections
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage and view organized directories on your server
          </p>
        </div>

        {/* Create collection button */}
        <button
          onClick={() => alert('Feature coming soon! This interface connects directly to your backend collections API.')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--primary)',
            color: 'var(--text-light)',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
        >
          <FiPlus /> Create Collection
        </button>
      </div>

      {/* Grid of collections */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {collectionsList.map((col) => (
          <div
            key={col.id}
            className="glass-panel glass-panel-hover"
            style={{
              padding: '24px',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
          >
            {/* Folder Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{
                background: `rgba(255, 255, 255, 0.03)`,
                border: '1px solid var(--border)',
                color: col.color,
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: `0 0 15px rgba(255, 255, 255, 0.02)`
              }}>
                <FiFolder />
              </div>
              <span style={{
                fontSize: '11px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '3px 8px',
                borderRadius: '4px',
                color: 'var(--text-muted)',
                fontWeight: 600
              }}>
                {col.size}
              </span>
            </div>

            {/* Folder Details */}
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-light)', margin: '0 0 6px 0' }}>
              {col.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
              {col.count} items stored
            </p>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border)',
              paddingTop: '12px',
              fontSize: '11.5px',
              color: 'var(--text-muted)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiClock /> {col.updated}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-hover)', fontWeight: 600 }}>
                <FiEye /> Inspect
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
