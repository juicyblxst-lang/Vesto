import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = { title: 'Vesto — Ideas into positions', description: 'Discover investment ideas, build portfolios, and take eligible tokenized assets onchain.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body><Providers>{children}</Providers></body></html>; }
