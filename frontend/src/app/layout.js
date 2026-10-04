import './globals.css';
import './apple-design.css';
import { AuthProvider } from '../context/AuthContext';
import Header from '../components/Header';
import AppLifecycleHandler from '../components/AppLifecycleHandler';

export const metadata = {
  title: 'TransformAI | Edge Productivity Engine',
  description: 'One voice memo to four finished deliverables in under 60 seconds.',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#eef1f6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <AppLifecycleHandler />
          <div className="app-shell">
          <Header />

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </div>
        </AuthProvider>
      </body>
    </html>
  );
}

