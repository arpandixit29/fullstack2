import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRemainingTtl } from '../../services/jwtService';
import { ShieldCheck, ShieldAlert, RefreshCw, Copy, Check, X, AlertTriangle } from 'lucide-react';

interface JwtInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JwtInspectorModal: React.FC<JwtInspectorModalProps> = ({ isOpen, onClose }) => {
  const { token, decodedToken, refreshToken, tamperToken, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'header' | 'payload' | 'raw'>('overview');
  const [copied, setCopied] = useState(false);
  const [ttlInfo, setTtlInfo] = useState({ minutes: 0, seconds: 0, text: '0m 00s' });

  useEffect(() => {
    if (!decodedToken?.payload?.exp) return;

    const updateTimer = () => {
      const info = getRemainingTtl(decodedToken.payload.exp);
      setTtlInfo(info);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [decodedToken]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const parts = token ? token.split('.') : [];
  const isValid = decodedToken?.isValid ?? false;
  const isExpired = decodedToken?.isExpired ?? false;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container jwt-inspector-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className={`token-icon-badge ${isValid ? 'valid' : 'invalid'}`}>
              {isValid ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
            </div>
            <div>
              <h3>JWT Security & Token Inspector</h3>
              <p className="modal-subtitle">Live inspection of client-side JSON Web Token payload and claims</p>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className={`status-banner ${isValid ? 'banner-success' : 'banner-danger'}`}>
          <div className="banner-left">
            {isValid ? (
              <>
                <ShieldCheck size={18} />
                <span>JWT Token Validated & Verified (HS256)</span>
              </>
            ) : isExpired ? (
              <>
                <ShieldAlert size={18} />
                <span>JWT Token Expired — Re-authentication Required</span>
              </>
            ) : (
              <>
                <AlertTriangle size={18} />
                <span>Signature Verification Failed — Token Tampered!</span>
              </>
            )}
          </div>
          {isValid && (
            <div className="ttl-pill">
              Remaining TTL: <strong>{ttlInfo.text}</strong>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="inspector-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'header' ? 'active' : ''}`}
            onClick={() => setActiveTab('header')}
          >
            Header (Jose)
          </button>
          <button
            className={`tab-btn ${activeTab === 'payload' ? 'active' : ''}`}
            onClick={() => setActiveTab('payload')}
          >
            Payload (Claims)
          </button>
          <button
            className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            Raw Token (Base64)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="inspector-body">
          {activeTab === 'overview' && (
            <div className="overview-panel">
              <div className="summary-grid">
                <div className="summary-card">
                  <span className="card-label">Authenticated User</span>
                  <span className="card-value">{user?.name || 'N/A'}</span>
                </div>
                <div className="summary-card">
                  <span className="card-label">Assigned Role</span>
                  <span className={`role-badge role-${user?.role}`}>{user?.role?.toUpperCase()}</span>
                </div>
                <div className="summary-card">
                  <span className="card-label">Issued At (iat)</span>
                  <span className="card-value">
                    {decodedToken?.payload?.iat
                      ? new Date(decodedToken.payload.iat * 1000).toLocaleTimeString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="summary-card">
                  <span className="card-label">Expires At (exp)</span>
                  <span className="card-value">
                    {decodedToken?.payload?.exp
                      ? new Date(decodedToken.payload.exp * 1000).toLocaleTimeString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="permissions-chip-box">
                <label>Active Granted Permissions (from JWT payload):</label>
                <div className="chips-container">
                  {user?.permissions.map((p: string) => (
                    <span key={p} className="perm-chip">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'header' && (
            <div className="json-code-box">
              <pre>{JSON.stringify(decodedToken?.header, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="json-code-box">
              <pre>{JSON.stringify(decodedToken?.payload, null, 2)}</pre>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="raw-jwt-container">
              <p className="raw-hint">Standard RFC-7519 3-part encoded string:</p>
              <div className="token-parts-display">
                <span className="token-part part-header">{parts[0]}</span>
                <span className="dot">.</span>
                <span className="token-part part-payload">{parts[1]}</span>
                <span className="dot">.</span>
                <span className="token-part part-signature">{parts[2]}</span>
              </div>
              <div className="token-legend">
                <span className="legend-item header">Header</span>
                <span className="legend-item payload">Payload</span>
                <span className="legend-item signature">Signature</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <div className="footer-left">
            <button className="btn-secondary btn-sm" onClick={() => token && copyToClipboard(token)}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Token'}
            </button>
          </div>
          <div className="footer-right">
            <button className="btn-warning btn-sm" onClick={tamperToken} title="Corrupt signature to test verification failure">
              <AlertTriangle size={14} />
              Test Token Tamper
            </button>
            <button className="btn-primary btn-sm" onClick={refreshToken}>
              <RefreshCw size={14} />
              Renew JWT (Refresh)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
