import { useState, useEffect } from 'react';
import {
  FiImage,
  FiSearch,
  FiTrash2,
  FiExternalLink,
  FiDownload,
  FiInfo,
  FiGrid,
  FiList,
  FiUploadCloud,
  FiCopy,
  FiCheck,
  FiX,
  FiServer,
  FiChevronDown,
  FiChevronUp,
  FiSliders
} from 'react-icons/fi';

interface ImagesProps {
  config: {
    baseUrl: string;
    apiKey: string;
  };
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface ImageAsset {
  id: string;
  name: string;
  url: string;
  width?: number;
  height?: number;
  mimeType?: string;
  size: number | string;
  collection?: string;
  date?: string;
  isMock?: boolean;
}

export default function Images({ config, onNotify }: ImagesProps) {
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [collection, setCollection] = useState('pets');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [lastResponse, setLastResponse] = useState<{ status: number; ok: boolean; data: any } | null>(null);
  const [responseCollapsed, setResponseCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showMocks, setShowMocks] = useState(true);

  // Live uploaded images list
  const [uploadedImages, setUploadedImages] = useState<ImageAsset[]>(() => {
    try {
      const saved = localStorage.getItem('pixelvault_uploaded_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync uploaded images to localstorage
  useEffect(() => {
    localStorage.setItem('pixelvault_uploaded_images', JSON.stringify(uploadedImages));
  }, [uploadedImages]);

  // Clean up preview URL when file changes
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  // Premium mock images grid
  const mockImages: ImageAsset[] = [
    { id: 'mock-1', name: 'app_dashboard_v2.png', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80', size: 1258291, mimeType: 'image/png', date: '2 hours ago', collection: 'Product Marketing', width: 1920, height: 1080, isMock: true },
    { id: 'mock-2', name: 'marketing_banner_spring.jpg', url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=600&q=80', size: 2516582, mimeType: 'image/jpeg', date: 'Yesterday', collection: 'Website Assets', width: 1200, height: 630, isMock: true },
    { id: 'mock-3', name: 'avatar_user_jane.webp', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80', size: 145408, mimeType: 'image/webp', date: '3 days ago', collection: 'User Avatars', width: 400, height: 400, isMock: true },
    { id: 'mock-4', name: 'team_photo_retreat.jpg', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80', size: 5033164, mimeType: 'image/jpeg', date: '1 week ago', collection: 'Social Media Posts', width: 2400, height: 1600, isMock: true },
    { id: 'mock-5', name: 'product_showcase_final.png', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80', size: 3250585, mimeType: 'image/png', date: '2 weeks ago', collection: 'App Mockups', width: 1440, height: 900, isMock: true },
    { id: 'mock-6', name: 'blog_cover_coding.jpg', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80', size: 839680, mimeType: 'image/jpeg', date: '2 weeks ago', collection: 'Social Media Posts', width: 1200, height: 800, isMock: true },
  ];

  // Combine live and mock images
  const allImages = [...uploadedImages, ...(showMocks ? mockImages : [])];

  const filteredImages = allImages.filter(img =>
    img.name.toLowerCase().includes(search.toLowerCase()) ||
    (img.collection && img.collection.toLowerCase().includes(search.toLowerCase()))
  );

  // Format bytes helper
  const formatBytes = (bytes: number | string) => {
    if (typeof bytes === 'string') return bytes;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        onNotify('Please select an image file.', 'error');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      onNotify('No image selected for upload.', 'error');
      return;
    }

    if (!config.baseUrl || !config.apiKey) {
      onNotify('Backend configuration missing! Please configure Host and API Key in the Config tab.', 'error');
      return;
    }

    setUploading(true);
    setLastResponse(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('collection', collection);

    const cleanBase = config.baseUrl.trim().replace(/\/$/, '');
    const isLocalBackend = cleanBase === 'http://localhost:3000';
    const targetUrl = isLocalBackend ? '/api/v1/upload' : `${cleanBase}/api/v1/upload`;

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: formData
      });

      const responseText = await res.text();
      let responseJson: any = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = responseText;
      }

      setLastResponse({
        status: res.status,
        ok: res.ok,
        data: responseJson
      });
      setResponseCollapsed(false);

      if (res.ok && responseJson) {
        onNotify('Image uploaded successfully!', 'success');

        // Use the exact response received from the backend dynamically
        const newAsset: ImageAsset = {
          id: responseJson.id || 'live-' + Date.now(),
          name: responseJson.name || selectedFile.name,
          url: responseJson.url || previewUrl || '',
          width: responseJson.width,
          height: responseJson.height,
          mimeType: responseJson.mimeType || selectedFile.type,
          size: responseJson.size !== undefined ? responseJson.size : selectedFile.size,
          collection: responseJson.collection || collection,
          date: 'Just now',
          isMock: false
        };

        setUploadedImages(prev => [newAsset, ...prev]);
        setSelectedFile(null);
      } else {
        onNotify(`Upload failed: Status ${res.status}`, 'error');
      }
    } catch (err: any) {
      console.error(err);
      onNotify(`Network connection error: ${err.message}`, 'error');
      setLastResponse({
        status: 0,
        ok: false,
        data: { error: err.message, message: 'Failed to connect to the backend server. Make sure it is running and CORS is enabled.' }
      });
      setResponseCollapsed(false);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyResponse = () => {
    if (lastResponse) {
      navigator.clipboard.writeText(JSON.stringify(lastResponse.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteImage = async (img: ImageAsset) => {
    if (img.isMock) {
      onNotify('Mock images cannot be deleted from the server.', 'info');
      return;
    }

    if (window.confirm(`Delete image "${img.name}"?`)) {
      if (config.baseUrl && config.apiKey) {
        try {
          const cleanBase = config.baseUrl.trim().replace(/\/$/, '');
          const isLocalBackend = cleanBase === 'http://localhost:3000';
          const deleteUrl = isLocalBackend ? `/api/v1/images/${img.id}` : `${cleanBase}/api/v1/images/${img.id}`;
          const res = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`
            }
          });
          if (res.ok) {
            onNotify('Image deleted from backend.', 'success');
          } else {
            console.warn(`Server returned delete status ${res.status}`);
          }
        } catch (err) {
          console.error('Error attempting to call delete on backend:', err);
        }
      }

      setUploadedImages(prev => prev.filter(item => item.id !== img.id));
      onNotify('Image removed from local list.', 'success');
    }
  };

  const isConfigured = !!config.baseUrl && !!config.apiKey;

  return (
    <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Page Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: 800, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiImage style={{ color: 'var(--primary)' }} /> Upload & Manage Images
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Upload media objects to your storage and verify API response payloads
          </p>
        </div>
      </div>

      {/* Configuration Missing Notice */}
      {!isConfigured && (
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            borderRadius: '12px',
            borderLeft: '4px solid var(--warning)',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '280px', flex: 1 }}>
            <div style={{
              background: 'var(--warning-glow)',
              color: 'var(--warning)',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0
            }}>
              <FiSliders />
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--text-light)', fontSize: '14px', fontWeight: 600 }}>Backend Setup Required</h4>
              <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                Please configure the API location and key in the Config tab before testing uploads.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Tester Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          background: 'rgba(15, 23, 42, 0.4)',
          marginBottom: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-light)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUploadCloud style={{ color: 'var(--primary)' }} /> Image Upload Tester
        </h3>

        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

            {/* File Dropzone Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                flex: 1,
                minWidth: '280px',
                height: '180px',
                border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border)'}`,
                background: dragOver ? 'rgba(139, 92, 246, 0.05)' : 'rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />

              {previewUrl ? (
                <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={previewUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '4px',
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-light)'
                  }} onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedFile(null);
                  }}>
                    <FiX size={14} />
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(15, 23, 42, 0.75)',
                    padding: '6px 12px',
                    fontSize: '11px',
                    color: 'var(--text-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backdropFilter: 'blur(2px)'
                  }}>
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>{selectedFile?.name}</span>
                    <span>{selectedFile && formatBytes(selectedFile.size)}</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', padding: '16px' }}>
                  <FiUploadCloud size={32} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-light)', fontWeight: 500, textAlign: 'center' }}>
                    Drag & Drop image here or <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Browse</span>
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Supports JPEG, PNG, GIF, WebP (Max 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Inputs & Actions */}
            <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label htmlFor="collection-input" style={{ fontSize: '13.5px', color: 'var(--text-light)', fontWeight: 500 }}>
                  Collection Group
                </label>
                <input
                  id="collection-input"
                  type="text"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="e.g. pets"
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text-light)',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--border-focus)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiServer /> Destination: <code style={{ color: 'var(--text-light)' }}>{isConfigured ? `${config.baseUrl.replace(/\/$/, '')}/api/v1/upload` : 'No connection configured'}</code>
                </div>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !isConfigured}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'var(--primary)',
                    color: 'var(--text-light)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: uploading || !selectedFile || !isConfigured ? 'not-allowed' : 'pointer',
                    opacity: selectedFile && isConfigured && !uploading ? 1 : 0.5,
                    transition: 'background-color 0.2s, transform 0.1s',
                  }}
                  onMouseOver={(e) => {
                    if (selectedFile && isConfigured && !uploading) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedFile && isConfigured && !uploading) {
                      e.currentTarget.style.backgroundColor = 'var(--primary)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (selectedFile && isConfigured && !uploading) {
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (selectedFile && isConfigured && !uploading) {
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {uploading ? (
                    <>
                      <div className="spinner" style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      Uploading File...
                    </>
                  ) : (
                    <>
                      <FiUploadCloud size={16} /> Upload Image
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </form>

        {/* CSS for Spinner and Animations */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Collapsible API JSON Response block */}
        {lastResponse && (
          <div
            style={{
              marginTop: '20px',
              borderTop: '1px solid var(--border)',
              paddingTop: '16px',
              animation: 'fadeIn 0.3s ease forwards'
            }}
          >
            <div
              onClick={() => setResponseCollapsed(!responseCollapsed)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: lastResponse.ok ? 'var(--success)' : 'var(--danger)',
                    background: lastResponse.ok ? 'var(--success-glow)' : 'var(--danger-glow)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: `1px solid ${lastResponse.ok ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}
                >
                  HTTP {lastResponse.status}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-light)' }}>
                  Backend API Response JSON
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                {responseCollapsed ? <FiChevronDown size={18} /> : <FiChevronUp size={18} />}
              </div>
            </div>

            {!responseCollapsed && (
              <div style={{ marginTop: '12px', position: 'relative', animation: 'fadeIn 0.2s ease forwards' }}>
                <button
                  onClick={handleCopyResponse}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    color: 'var(--text-light)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                    zIndex: 2,
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  {copied ? (
                    <>
                      <FiCheck style={{ color: 'var(--success)' }} /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy /> Copy
                    </>
                  )}
                </button>
                <pre
                  style={{
                    margin: 0,
                    padding: '16px',
                    background: '#090d16',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#c9d1d9',
                    fontSize: '12px',
                    overflowX: 'auto',
                    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                    lineHeight: '1.5'
                  }}
                >
                  <code>{JSON.stringify(lastResponse.data, null, 2)}</code>
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Asset Explorer Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Toggle between live uploads and mock data */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowMocks(!showMocks)}
            style={{
              background: 'transparent',
              border: `1px solid ${showMocks ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              color: showMocks ? 'var(--text-light)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: showMocks ? 'var(--primary)' : 'var(--text-muted)'
            }} />
            Include Mock Data
          </button>

          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing {filteredImages.length} images ({uploadedImages.length} custom uploads)
          </span>
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
              placeholder="Search images or collections..."
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

      {/* Media Board Grid / List Layout */}
      {filteredImages.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '12px' }}>
          <FiInfo size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '14px' }}>No media assets match your search parameters.</p>
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
                height: '280px',
                border: `1px solid ${img.isMock ? 'var(--border)' : 'rgba(139, 92, 246, 0.25)'}`,
                boxShadow: img.isMock ? 'none' : '0 0 15px rgba(139, 92, 246, 0.05)'
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

                {/* Collection / Live Status Badges */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', flexDirection: 'column', gap: '4px', pointerEvents: 'none' }}>
                  {img.collection && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: 'var(--text-light)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      backdropFilter: 'blur(2px)'
                    }}>
                      {img.collection}
                    </span>
                  )}
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    background: img.isMock ? 'rgba(0, 0, 0, 0.5)' : 'var(--primary)',
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    alignSelf: 'flex-start',
                    boxShadow: img.isMock ? 'none' : '0 0 8px rgba(139, 92, 246, 0.4)'
                  }}>
                    {img.isMock ? 'MOCK' : 'LIVE'}
                  </span>
                </div>

                {/* Resolution Overlay */}
                {img.width && img.height && (
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    fontSize: '9px',
                    fontWeight: 600,
                    background: 'rgba(15, 23, 42, 0.8)',
                    color: 'var(--text-muted)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(2px)'
                  }}>
                    {img.width} × {img.height}
                  </span>
                )}
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
                  <span>{formatBytes(img.size)}</span>
                  <span>{img.date || 'Active'}</span>
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
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: 'var(--text-light)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 500,
                      textDecoration: 'none'
                    }}
                  >
                    <FiExternalLink /> View
                  </a>
                  <a
                    href={img.url}
                    download={img.name}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '6px 10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      color: 'var(--text-light)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Download file"
                  >
                    <FiDownload />
                  </a>
                  <button
                    onClick={() => handleDeleteImage(img)}
                    disabled={img.isMock}
                    style={{
                      padding: '6px 10px',
                      background: img.isMock ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.08)',
                      color: img.isMock ? 'var(--text-muted)' : 'var(--danger)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: img.isMock ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title={img.isMock ? 'Mock files cannot be deleted' : 'Delete asset'}
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
                gap: '16px',
                border: `1px solid ${img.isMock ? 'var(--border)' : 'rgba(139, 92, 246, 0.25)'}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                <img
                  src={img.url}
                  alt={img.name}
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}
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
                  <div style={{ display: 'flex', gap: '6px', marginTop: '2px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{img.mimeType || 'Image'}</span>
                    {img.collection && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                      }}>
                        {img.collection}
                      </span>
                    )}
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 750,
                      background: img.isMock ? 'transparent' : 'var(--primary-hover)',
                      color: img.isMock ? 'var(--text-muted)' : '#fff',
                      padding: img.isMock ? 0 : '1px 5px',
                      borderRadius: '3px',
                    }}>
                      {img.isMock ? 'MOCK' : 'LIVE'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                {img.width && img.height && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{img.width}×{img.height}</span>
                )}
                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>{formatBytes(img.size)}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{img.date || 'Active'}</span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <a href={img.url} target="_blank" rel="noreferrer" style={{ padding: '6px', color: 'var(--text-light)' }} title="Open in new window"><FiExternalLink size={16} /></a>
                  <a href={img.url} download={img.name} target="_blank" rel="noreferrer" style={{ padding: '6px', color: 'var(--text-light)' }} title="Download"><FiDownload size={16} /></a>
                  <button
                    onClick={() => handleDeleteImage(img)}
                    disabled={img.isMock}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '6px',
                      color: img.isMock ? 'rgba(255,255,255,0.05)' : 'var(--danger)',
                      cursor: img.isMock ? 'not-allowed' : 'pointer'
                    }}
                    title="Delete"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
