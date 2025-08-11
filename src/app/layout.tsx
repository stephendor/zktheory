import '../css/main.css';
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ZKTheory',
  description: 'Mathematics, cryptography, and visualization tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Add global meta tags, favicon, etc. here */}
      </head>
      <body>
        {/* Global providers/components can be added here */}
        {children}
      </body>
    </html>
  );
}
