import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication failed.');
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(quickEmail, quickPass);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMessage(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="login-screen-container">
      <div className="login-card-frame">
        {/* Header Branding */}
        <div className="login-header">
          <div className="login-brand-badge">
            <Shield size={28} className="brand-icon-animated" />
          </div>
          <h2>Enterprise RBAC Auth Portal</h2>
          <p>Stateless JWT authentication & Role-Based Access Control demo</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-error-alert">
            <ShieldAlert size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="name@system.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit-login" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner-sm"></span>
            ) : (
              <>
                <span>Sign In & Generate JWT Token</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Accounts Section */}
        <div className="quick-accounts-section">
          <div className="divider-line">
            <span>OR LOGIN WITH PRE-CONFIGURED DEMO ACCOUNTS</span>
          </div>

          <div className="quick-accounts-grid">
            <button
              className="quick-card card-admin"
              onClick={() => handleQuickLogin('admin@system.io', 'Admin@123')}
            >
              <div className="card-top">
                <span className="quick-role-badge role-admin">ADMIN</span>
                <CheckCircle2 size={14} />
              </div>
              <div className="quick-name">Eleanor Vance</div>
              <div className="quick-email">admin@system.io</div>
              <div className="quick-desc">Full system & user access</div>
            </button>

            <button
              className="quick-card card-editor"
              onClick={() => handleQuickLogin('editor@system.io', 'Editor@123')}
            >
              <div className="card-top">
                <span className="quick-role-badge role-editor">EDITOR</span>
                <CheckCircle2 size={14} />
              </div>
              <div className="quick-name">Marcus Holloway</div>
              <div className="quick-email">editor@system.io</div>
              <div className="quick-desc">Create & edit content</div>
            </button>

            <button
              className="quick-card card-viewer"
              onClick={() => handleQuickLogin('viewer@system.io', 'Viewer@123')}
            >
              <div className="card-top">
                <span className="quick-role-badge role-viewer">VIEWER</span>
                <CheckCircle2 size={14} />
              </div>
              <div className="quick-name">Sophia Chen</div>
              <div className="quick-email">viewer@system.io</div>
              <div className="quick-desc">Read-only dashboard view</div>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="login-footer-note">
          <KeyRound size={14} />
          <span>Stateless HS256 JWT Signed Claims with Expiration & RBAC Enforcement</span>
        </div>
      </div>
    </div>
  );
};
