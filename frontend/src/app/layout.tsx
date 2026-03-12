import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import "../../global.css";

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap' as const,
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'MeetingMind – AI Meeting Intelligence',
    template: '%s | MeetingMind',
  },
  description: 'Upload recorded audio for instant AI summaries or get live transcripts during meetings. Save time, capture every key point effortlessly.',
  keywords: 'meeting transcription, AI meeting notes, audio transcription, meeting summary',
  authors: [{ name: 'MeetingMind Team' }],
  creator: 'MeetingMind',
  themeColor: '#ffffff',
  openGraph: {
    title: 'MeetingMind – AI Meeting Intelligence',
    description: 'Upload recorded audio for instant AI summaries or get live transcripts during meetings.',
    type: 'website',
    siteName: 'MeetingMind',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetingMind – AI Meeting Intelligence',
    description: 'Upload recorded audio for instant AI summaries or get live transcripts during meetings.',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased">
        {/* Noise overlay with proper accessibility */}
        <div
          className="noise-overlay"
          aria-hidden="true"
          role="presentation"
        />
        <main>{children}</main>
      </body>
    </html>
  );
}
