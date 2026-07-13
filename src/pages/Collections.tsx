import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFolder,
  FiPlus,
  FiGrid,
  FiEye,
  FiTrash2,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

interface CollectionsProps {
  config: {
    baseUrl: string;
    apiKey: string;
  };
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function Collections({ config, onNotify }: CollectionsProps) {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  });

  // Compute exact endpoint url for collection listing
  const cleanBase = (config.baseUrl || 'http://localhost:3000').trim().replace(/\/$/, '');
  const fetchingUrl = `${cleanBase}/api/v1/collections?page=${currentPage}&limit=10`;

  // Fetch collections function
  const fetchCollections = async (page: number = 1) => {
    if (!config.baseUrl || !config.apiKey) {
      onNotify('Backend configuration missing! Please configure Host and API Key in the Config tab.', 'error');
      return;
    }

    setLoading(true);
    const cleanUrlBase = config.baseUrl.trim().replace(/\/$/, '');
    const isLocalBackend = cleanUrlBase === 'http://localhost:3000';
    const targetUrl = isLocalBackend
      ? `/api/v1/collections?page=${page}&limit=10`
      : `${cleanUrlBase}/api/v1/collections?page=${page}&limit=10`;

    try {
      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch collections. Status: ${res.status}`);
      }

      const data = await res.json();
      setCollections(data.collections || []);
      if (data.pagination) {
        setPaginationInfo(data.pagination);
        setCurrentPage(data.pagination.page);
      }
      onNotify('Collections retrieved successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'Error fetching collections', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch collections on load if base URL & key are already set
  useEffect(() => {
    if (config.baseUrl && config.apiKey) {
      fetchCollections(1);
    }
  }, [config.baseUrl, config.apiKey]);

  // View collection images handler
  const handleViewCollection = (col: any) => {
    navigate(`/collection/${col.id}`);
  };

  // Delete collection handler
  const handleDeleteCollection = async (col: any) => {
    const confirmMessage = `Are you sure you want to delete the collection "${col.name}" and all of its ${col.imageCount} associated images?\n\nThis will permanently delete them from the database and storage. This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      if (!config.baseUrl || !config.apiKey) {
        onNotify('Backend configuration missing!', 'error');
        return;
      }

      const cleanUrlBase = config.baseUrl.trim().replace(/\/$/, '');
      const isLocalBackend = cleanUrlBase === 'http://localhost:3000';
      const targetUrl = isLocalBackend
        ? `/api/v1/collection/${col.id}`
        : `${cleanUrlBase}/api/v1/collection/${col.id}`;

      try {
        const res = await fetch(targetUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to delete collection. Status: ${res.status}`);
        }

        const data = await res.json();
        onNotify(`Collection "${col.name}" deleted successfully! (${data.deletedImages || 0} images removed)`, 'success');

        // Refresh collections
        fetchCollections(currentPage);
      } catch (err: any) {
        console.error(err);
        onNotify(err.message || 'Error deleting collection', 'error');
      }
    }
  };

  // Format bytes helper
  // const formatBytes = (bytes: number | string) => {
  //   if (typeof bytes === 'string') return bytes;
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const dm = 1;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  // };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
            onClick={() => alert('To create a collection, upload an image in the "Images" tab and input your desired collection name (e.g. pets). The backend auto-creates collections upon upload.')}
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

        {/* API Fetching Section */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
            flexWrap: 'wrap',
            background: 'rgba(255, 255, 255, 0.01)',
            borderColor: 'var(--border)'
          }}
        >
          <button
            onClick={() => fetchCollections(1)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-light)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Get Collections
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Endpoint URL
            </span>
            <code style={{
              fontSize: '12px',
              padding: '6px 12px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              wordBreak: 'break-all'
            }}>
              <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginRight: '8px' }}>GET</span>
              {fetchingUrl}
            </code>
          </div>
        </div>
      </div>

      {/* Paginated Table of Collections */}
      <div className="glass-panel" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={{ padding: '16px 24px', color: 'var(--text-light)', fontWeight: 600, fontSize: '14px' }}>Name</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-light)', fontWeight: 600, fontSize: '14px' }}>Image Count</th>
              <th style={{ padding: '16px 24px', color: 'var(--text-light)', fontWeight: 600, fontSize: '14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ animation: 'spin 1s linear infinite' }}><FiRefreshCw size={24} /></div>
                    <span>Loading collections...</span>
                  </div>
                </td>
              </tr>
            ) : collections.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <FiFolder size={32} style={{ opacity: 0.5 }} />
                    <span>No collections loaded. Configure your API key and click "Get Collections" to pull from backend.</span>
                  </div>
                </td>
              </tr>
            ) : (
              collections.map((col) => (
                <tr
                  key={col.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 24px', color: 'var(--text-light)', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FiFolder style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span>{col.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text)' }}>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      border: '1px solid rgba(255, 255, 255, 0.02)'
                    }}>
                      {col.imageCount} {col.imageCount === 1 ? 'image' : 'images'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => handleViewCollection(col)}
                        style={{
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          color: 'var(--primary-hover)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'var(--primary)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                          e.currentTarget.style.color = 'var(--primary-hover)';
                        }}
                      >
                        <FiEye size={13} /> View
                      </button>
                      <button
                        onClick={() => handleDeleteCollection(col)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: 'var(--danger)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'var(--danger)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = 'var(--danger)';
                        }}
                      >
                        <FiTrash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && collections.length > 0 && paginationInfo.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Showing page <strong>{paginationInfo.page}</strong> of <strong>{paginationInfo.pages}</strong> ({paginationInfo.total} collections total)
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => fetchCollections(paginationInfo.page - 1)}
              disabled={paginationInfo.page <= 1 || loading}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: paginationInfo.page <= 1 ? 'var(--text-muted)' : 'var(--text-light)',
                cursor: paginationInfo.page <= 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (paginationInfo.page > 1) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              onMouseOut={(e) => { if (paginationInfo.page > 1) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
            >
              <FiChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => fetchCollections(paginationInfo.page + 1)}
              disabled={paginationInfo.page >= paginationInfo.pages || loading}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: paginationInfo.page >= paginationInfo.pages ? 'var(--text-muted)' : 'var(--text-light)',
                cursor: paginationInfo.page >= paginationInfo.pages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (paginationInfo.page < paginationInfo.pages) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
              onMouseOut={(e) => { if (paginationInfo.page < paginationInfo.pages) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
            >
              Next <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
