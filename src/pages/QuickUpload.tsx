import { useState, useCallback, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import {
  FiUploadCloud,
  FiImage,
  FiX,
  FiCopy,
  FiCheck,
  FiLoader,
  FiAlertCircle,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';

/* ──────────────────────────────────────────────────────────
   Types
────────────────────────────────────────────────────────── */
interface UploadResult {
  original: string;
  medium: string;
  thumbnail: string;
}

interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'password';
  required?: boolean;
  hint?: string;
}

/* ──────────────────────────────────────────────────────────
   Constants
────────────────────────────────────────────────────────── */
const FIELDS: FieldConfig[] = [
  { key: 'serviceUrl', label: 'Service URL', placeholder: '/api/v1/qupload', required: true, hint: 'Use a relative path (e.g. /api/v1/qupload) to go through the Vite proxy — entering the backend URL directly will cause CORS errors' },
  { key: 'accessKey', label: 'Access Key', placeholder: 'S3 / R2 access key ID', required: true },
  { key: 'secretKey', label: 'Secret Key', placeholder: 'S3 / R2 secret access key', required: true, type: 'password' },
  { key: 'bucket', label: 'Bucket', placeholder: 'my-bucket', required: true },
  { key: 'endpoint', label: 'Endpoint', placeholder: 'https://your-provider.example.com', required: true, hint: 'S3-compatible provider endpoint (R2, MinIO, etc.)' },
  { key: 'publicUrl', label: 'Public URL Base', placeholder: 'https://cdn.example.com/', required: true, hint: 'Base URL prepended to object keys to form public URLs' },
  { key: 'region', label: 'Region', placeholder: 'us-east-1 (optional)' },
  { key: 'set', label: 'Set (directory)', placeholder: 'image', hint: 'Single top-level folder inside the bucket, defaults to "image"' },
];

const LS_KEY = 'qupload_params';

function loadSaved(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

/* ──────────────────────────────────────────────────────────
   Sub-components
────────────────────────────────────────────────────────── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handle}
      title="Copy URL"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: copied ? 'var(--success)' : 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        padding: '2px 4px',
        borderRadius: '4px',
        transition: 'color 0.2s',
        flexShrink: 0,
      }}
    >
      {copied ? <FiCheck size={13} /> : <FiCopy size={13} />}
    </button>
  );
}

function UrlRow({ label, url }: { label: string; url: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 12px',
      }}
    >
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--primary)',
          minWidth: '72px',
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        style={{
          color: 'var(--text)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}
        title={url}
      >
        {url}
      </a>
      <a href={url} target="_blank" rel="noreferrer" title="Open in new tab" style={{ color: 'var(--text-muted)', display: 'flex', flexShrink: 0 }}>
        <FiExternalLink size={12} />
      </a>
      <CopyButton text={url} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Main Page
────────────────────────────────────────────────────────── */
export default function QuickUpload() {
  const saved = loadSaved();

  const [params, setParams] = useState<Record<string, string>>({
    serviceUrl: saved.serviceUrl || '',
    accessKey: saved.accessKey || '',
    secretKey: saved.secretKey || '',
    bucket: saved.bucket || '',
    endpoint: saved.endpoint || '',
    publicUrl: saved.publicUrl || '',
    region: saved.region || '',
    set: saved.set || '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* persist non-secret params to localStorage */
  const updateParam = (key: string, value: string) => {
    setParams((p) => {
      const next = { ...p, [key]: value };
      const toSave = { ...next };
      delete toSave.secretKey; // never persist secret
      localStorage.setItem(LS_KEY, JSON.stringify(toSave));
      return next;
    });
  };

  const setFileWithPreview = (f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) setFileWithPreview(dropped);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFileWithPreview(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;

    const { serviceUrl, accessKey, secretKey, bucket, endpoint, publicUrl } = params;
    if (!serviceUrl || !accessKey || !secretKey || !bucket || !endpoint || !publicUrl) {
      setError('Service URL, Access Key, Secret Key, Bucket, Endpoint, and Public URL are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('file', file, file.name);
      fd.append('accessKey', accessKey);
      fd.append('secretKey', secretKey);
      fd.append('bucket', bucket);
      fd.append('endpoint', endpoint);
      fd.append('publicUrl', publicUrl);
      if (params.region) fd.append('region', params.region);
      if (params.set) fd.append('set', params.set);

      const res = await fetch(serviceUrl, { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      setResult(data as UploadResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const requiredFields = FIELDS.slice(0, 6); // serviceUrl, accessKey, secretKey, bucket, endpoint, publicUrl
  const advancedFields = FIELDS.slice(6);    // region, set

  return (
    <div
      style={{
        maxWidth: '780px',
        margin: '0 auto',
        padding: '32px 20px 60px',
        animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.35)',
              flexShrink: 0,
            }}
          >
            <FiUploadCloud size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-light)', margin: 0, letterSpacing: '-0.4px' }}>
              Quick Upload
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Upload an image directly to your S3-compatible storage and get back public URLs.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* ── Left column: config ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Required params */}
          <section className="glass-panel" style={{ padding: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Required Parameters
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {requiredFields.map((f) => (
                <FormField key={f.key} field={f} value={params[f.key]} onChange={(v) => updateParam(f.key, v)} />
              ))}
            </div>
          </section>

          {/* Advanced / optional params */}
          <section className="glass-panel" style={{ padding: '20px' }}>
            <button
              onClick={() => setShowAdvanced((s) => !s)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: 0,
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Optional Parameters
              </span>
              {showAdvanced ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>

            {showAdvanced && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                {advancedFields.map((f) => (
                  <FormField key={f.key} field={f} value={params[f.key]} onChange={(v) => updateParam(f.key, v)} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── Right column: drop zone + results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--primary)' : file ? 'rgba(139,92,246,0.3)' : 'var(--border)'}`,
              borderRadius: '14px',
              background: dragging
                ? 'rgba(139, 92, 246, 0.06)'
                : file
                ? 'rgba(139, 92, 246, 0.03)'
                : 'var(--bg-card)',
              backdropFilter: 'blur(12px)',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: file ? 'default' : 'pointer',
              transition: 'all 0.25s ease',
              position: 'relative',
              overflow: 'hidden',
              padding: '16px',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxHeight: '140px',
                    maxWidth: '100%',
                    borderRadius: '8px',
                    objectFit: 'contain',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                />
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600, margin: 0 }}>{file!.name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {(file!.size / 1024).toFixed(1)} KB — {file!.type}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.5)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <FiX size={12} />
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: dragging ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    transition: 'background 0.25s',
                  }}
                >
                  <FiImage size={22} color={dragging ? 'var(--primary)' : 'var(--text-muted)'} />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-light)', margin: 0 }}>
                  {dragging ? 'Drop it!' : 'Drop an image here'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  or <span style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}>click to browse</span>
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '8px 0 0' }}>
                  Max 30 MB · JPG, PNG, WEBP, AVIF, HEIC…
                </p>
              </>
            )}
          </div>

          {/* Upload button */}
          <button
            id="quick-upload-submit"
            disabled={!file || loading}
            onClick={handleSubmit}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              background: !file || loading
                ? 'rgba(139, 92, 246, 0.25)'
                : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: !file || loading ? 'var(--text-muted)' : '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: !file || loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: !file || loading ? 'none' : '0 0 20px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.25s ease',
              letterSpacing: '0.02em',
            }}
          >
            {loading ? (
              <>
                <FiLoader size={16} className="animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <FiUploadCloud size={16} />
                Upload Image
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px',
                animation: 'fadeIn 0.3s ease forwards',
              }}
            >
              <FiAlertCircle size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: 'var(--danger)', margin: 0, lineHeight: 1.5 }}>{error}</p>
            </div>
          )}

          {/* Result URLs */}
          {result && (
            <div
              className="glass-panel"
              style={{ padding: '18px', animation: 'fadeIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <FiCheck size={15} color="var(--success)" />
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)', margin: 0 }}>
                  Upload Successful
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <UrlRow label="Original" url={result.original} />
                <UrlRow label="Medium" url={result.medium} />
                <UrlRow label="Thumb" url={result.thumbnail} />
              </div>

              {/* Preview thumbnails */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                {[
                  { label: 'Original', url: result.original },
                  { label: 'Medium', url: result.medium },
                  { label: 'Thumb', url: result.thumbnail },
                ].map(({ label, url }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ flex: 1, display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}
                    title={`${label} — open full size`}
                  >
                    <img
                      src={url}
                      alt={label}
                      style={{ width: '100%', height: '60px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {label}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   FormField helper
────────────────────────────────────────────────────────── */
function FormField({ field, value, onChange }: { field: FieldConfig; value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        htmlFor={`qup-${field.key}`}
        style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', letterSpacing: '0.05em' }}
      >
        {field.label}
        {field.required && <span style={{ color: 'var(--primary)', marginLeft: '3px' }}>*</span>}
      </label>
      <input
        id={`qup-${field.key}`}
        type={field.type || 'text'}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          padding: '9px 12px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border)'}`,
          color: 'var(--text-light)',
          fontSize: '13px',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(139,92,246,0.12)' : 'none',
          fontFamily: field.key.includes('Key') || field.key === 'endpoint' || field.key === 'publicUrl' || field.key === 'serviceUrl'
            ? 'var(--font-mono)'
            : 'var(--font-sans)',
        }}
        autoComplete={field.type === 'password' ? 'current-password' : 'off'}
        spellCheck={false}
      />
      {field.hint && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.4 }}>{field.hint}</p>
      )}
    </div>
  );
}
