import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiFolder,
  FiChevronLeft,
  FiChevronRight,
  FiArrowLeft,
  FiDownload,
  FiEye,
  FiRefreshCw,
  FiCopy,
  FiCheck,
  FiImage
} from 'react-icons/fi';

interface CollectionDetailProps {
  config: {
    baseUrl: string;
    apiKey: string;
  };
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CollectionDetail({ config, onNotify }: CollectionDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedImageId, setCopiedImageId] = useState<string | null>(null);

  // Store selected format and size per image
  const [selectedFormats, setSelectedFormats] = useState<Record<string, string>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});

  const ITEMS_PER_PAGE = 6;

  // Fetch collection details
  const fetchCollectionImages = async () => {
    if (!id) return;
    if (!config.baseUrl || !config.apiKey) {
      onNotify('Backend configuration missing! Please configure Host and API Key in the Config tab.', 'error');
      setLoading(false);
      return;
    }

    setLoading(true);
    const cleanUrlBase = config.baseUrl.trim().replace(/\/$/, '');
    const isLocalBackend = cleanUrlBase === 'http://localhost:3000';
    const targetUrl = isLocalBackend
      ? `/api/v1/collection/${id}`
      : `${cleanUrlBase}/api/v1/collection/${id}`;

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Collection not found on the server.');
        }
        throw new Error(`Failed to load collection images. Status: ${res.status}`);
      }

      const data = await res.json();
      setImages(data.images || []);
      setCurrentPage(1); // Reset to page 1 on fresh load
      onNotify('Collection details loaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(err.message || 'Error fetching collection details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectionImages();
  }, [id, config.baseUrl, config.apiKey]);

  // Calculations for page header description
  const totalStorageSize = images.reduce((acc, img) => acc + (Number(img.size) || 0), 0);
  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);

  // Client-side pagination slice
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedImages = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper to extract filename/slug.ext from url
  const getSlugFromUrl = (urlStr: string): string => {
    if (!urlStr) return 'image.jpg';
    try {
      const parts = urlStr.split('/');
      return parts[parts.length - 1];
    } catch {
      return 'image.jpg';
    }
  };

  // Construct Variant API Request URL
  const constructVariantUrl = (img: any, format: string, size: string) => {
    const slugWithExt = getSlugFromUrl(img.url);
    const cleanUrlBase = config.baseUrl.trim().replace(/\/$/, '');
    const isLocalBackend = cleanUrlBase === 'http://localhost:3000';

    let targetUrl = isLocalBackend
      ? `/api/v1/image/${slugWithExt}`
      : `${cleanUrlBase}/api/v1/image/${slugWithExt}`;

    const params = new URLSearchParams();
    if (format && format !== 'original') params.append('fmt', format);
    if (size && size !== 'original') params.append('size', size);

    const queryStr = params.toString();
    if (queryStr) targetUrl += `?${queryStr}`;
    return targetUrl;
  };

  // Handle viewing specific variant in new tab
  const handleViewVariant = (img: any) => {
    const format = selectedFormats[img.id] || 'original';
    const size = selectedSizes[img.id] || 'original';
    const url = constructVariantUrl(img, format, size);
    window.open(url, '_blank');
  };

  // Handle downloading variant blob directly
  const handleDownloadVariant = async (img: any) => {
    const format = selectedFormats[img.id] || 'original';
    const size = selectedSizes[img.id] || 'original';
    const url = constructVariantUrl(img, format, size);
    const slugWithExt = getSlugFromUrl(img.url);

    setDownloadingIds(prev => ({ ...prev, [img.id]: true }));
    onNotify('Initiating download...', 'info');

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Network response was not ok');
      const blob = await res.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;

      // Determine file extension and name
      const dotIdx = slugWithExt.lastIndexOf('.');
      const baseName = dotIdx !== -1 ? slugWithExt.substring(0, dotIdx) : slugWithExt;
      const originalExt = dotIdx !== -1 ? slugWithExt.substring(dotIdx + 1) : 'jpg';
      const fileExt = format !== 'original' ? format : originalExt;
      const sizeSuffix = size !== 'original' ? `_${size}` : '';

      a.download = `${baseName}${sizeSuffix}.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      onNotify('Image variant downloaded successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      onNotify(`Download failed: ${err.message}`, 'error');
    } finally {
      setDownloadingIds(prev => ({ ...prev, [img.id]: false }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

      {/* Back Button & Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/collections')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 0',
            marginBottom: '16px',
            transition: 'color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-light)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <FiArrowLeft size={16} /> Back to Collections
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '26px', margin: 0, fontWeight: 800, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiFolder style={{ color: 'var(--primary)' }} /> Collection Images
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              ID: {id}
            </p>
          </div>

          <button
            onClick={fetchCollectionImages}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-light)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
            onMouseOut={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Collection description / statistics */}
        {!loading && (
          <div
            className="glass-panel"
            style={{
              marginTop: '24px',
              padding: '16px 24px',
              display: 'flex',
              gap: '32px',
              background: 'rgba(139, 92, 246, 0.03)',
              borderColor: 'rgba(139, 92, 246, 0.15)'
            }}
          >
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block' }}>
                Total Images
              </span>
              <strong style={{ fontSize: '20px', color: 'var(--text-light)', fontWeight: 700 }}>
                {images.length}
              </strong>
            </div>
            <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block' }}>
                Total Storage Used
              </span>
              <strong style={{ fontSize: '20px', color: 'var(--text-light)', fontWeight: 700 }}>
                {formatBytes(totalStorageSize)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Main content display */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px', color: 'var(--text-muted)' }}>
          <div style={{ animation: 'spin 1s linear infinite' }}><FiRefreshCw size={32} /></div>
          <span>Loading collection images...</span>
        </div>
      ) : images.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <FiImage size={48} style={{ opacity: 0.4 }} />
          <h3 style={{ color: 'var(--text-light)', fontSize: '16px', fontWeight: 600 }}>This collection is empty</h3>
          <p style={{ fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>
            Go to the "Images" tab and select this collection name to upload images into it.
          </p>
        </div>
      ) : (
        <>
          {/* Images Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {paginatedImages.map((img) => {
              const format = selectedFormats[img.id] || 'original';
              const size = selectedSizes[img.id] || 'original';
              const slugWithExt = getSlugFromUrl(img.url);
              const isDownloading = downloadingIds[img.id] || false;

              return (
                <div
                  key={img.id}
                  className="glass-panel"
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Thumbnail Preview container */}
                  <div style={{
                    width: '100%',
                    height: '180px',
                    background: '#040711',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img
                      src={img.url}
                      alt={img.id}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = document.createElement('div');
                          placeholder.style.color = 'var(--text-muted)';
                          placeholder.style.fontSize = '14px';
                          placeholder.innerText = 'No Preview';
                          parent.appendChild(placeholder);
                        }
                      }}
                    />

                    {/* Format/Size Indicator Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(9, 13, 22, 0.75)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--primary-hover)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {slugWithExt.substring(slugWithExt.lastIndexOf('.') + 1).toUpperCase()}
                    </div>
                  </div>

                  {/* Details & Dropdowns */}
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            color: 'var(--text-light)',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px'
                          }}
                          title={img.id}
                        >
                          {img.id.slice(0, 16)}...
                        </span>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(img.url);
                            setCopiedImageId(img.id);
                            onNotify('Image URL copied!', 'success');
                            setTimeout(() => setCopiedImageId(null), 2000);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: copiedImageId === img.id ? 'var(--success)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                          }}
                          title="Copy Original URL"
                        >
                          {copiedImageId === img.id ? <FiCheck size={14} /> : <FiCopy size={13} />}
                        </button>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                        Size: {formatBytes(img.size)}
                      </span>
                    </div>

                    {/* Dropdowns row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Format</label>
                        <select
                          value={format}
                          onChange={(e) => setSelectedFormats(prev => ({ ...prev, [img.id]: e.target.value }))}
                          style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            color: 'var(--text-light)',
                            fontSize: '12px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="original">Original</option>
                          <option value="webp">WebP</option>
                          <option value="png">PNG</option>
                          <option value="jpg">JPG</option>
                          <option value="jpeg">JPEG</option>
                          <option value="avif">AVIF</option>
                          <option value="tiff">TIFF</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Size</label>
                        <select
                          value={size}
                          onChange={(e) => setSelectedSizes(prev => ({ ...prev, [img.id]: e.target.value }))}
                          style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '6px 8px',
                            color: 'var(--text-light)',
                            fontSize: '12px',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="original">Original</option>
                          <option value="sm">SM (320px)</option>
                          <option value="md">MD (640px)</option>
                          <option value="lg">LG (1280px)</option>
                        </select>
                      </div>
                    </div>

                    {/* Action buttons (View / Download) */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                      <button
                        onClick={() => handleViewVariant(img)}
                        style={{
                          flex: 1,
                          background: 'rgba(139, 92, 246, 0.1)',
                          border: '1px solid rgba(139, 92, 246, 0.2)',
                          color: 'var(--primary-hover)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
                        <FiEye size={14} /> View
                      </button>

                      <button
                        onClick={() => handleDownloadVariant(img)}
                        disabled={isDownloading}
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-light)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isDownloading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          if (!isDownloading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onMouseOut={(e) => {
                          if (!isDownloading) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        }}
                      >
                        {isDownloading ? (
                          <>
                            <div style={{ animation: 'spin 1s linear infinite' }}><FiRefreshCw size={14} /></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <FiDownload size={14} /> Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Client-side Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({images.length} images total)
              </span>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-light)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (currentPage > 1) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                  onMouseOut={(e) => { if (currentPage > 1) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                >
                  <FiChevronLeft size={16} /> Previous
                </button>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-light)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { if (currentPage < totalPages) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                  onMouseOut={(e) => { if (currentPage < totalPages) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                >
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
