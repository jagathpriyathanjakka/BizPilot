import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BizPilot AI — One Business. Multiple AI Agents. Zero Manual Chaos.',
  description: 'AI-powered, multi-business management SaaS platform with business-specific workflows and multi-agent intelligence.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy-950 text-slate-100 min-h-screen selection:bg-violet-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
