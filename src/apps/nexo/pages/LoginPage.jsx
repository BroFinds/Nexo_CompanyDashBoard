import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@shared/components/ui/Card';
import Input from '@shared/components/ui/Input';
import Button from '@shared/components/ui/Button';
import api, { setSession } from '@/services/api';
import { useEnabledApps } from '@/shared/context/EnabledAppsContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { setEnabledApps } = useEnabledApps();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password,
      });
      const { apps = [], ...authPayload } = data || {};
      setSession(authPayload);
      setEnabledApps(apps);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Invalid username or password.';
      setError(typeof msg === 'string' ? msg : 'Invalid username or password.');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
    if (error) setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-body)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
             <div style={{ 
                width: '64px', height: '64px', borderRadius: '16px', 
                background: 'linear-gradient(135deg, var(--color-primary), #818cf8)', 
                margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: '800', fontSize: '28px',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
              }}>
                N
             </div>
             <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Welcome Back</h1>
             <p style={{ color: 'var(--color-text-subtle)', marginTop: '8px' }}>Sign in to access your dashboard</p>
        </div>

        <Card padding="xl">
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <Input 
                id="username" 
                label="Username" 
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                required
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <Input 
                id="password" 
                type="password" 
                label="Password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                required
              />
            </div>

            {error && (
              <div style={{ 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px', 
                background: '#fee2e2', 
                color: '#ef4444', 
                border: '1px solid #fecaca',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <Button fullWidth size="lg" disabled={isLoading} style={{ position: 'relative' }}>
              {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                      Connecting to Nexo...
                  </span>
              ) : 'Sign In'}
            </Button>
            
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

          </form>
        </Card>
        
        <p style={{ textAlign: 'center', marginTop: '24px', color: 'var(--color-text-subtle)', fontSize: '0.9rem' }}>
            Protected by BroFinds Security
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
