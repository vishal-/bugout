import { useState } from 'react';
import { FiImage, FiSearch, FiTrash2, FiExternalLink, FiDownload, FiInfo, FiGrid, FiList } from 'react-icons/fi';

export default function Images() {
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  // Premium mock images grid
  const mockImages = [
    { id: '1', name: 'app_dashboard_v2.png', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80', size: '1.2 MB', type: 'image/png', date: '2 hours ago' },
    { id: '2', name: 'marketing_banner_spring.jpg', url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80', size: '2.4 MB', type: 'image/jpeg', date: 'Yesterday' },
    { id: '3', name: 'avatar_user_jane.webp', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80', size: '142 KB', type: 'image/webp', date: '3 days ago' },
    { id: '4', name: 'team_photo_retreat.jpg', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80', size: '4.8 MB', type: 'image/jpeg', date: '1 week ago' },
    { id: '5', name: 'product_showcase_final.png', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', size: '3.1 MB', type: 'image/png', date: '2 weeks ago' },
    { id: '6', name: 'blog_cover_coding.jpg', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', size: '820 KB', type: 'image/jpeg', date: '2 weeks ago' },
  ];

  const filteredImages = mockImages.filter(img => 
    img.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 800, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiImage style={{ color: 'var(--primary)' }} /> Uploaded Images
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            View and manage individual media objects hosted on your server
          </p>
        </div>

        {/* Search & Layout Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search images..."
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-light)',
                fontSize: '13px',
                outline: 'none',
                width: '200px',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--border-focus)';
                e.target.style.width = '240px';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.width = '200px';
              }}
            />
          </div>

          {/* Grid/List toggles */}
          <div style={{
            display: 'flex',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '2px'
          }}>
            <button
              onClick={() => setLayout('grid')}
              style={{
                background: layout === 'grid' ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                color: layout === 'grid' ? 'var(--text-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FiGrid size={15} />
            </button>
            <button
              onClick={() => setLayout('list')}
              style={{
                background: layout === 'list' ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                color: layout === 'list' ? 'var(--text-light)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FiList size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Board */}
      {filteredImages.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FiInfo size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p>No images match your search query.</p>
        </div>
      ) : layout === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="glass-panel glass-panel-hover"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '270px'
              }}
            >
              {/* Thumbnail frame */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={img.url} 
                  alt={img.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Data Card Details */}
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: 'var(--text-light)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }} title={img.name}>
                  {img.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{img.size}</span>
                  <span>{img.date}</span>
                </div>

                {/* Card Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '10px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '10px'
                }}>
                  <a
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-light)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    <FiExternalLink /> Link
                  </a>
                  <a
                    href={img.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '6px 10px',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-light)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FiDownload />
                  </a>
                  <button
                    onClick={() => alert('Delete actions connect to your backend REST endpoints.')}
                    style={{
                      padding: '6px 10px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: 'var(--danger)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List layout */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredImages.map((img) => (
            <div
              key={img.id}
              className="glass-panel glass-panel-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 18px',
                borderRadius: '8px',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <img 
                  src={img.url} 
                  alt={img.name} 
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: 'rgba(0,0,0,0.2)' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 600, 
                    color: 'var(--text-light)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={img.name}>
                    {img.name}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{img.type}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{img.size}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{img.date}</span>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <a href={img.url} target="_blank" rel="noreferrer" style={{ padding: '6px', color: 'var(--text-light)' }}><FiExternalLink size={16} /></a>
                  <a href={img.url} download style={{ padding: '6px', color: 'var(--text-light)' }}><FiDownload size={16} /></a>
                  <button onClick={() => alert('Purging image...')} style={{ background: 'none', border: 'none', padding: '6px', color: 'var(--danger)', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
