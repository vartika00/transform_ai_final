'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mic, FileText, Presentation } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview', icon: Home },
    { href: '/capture', label: 'Capture', icon: Mic },
    { href: '/studio', label: 'Deliverables', icon: FileText },
    { href: '/slides', label: 'Deck Stage', icon: Presentation },
  ];

  return (
    <nav className="tab-bar" aria-label="Mobile Navigation">
      <div className="tab-bar-content">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: isActive ? 1 : 0.6, scale: isActive ? 1 : 0.95 }}
                animate={{ opacity: isActive ? 1 : 0.6, scale: isActive ? 1 : 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="tab-bar-icon">
                  <Icon size={19} />
                </div>
                <span className="tab-bar-label" data-active={isActive.toString()}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
