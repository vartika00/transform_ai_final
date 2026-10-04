'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Sparkles, ChevronDown, LogOut, User, Cpu, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/capture', label: 'Capture' },
    { href: '/studio', label: 'Deliverables' },
    { href: '/slides', label: 'Deck Stage' },
  ];

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push('/');
  };

  return (
    <header className="app-header">
      <Link href="/" className="brand-badge">
        <div className="brand-logo">
          <Zap size={22} />
        </div>
        <div>
          <div className="brand-title">
            <span>TransformAI</span>
            <span className="tag">Edge AI</span>
          </div>
          <div className="brand-subtitle">
            Headless Local AI Engine
          </div>
        </div>
      </Link>

      <nav className="desktop-nav-links">
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href} className={`nav-link${pathname === href ? ' nav-link-active' : ''}`}>
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isAuthenticated && user ? (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpen(v => !v)}
              className="button button-secondary"
              aria-expanded={open}
            >
              <div className="account-avatar">
                {user.avatar}
              </div>
              <div className="account-pill-info">
                <span className="account-pill-name">{user.name.split(' ')[0]}</span>
                <span className="auth-badge">{user.plan}</span>
              </div>
              <motion.span
                whileOpen={{ rotate: 180 }}
                whileClosed={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <ChevronDown size={14} style={{ color: 'var(--label-primary)' }} />
              </motion.span>
            </button>

            <AnimatePresence mode="wait">
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="account-dropdown">
                    <div className="account-dropdown-header">
                      <div className="account-avatar account-avatar-lg">
                        {user.avatar}
                      </div>
                      <div>
                        <div className="account-name">{user.name}</div>
                        <div className="account-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="account-dropdown-status">
                      <div className="pulse-dot" />
                      <span className="account-status-label">Edge Node Active</span>
                    </div>

                    <div className="account-divider" />

                    <Link href="/account" className="account-dropdown-item" onClick={() => setOpen(false)}>
                      <User size={14} />
                      <span>Account & Settings</span>
                    </Link>
                    <Link href="/capture" className="account-dropdown-item" onClick={() => setOpen(false)}>
                      <Sparkles size={14} />
                      <span>New Transformation</span>
                    </Link>

                    <div className="account-divider" />

                    <button className="account-dropdown-item account-dropdown-item-danger" onClick={handleLogout}>
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <>
            <Link 
              href="/login" 
              className="button button-secondary hover-lift"
              style={{ borderRadius: '20px', height: '34px', padding: '0 16px', fontSize: '13px', gap: '6px', background: 'var(--material-window)' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </Link>
            <Link 
              href="/signup" 
              className="button button-primary hover-lift"
              style={{ borderRadius: '20px', height: '34px', padding: '0 16px', fontSize: '13px', gap: '6px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
            >
              <UserPlus size={15} />
              <span>Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
