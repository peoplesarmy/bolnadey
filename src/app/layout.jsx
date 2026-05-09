// src/app/layout.jsx
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CursorEffect from '@/components/CursorEffect';

export const metadata = {
  title: { default: 'Bolna Dey — Let the People Speak', template: '%s | Bolna Dey' },
  description: "Nepal's independent civic-tech and media platform for government accountability, investigative journalism, and public participation.",
  keywords: ['Nepal', 'journalism', 'government', 'accountability', 'civic', 'corruption'],
  openGraph: {
    siteName: 'Bolna Dey',
    type: 'website',
  },
  icons: {
    icon: '/bolnadey-sarkar.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CursorEffect />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
